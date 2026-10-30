import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

/**
 * Supabase Auth "Send SMS" hook.
 * Auth creates the 6-digit code. This function only delivers that same code
 * through MSG91, which is the practical route for Indian mobiles.
 *
 * Secrets (set on the function, never in the app):
 * - SEND_SMS_HOOK_SECRET  from Authentication → Hooks → Send SMS
 * - MSG91_AUTH_KEY
 * - MSG91_TEMPLATE_ID
 * - MSG91_OTP_VAR         optional, defaults to var1. Must match the template variable.
 * - MSG91_SENDER_ID       optional 6-letter DLT sender, such as ONCOSM
 */

type HookUser = { phone?: string };
type HookSms = { otp?: string };

function json(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: { http_code: status, message } }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

function hookSecrets(): string[] {
  const raw = Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "";
  return raw
    .split("|")
    .map((part) => part.trim().replace(/^v1,whsec_/, ""))
    .filter((part) => part.length > 0);
}

function verifyPayload(payload: string, headers: Record<string, string>): { user: HookUser; sms: HookSms } {
  const secrets = hookSecrets();
  if (secrets.length === 0) {
    throw new Error("SMS hook secret is not set");
  }
  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return new Webhook(secret).verify(payload, headers) as { user: HookUser; sms: HookSms };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("SMS hook signature did not match");
}

function toMsg91Mobile(phone: string): string {
  return phone.replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json(405, "Method not allowed");
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let user: HookUser;
  let sms: HookSms;
  try {
    const verified = verifyPayload(payload, headers);
    user = verified.user;
    sms = verified.sms;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify the SMS hook";
    console.error("[send-sms] verify failed", message);
    return json(401, message);
  }

  const mobile = toMsg91Mobile(user.phone ?? "");
  const otp = (sms.otp ?? "").trim();
  if (!/^91\d{10}$/.test(mobile) || !/^\d{4,10}$/.test(otp)) {
    return json(400, "The phone number or code was not usable");
  }

  const authKey = Deno.env.get("MSG91_AUTH_KEY") ?? "";
  const templateId = Deno.env.get("MSG91_TEMPLATE_ID") ?? "";
  const otpVar = (Deno.env.get("MSG91_OTP_VAR") ?? "var1").trim() || "var1";
  const senderId = (Deno.env.get("MSG91_SENDER_ID") ?? "").trim();
  if (!authKey || !templateId) {
    console.error("[send-sms] MSG91 auth key or template id is missing");
    return json(500, "SMS is not configured yet");
  }

  const body: Record<string, unknown> = {
    template_id: templateId,
    recipients: [{ mobiles: mobile, [otpVar]: otp }],
  };
  if (senderId) body.sender = senderId;

  let provider: { type?: string; message?: string; request_id?: string; code?: string | number };
  let providerStatus = 0;
  try {
    const response = await fetch("https://control.msg91.com/api/v5/flow", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify(body),
    });
    providerStatus = response.status;
    provider = await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "MSG91 request failed";
    console.error("[send-sms] MSG91 request failed", message);
    return json(502, "The text could not be sent");
  }

  const failed =
    providerStatus < 200 ||
    providerStatus >= 300 ||
    provider.type === "error" ||
    String(provider.code ?? "") === "201";
  if (failed) {
    console.error("[send-sms] MSG91 rejected the text", providerStatus, provider.message ?? provider.type ?? "");
    return json(502, "The text could not be sent");
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
