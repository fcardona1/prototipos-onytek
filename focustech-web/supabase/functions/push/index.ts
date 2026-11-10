// FOCUSTECH · función "push": envía el aviso al celular de Andrés cuando entra un pedido.
// Se pega en Supabase > Edge Functions > Deploy a new function (nombre: push). Desarrollado por Onytek.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

webpush.setVapidDetails("mailto:fcardona@onytek.co", Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.headers.get("x-push-secret") !== Deno.env.get("PUSH_SECRET")) return new Response("no autorizado", { status: 401 });
  const n = await req.json().catch(() => ({}));
  const payload = JSON.stringify({
    title: String(n.title || "Nuevo pedido").slice(0, 80),
    body: String(n.body || "Abre el panel para verlo").slice(0, 160),
    id: n.id || 0,
    url: "./#panel",
  });
  const { data: subs } = await db.from("push_subs").select("endpoint,sub");
  let ok = 0;
  await Promise.all((subs || []).map(async (r) => {
    try {
      await webpush.sendNotification(r.sub, payload, { TTL: 86400, urgency: "high" });
      ok++;
    } catch (e) {
      // 404/410 = el dispositivo ya no existe (desinstalaron la app): se borra
      if (e?.statusCode === 404 || e?.statusCode === 410) await db.from("push_subs").delete().eq("endpoint", r.endpoint);
    }
  }));
  return new Response(JSON.stringify({ enviados: ok }), { headers: { "Content-Type": "application/json" } });
});
