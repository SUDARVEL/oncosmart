import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

type Purpose = "bind" | "reset";

type Body = {
  action?: string;
  username?: string;
  email?: string;
  code?: string;
  password?: string;
  language?: string;
};

const ACCOUNT_DOMAIN = "oncosmart.app";
const CODE_TTL_MS = 10 * 60 * 1000;
const MIN_GAP_MS = 60 * 1000;

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/@.*$/, "");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.toLowerCase().endsWith(`@${ACCOUNT_DOMAIN}`);
}

async function hashCode(userId: string, purpose: Purpose, email: string, code: string) {
  const bytes = new TextEncoder().encode(`${userId}|${purpose}|${email}|${code}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0]! % 1000000).padStart(6, "0");
}

async function findAuthUser(
  admin: ReturnType<typeof createClient>,
  username: string,
) {
  const target = `${username}@${ACCOUNT_DOMAIN}`;
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((user) => (user.email ?? "").toLowerCase() === target);
    if (found) return found;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function sendMail(
  admin: ReturnType<typeof createClient>,
  to: string,
  code: string,
  language: string,
) {
  const { data, error } = await admin
    .from("mailer_settings")
    .select("smtp_login, smtp_secret, sender_email, sender_name")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data?.smtp_secret) {
    throw new Error("mailer_not_configured");
  }

  const tamil = language === "ta";
  const subject = tamil ? "Oncosmart கடவுச்சொல் குறியீடு" : "Your Oncosmart code";
  const text = tamil
    ? `உங்கள் குறியீடு ${code}. இது 10 நிமிடங்களில் முடிவடையும்.\n\nநீங்கள் இதை கேட்கவில்லை என்றால் இந்த மின்னஞ்சலை புறக்கணிக்கவும். Spam கோப்புறையையும் பார்க்கவும்.`
    : `Your code is ${code}. It expires in 10 minutes.\n\nIf you did not ask for this, ignore this email. Also check your Spam folder.`;

  const client = new SMTPClient({
    connection: {
      hostname: "smtp-relay.brevo.com",
      port: 465,
      tls: true,
      auth: {
        username: data.smtp_login as string,
        password: data.smtp_secret as string,
      },
    },
  });
  try {
    await client.send({
      from: `${data.sender_name} <${data.sender_email}>`,
      to,
      subject,
      content: text,
    });
  } finally {
    await client.close();
  }
}

async function issueCode(
  admin: ReturnType<typeof createClient>,
  userId: string,
  purpose: Purpose,
  email: string,
  language: string,
) {
  const since = new Date(Date.now() - MIN_GAP_MS).toISOString();
  const { data: recent } = await admin
    .from("password_reset_codes")
    .select("id")
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .gt("created_at", since)
    .limit(1);
  if (recent && recent.length > 0) {
    return json(429, { ok: false, error: "rate_limit" });
  }

  const code = randomCode();
  const codeHash = await hashCode(userId, purpose, email, code);
  const { error: insertError } = await admin.from("password_reset_codes").insert({
    user_id: userId,
    purpose,
    email,
    code_hash: codeHash,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (insertError) {
    return json(500, { ok: false, error: "mail_failed" });
  }

  try {
    await sendMail(admin, email, code, language);
  } catch (error) {
    console.warn("[password-recovery] send failed", error instanceof Error ? error.message : "error");
    return json(502, { ok: false, error: "mail_failed" });
  }
  return json(200, { ok: true });
}

async function consumeCode(
  admin: ReturnType<typeof createClient>,
  userId: string,
  purpose: Purpose,
  email: string,
  code: string,
) {
  const { data: rows, error } = await admin
    .from("password_reset_codes")
    .select("id, code_hash, expires_at, used_at")
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .eq("email", email)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error || !rows?.[0]) return "bad_code" as const;
  const row = rows[0];
  if (new Date(row.expires_at as string).getTime() < Date.now()) return "expired" as const;
  const expected = await hashCode(userId, purpose, email, code);
  if (expected !== row.code_hash) return "bad_code" as const;
  await admin
    .from("password_reset_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", row.id);
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "method" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return json(500, { ok: false, error: "mail_failed" });

  const admin = createClient(supabaseUrl, serviceKey);
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { ok: false, error: "bad_code" });
  }

  const action = body.action ?? "";
  const language = body.language === "ta" ? "ta" : "en";
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";

  try {
    if (action === "bind_send" || action === "bind_confirm") {
      const { data: userData, error: userError } = await admin.auth.getUser(jwt);
      if (userError || !userData.user) return json(401, { ok: false, error: "unauthorized" });
      const email = (body.email ?? "").trim().toLowerCase();
      if (!isEmail(email)) return json(400, { ok: false, error: "invalid_email" });

      if (action === "bind_send") {
        return await issueCode(admin, userData.user.id, "bind", email, language);
      }

      const code = (body.code ?? "").replace(/\D/g, "");
      if (code.length !== 6) return json(400, { ok: false, error: "bad_code" });
      const failed = await consumeCode(admin, userData.user.id, "bind", email, code);
      if (failed) return json(400, { ok: false, error: failed });

      const { data: existing } = await admin
        .from("patients")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (!existing?.id) {
        await admin.from("patients").insert({ user_id: userData.user.id, recovery_email: email });
      } else {
        const { error: updateError } = await admin
          .from("patients")
          .update({ recovery_email: email })
          .eq("user_id", userData.user.id);
        if (updateError) return json(500, { ok: false, error: "mail_failed" });
      }
      return json(200, { ok: true });
    }

    if (action === "reset_send" || action === "reset_confirm") {
      const username = normalizeUsername(body.username ?? "");
      if (!username) return json(400, { ok: false, error: "invalid_username" });
      const user = await findAuthUser(admin, username);
      if (!user) return json(404, { ok: false, error: "unknown_user" });

      const { data: patient } = await admin
        .from("patients")
        .select("recovery_email")
        .eq("user_id", user.id)
        .maybeSingle();
      const recovery = ((patient?.recovery_email as string | null) ?? "").trim().toLowerCase();
      if (!isEmail(recovery)) return json(400, { ok: false, error: "no_email" });

      if (action === "reset_send") {
        return await issueCode(admin, user.id, "reset", recovery, language);
      }

      const code = (body.code ?? "").replace(/\D/g, "");
      const password = body.password ?? "";
      if (code.length !== 6) return json(400, { ok: false, error: "bad_code" });
      if (password.length < 8) return json(400, { ok: false, error: "weak_password" });
      const failed = await consumeCode(admin, user.id, "reset", recovery, code);
      if (failed) return json(400, { ok: false, error: failed });
      const { error: passwordError } = await admin.auth.admin.updateUserById(user.id, { password });
      if (passwordError) return json(500, { ok: false, error: "mail_failed" });
      return json(200, { ok: true });
    }

    return json(400, { ok: false, error: "bad_code" });
  } catch (error) {
    console.warn("[password-recovery]", error instanceof Error ? error.message : "error");
    return json(500, { ok: false, error: "mail_failed" });
  }
});
