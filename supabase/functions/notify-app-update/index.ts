import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Body = {
  updateId?: string;
  title?: string;
  body?: string;
};

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: Record<string, string>;
  channelId?: string;
};

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

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Require a logged-in patient JWT (or service) so this isn't a public spam endpoint.
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

  const updateId = typeof payload.updateId === "string" ? payload.updateId.trim() : "";
  if (!updateId) {
    return new Response(JSON.stringify({ error: "updateId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : "ONCOSMART update ready";
  const body =
    typeof payload.body === "string" && payload.body.trim()
      ? payload.body.trim()
      : "A new version is ready. Open the app and pull down to refresh.";

  const admin = createClient(supabaseUrl, serviceKey);

  // Idempotent: only one broadcast per update id.
  const { error: insertError } = await admin.from("app_update_broadcasts").insert({
    update_id: updateId,
    recipient_count: 0,
  });

  if (insertError) {
    // Already broadcast (unique violation) — treat as success.
    if (insertError.code === "23505") {
      return new Response(JSON.stringify({ ok: true, alreadySent: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: rows, error: tokenError } = await admin
    .from("patients")
    .select("expo_push_token")
    .not("expo_push_token", "is", null);

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
    await admin
      .from("app_update_broadcasts")
      .update({ recipient_count: 0 })
      .eq("update_id", updateId);
    return new Response(JSON.stringify({ ok: true, sent: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages: ExpoMessage[] = tokens.map((to) => ({
    to,
    title,
    body,
    sound: "default",
    channelId: "app-updates",
    data: { type: "app_update", updateId },
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

  await admin
    .from("app_update_broadcasts")
    .update({ recipient_count: sent })
    .eq("update_id", updateId);

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
