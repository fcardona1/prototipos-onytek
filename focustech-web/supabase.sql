-- =====================================================================
-- FOCUSTECH · base de datos real (Supabase)  ·  Desarrollado por Onytek
-- Pega TODO este archivo en Supabase > SQL Editor > New query > Run.
-- Se puede ejecutar más de una vez sin dañar nada.
-- =====================================================================

-- ---------- Tablas ----------
create table if not exists public.store (
  k text primary key,                 -- products, combos, deal, coupons, cities, shop, vendors, vprices, stats, secrets, vendors_full
  v jsonb not null default 'null'::jsonb,
  pub boolean not null default false, -- true = lo ve cualquier visitante de la tienda
  updated_at timestamptz not null default now()
);
create table if not exists public.stock (
  pid bigint primary key,
  n integer not null default 0
);
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.notifs (
  id bigint primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.citas (
  id bigint generated always as identity primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.config (
  k text primary key,
  v text
);

-- ---------- Quién es quién (el rol vive en el token, el usuario no lo puede cambiar) ----------
create or replace function public.is_staff() returns boolean
language sql stable as $$
  select coalesce(auth.jwt()->'app_metadata'->>'role','') in ('owner','admin')
$$;
create or replace function public.my_vendor() returns text
language sql stable as $$
  select auth.jwt()->'app_metadata'->>'vendor'
$$;

-- ---------- Seguridad por filas (RLS) ----------
alter table public.store  enable row level security;
alter table public.stock  enable row level security;
alter table public.orders enable row level security;
alter table public.notifs enable row level security;
alter table public.citas  enable row level security;
alter table public.config enable row level security;

drop policy if exists store_read   on public.store;
drop policy if exists store_staff  on public.store;
create policy store_read  on public.store for select using (pub or public.is_staff());
create policy store_staff on public.store for all    using (public.is_staff()) with check (public.is_staff());

drop policy if exists stock_read  on public.stock;
drop policy if exists stock_staff on public.stock;
create policy stock_read  on public.stock for select using (true);
create policy stock_staff on public.stock for all    using (public.is_staff()) with check (public.is_staff());

drop policy if exists orders_read  on public.orders;
drop policy if exists orders_staff on public.orders;
create policy orders_read  on public.orders for select using (public.is_staff() or (public.my_vendor() is not null and data->'vend'->>'code' = public.my_vendor()));
create policy orders_staff on public.orders for all    using (public.is_staff()) with check (public.is_staff());

drop policy if exists notifs_staff on public.notifs;
create policy notifs_staff on public.notifs for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists citas_staff on public.citas;
create policy citas_staff on public.citas for all using (public.is_staff()) with check (public.is_staff());
-- config: sin políticas = nadie desde la web (solo funciones internas)

-- ---------- Funciones que usa la tienda ----------
-- Un cliente hace un pedido (no puede leer pedidos de otros, solo crear el suyo)
create or replace function public.place_order(o jsonb, msg text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare nid bigint; it jsonb; code text;
begin
  if o is null or jsonb_typeof(o->'items') <> 'array' or jsonb_array_length(o->'items') = 0 then
    raise exception 'pedido vacío';
  end if;
  insert into orders(data) values (o) returning id into nid;
  update orders set data = jsonb_set(data,'{id}',to_jsonb(nid)) where id = nid;
  for it in select * from jsonb_array_elements(o->'items') loop
    update stock set n = greatest(0, n - coalesce((it->>'q')::int,0)) where pid = (it->>'id')::bigint;
  end loop;
  code := nullif(o->>'coupon','');
  if code is not null then
    update store set v = (select jsonb_agg(case when c->>'code' = code then jsonb_set(c,'{uses}',to_jsonb(coalesce((c->>'uses')::int,0)+1)) else c end) from jsonb_array_elements(v) c)
    where k = 'coupons' and jsonb_typeof(v) = 'array';
  end if;
  insert into notifs(id,data) values (nid, jsonb_build_object(
    'id',nid,'t',(extract(epoch from now())*1000)::bigint,'read',false,'wa',false,
    'msg',replace(coalesce(msg,''),'{ID}',nid::text),
    'vend',jsonb_exists(o,'vend'),'cli',o->>'cli','total',coalesce((o->>'total')::numeric,0),'city',o->>'city'));
  return jsonb_build_object('id',nid);
end $$;

-- Un cliente pide cita en el Showroom
create or replace function public.add_cita(c jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into citas(data) values (jsonb_build_object(
    'cli',left(coalesce(c->>'cli',''),120),'tel',left(coalesce(c->>'tel',''),40),'fecha',left(coalesce(c->>'fecha',''),20),
    'franja',left(coalesce(c->>'franja',''),60),'prod',left(coalesce(c->>'prod',''),160),'st','Pendiente'));
end $$;

-- Contador de visitas, productos vistos, consultas, etc. (sin guardar datos personales)
create or replace function public.hit(kind text, pid int) returns void
language plpgsql security definer set search_path = public as $$
declare s jsonb; d text := to_char(now() at time zone 'America/Bogota','YYYY-MM-DD');
begin
  if kind not in ('visit','views','asks','adds','shares','chat') then return; end if;
  perform pg_advisory_xact_lock(7001);
  select v into s from store where k = 'stats';
  if s is null or jsonb_typeof(s) <> 'object' then s := '{}'::jsonb; end if;
  if kind = 'visit' then
    if s->'days' is null then s := jsonb_set(s,'{days}','{}'::jsonb); end if;
    s := jsonb_set(s, array['days',d], to_jsonb(coalesce((s->'days'->>d)::int,0)+1), true);
  elsif kind = 'chat' then
    s := jsonb_set(s,'{chat}', to_jsonb(coalesce((s->>'chat')::int,0)+1), true);
  else
    if s->kind is null then s := jsonb_set(s, array[kind], '{}'::jsonb); end if;
    s := jsonb_set(s, array[kind,pid::text], to_jsonb(coalesce((s->kind->>pid::text)::int,0)+1), true);
  end if;
  insert into store(k,v,pub) values ('stats', s, false)
  on conflict (k) do update set v = excluded.v, updated_at = now();
end $$;

-- ---------- Funciones del panel ----------
create or replace function public.set_stock(p bigint, q int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'no autorizado'; end if;
  insert into stock(pid,n) values (p, greatest(0,q)) on conflict (pid) do update set n = greatest(0,q);
end $$;

create or replace function public.set_vendor_prices(vcode text, prices jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_staff() or public.my_vendor() = vcode) then raise exception 'no autorizado'; end if;
  insert into store(k,v,pub) values ('vprices', jsonb_build_object(vcode,prices), true)
  on conflict (k) do update set v = jsonb_set(coalesce(store.v,'{}'::jsonb), array[vcode], prices, true), updated_at = now();
end $$;

-- Convierte una cuenta nueva en vendedor (solo la puede ejecutar el dueño o admin)
create or replace function public.link_vendor(em text, code text) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_staff() then raise exception 'no autorizado'; end if;
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('role','vendor','vendor',code)
   where lower(email) = lower(em);
end $$;

-- ---------- Aviso a n8n (correo y, más adelante, WhatsApp) ----------
create extension if not exists pg_net;

create or replace function public.notify_webhook() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare url text;
begin
  select v into url from config where k = 'webhook_url';
  if url is not null and url <> '' then
    begin
      perform net.http_post(url := url, headers := '{"Content-Type":"application/json"}'::jsonb,
        body := jsonb_build_object('type','nuevo_pedido','order',(select data from orders where id = new.id),'msg',new.data->>'msg'));
    exception when others then null;  -- nunca bloquear un pedido por un fallo del aviso
    end;
  end if;
  return new;
end $$;
drop trigger if exists notifs_webhook on public.notifs;
create trigger notifs_webhook after insert on public.notifs for each row execute function public.notify_webhook();

-- ---------- Fotos y videos de productos ----------
insert into storage.buckets (id, name, public) values ('productos','productos', true) on conflict (id) do nothing;
drop policy if exists productos_read   on storage.objects;
drop policy if exists productos_write  on storage.objects;
drop policy if exists productos_update on storage.objects;
drop policy if exists productos_delete on storage.objects;
create policy productos_read   on storage.objects for select using (bucket_id = 'productos');
create policy productos_write  on storage.objects for insert to authenticated with check (bucket_id = 'productos' and public.is_staff());
create policy productos_update on storage.objects for update to authenticated using (bucket_id = 'productos' and public.is_staff());
create policy productos_delete on storage.objects for delete to authenticated using (bucket_id = 'productos' and public.is_staff());

-- =====================================================================
-- PASO 2 (después de crear las cuentas en Authentication > Users):
-- Quita los "--" del inicio de las líneas, revisa los correos y ejecuta.
-- =====================================================================
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"owner"}',
--        raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{"name":"Andrés"}' where email = 'CORREO_DE_ANDRES';
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}',
--        raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{"name":"Fabian"}' where email = 'fabian@onytek.co';

-- PASO 3 (cuando tengas el enlace de n8n para los avisos):
-- insert into config(k,v) values ('webhook_url','https://TU-N8N/webhook/focustech-pedidos') on conflict (k) do update set v = excluded.v;
