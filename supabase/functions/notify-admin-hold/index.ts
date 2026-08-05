import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Body = {
  holdType?: string;
  reason?: string | null;
  patientName?: string;
  patientUsername?: string;
};

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: Record<string, string>;
  channelId?: string;
};

function reasonLabel(reason: string | null | undefined): string {
  switch (reason) {
    case "tired":
      return "Feeling tired";
    case "pain":
      return "Having pain";
    case "treatment":
      return "Recently underwent treatment";
    case "unwell":
      return "Not feeling well";
    default:
      return typeof reason === "string" && reason.trim() ? reason.trim() : "No reason given";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const holdType = payload.holdType === "quit" ? "quit" : payload.holdType === "pause" ? "pause" : null;
  if (!holdType) {
    return new Response(JSON.stringify({ error: "holdType must be pause or quit" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const email = userData.user.email ?? "";
  const usernameFromAuth = email.includes("@") ? email.split("@")[0] : email;
  const patientUsername =
    typeof payload.patientUsername === "string" && payload.patientUsername.trim()
      ? payload.patientUsername.trim()
      : usernameFromAuth || "patient";
  const patientName =
    typeof payload.patientName === "string" && payload.patientName.trim()
      ? payload.patientName.trim()
      : patientUsername;
  const reasonText = reasonLabel(payload.reason);
  const actionWord = holdType === "quit" ? "quit" : "paused";
  const title = holdType === "quit" ? "Patient quit exercise" : "Patient paused exercise";
  const body = `${patientName} (${patientUsername}) has ${actionWord}. Reason: ${reasonText}.`;

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: rows, error: tokenError } = await admin
    .from("admin_push_tokens")
    .select("expo_push_token");

  if (tokenError) {
    return new Response(JSON.stringify({ error: tokenError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tokens = Array.from(
    new Set(
      (rows ?? [])
        .map((r) => (typeof r.expo_push_token === "string" ? r.expo_push_token.trim() : ""))
        .filter((t) => t.startsWith("ExponentPushToken")),
    ),
  );

  if (tokens.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no_admin_tokens" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages: ExpoMessage[] = tokens.map((to) => ({
    to,
    title,
    body,
    sound: "default",
    channelId: "admin-alerts",
    data: {
      type: "patient_hold",
      holdType,
      patientUsername,
      patientName,
      reason: typeof payload.reason === "string" ? payload.reason : "",
    },
  }));

  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const pushRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chunk),
    });
    if (pushRes.ok) {
      sent += chunk.length;
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
