import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Body = {
  holdType?: string;
  reason?: string | null;
  patientName?: string;
  patientUsername?: string;
  title?: string;
  body?: string;
  alertId?: string | null;
};

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: Record<string, string>;
  channelId?: string;
  priority?: "high";
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
    case "exploring":
      return "Just exploring";
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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
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
    const jwt = authHeader.slice("Bearer ".length).trim();
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate JWT with service role — do not depend on anon-key env vars.
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: userData, error: userError } = await admin.auth.getUser(jwt);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          detail: userError?.message ?? "invalid jwt",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
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

    const holdType =
      payload.holdType === "quit" ? "quit" : payload.holdType === "pause" ? "pause" : null;
    if (!holdType) {
      return new Response(JSON.stringify({ error: "holdType must be pause or quit" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email = userData.user.email ?? "";
    const usernameFromAuth = email.includes("@") ? email.split("@")[0]! : email;
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
    const title =
      typeof payload.title === "string" && payload.title.trim()
        ? payload.title.trim()
        : holdType === "quit"
          ? "Patient quit exercise"
          : "Patient paused exercise";
    const body =
      typeof payload.body === "string" && payload.body.trim()
        ? payload.body.trim()
        : `${patientName} (${patientUsername}) has ${actionWord}. Reason: ${reasonText}.`;

    // Alert rows are normally created by the patients trigger / client insert.
    // Keep a soft insert here so push still works if those paths missed.
    let alertSaved = Boolean(payload.alertId);
    if (!payload.alertId) {
      const { error: insertError } = await admin.from("admin_hold_alerts").insert({
        patient_user_id: userData.user.id,
        patient_name: patientName,
        patient_username: patientUsername,
        hold_type: holdType,
        reason: typeof payload.reason === "string" ? payload.reason : null,
        title,
        body,
      });
      alertSaved = !insertError;
    }

    const { data: rows, error: tokenError } = await admin
      .from("admin_push_tokens")
      .select("expo_push_token");
    if (tokenError) {
      return new Response(
        JSON.stringify({
          ok: true,
          sent: 0,
          reason: "token_query_failed",
          detail: tokenError.message,
          alertSaved,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const tokens = Array.from(
      new Set(
        (rows ?? [])
          .map((r) => (typeof r.expo_push_token === "string" ? r.expo_push_token.trim() : ""))
          .filter((t) => t.startsWith("ExponentPushToken")),
      ),
    );

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          sent: 0,
          reason: "no_admin_tokens",
          alertSaved,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const messages: ExpoMessage[] = tokens.map((to) => ({
      to,
      title,
      body,
      sound: "default",
      priority: "high",
      channelId: "admin-alerts",
      data: {
        type: "patient_hold",
        holdType,
        patientUsername,
        patientName,
        reason: typeof payload.reason === "string" ? payload.reason : "",
        alertId: typeof payload.alertId === "string" ? payload.alertId : "",
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
      if (pushRes.ok) sent += chunk.length;
    }

    return new Response(JSON.stringify({ ok: true, sent, alertSaved }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
