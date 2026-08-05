import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Server-side Expo push for admin pause/quit alerts.
 * Invoked by a DB trigger (pg_net) whenever admin_hold_alerts gets a new row.
 *
 * Auth: shared secret header x-oncosmart-dispatch-secret (not end-user JWT).
 */

type Body = {
  alertId?: string;
  title?: string;
  body?: string;
  holdType?: string;
  patientName?: string;
  patientUsername?: string;
  reason?: string | null;
};

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  priority?: "high";
  channelId?: string;
  data: Record<string, string>;
};

const DISPATCH_SECRET = "oncosmart-hold-push-v1-7f3c9e2a4b8d";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const provided = req.headers.get("x-oncosmart-dispatch-secret") ?? "";
    if (!provided || provided !== DISPATCH_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500,
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

    const title =
      typeof payload.title === "string" && payload.title.trim()
        ? payload.title.trim()
        : "Patient update";
    const body =
      typeof payload.body === "string" && payload.body.trim()
        ? payload.body.trim()
        : "A patient paused or quit.";
    const holdType = payload.holdType === "quit" ? "quit" : "pause";

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: rows, error: tokenError } = await admin
      .from("admin_push_tokens")
      .select("expo_push_token");
    if (tokenError) {
      return new Response(
        JSON.stringify({ ok: false, sent: 0, error: tokenError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
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
        JSON.stringify({ ok: true, sent: 0, reason: "no_admin_tokens" }),
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
        alertId: typeof payload.alertId === "string" ? payload.alertId : "",
        patientName: typeof payload.patientName === "string" ? payload.patientName : "",
        patientUsername:
          typeof payload.patientUsername === "string" ? payload.patientUsername : "",
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
      if (pushRes.ok) sent += chunk.length;
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
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
