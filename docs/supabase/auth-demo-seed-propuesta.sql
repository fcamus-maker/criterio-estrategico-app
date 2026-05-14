-- FASE 25C - SEED DEMO AUTH/PROFILES.
-- NO EJECUTAR HASTA REEMPLAZAR UUIDS DE AUTH.USERS.
--
-- Este archivo NO crea usuarios en auth.users.
-- Primero crear usuarios manualmente en Supabase Dashboard > Authentication.
-- Luego copiar cada User UID y reemplazar los placeholders:
--
-- REEMPLAZAR_UUID_SUPER_ADMIN
-- REEMPLAZAR_UUID_ADMIN_CLIENTE
-- REEMPLAZAR_UUID_SUPERVISOR
-- REEMPLAZAR_UUID_AUDITOR
--
-- No incluir passwords ni credenciales en este archivo.

with empresa_demo as (
  insert into public.empresas (nombre, rut, tipo_empresa, estado)
  values ('Criterio Estrategico Demo', null, 'cliente', 'activa')
  on conflict do nothing
  returning id
),
empresa_objetivo as (
  select id from empresa_demo
  union
  select id from public.empresas where nombre = 'Criterio Estrategico Demo'
  limit 1
),
obra_demo as (
  insert into public.obras (empresa_id, nombre, codigo, ubicacion, estado)
  select id, 'Proyecto Demo Seguridad', 'DEMO-SEG', 'Entorno demo controlado', 'activa'
  from empresa_objetivo
  on conflict do nothing
  returning id, empresa_id
),
obra_objetivo as (
  select id, empresa_id from obra_demo
  union
  select o.id, o.empresa_id
  from public.obras o
  join empresa_objetivo e on e.id = o.empresa_id
  where o.codigo = 'DEMO-SEG'
  limit 1
),
usuarios as (
  select
    'REEMPLAZAR_UUID_SUPER_ADMIN'::uuid as id,
    'Administrador CE Demo'::text as nombre,
    'admin.ce.demo@criterioestrategico.cl'::text as email,
    'Administrador Criterio Estrategico'::text as cargo,
    'super_admin_ce'::text as rol
  union all
  select
    'REEMPLAZAR_UUID_ADMIN_CLIENTE'::uuid,
    'Administrador Cliente Demo',
    'admin.cliente.demo@criterioestrategico.cl',
    'Administrador Cliente',
    'admin_cliente'
  union all
  select
    'REEMPLAZAR_UUID_SUPERVISOR'::uuid,
    'Supervisor Demo',
    'supervisor.demo@criterioestrategico.cl',
    'Supervisor Reportante',
    'supervisor_reportante'
  union all
  select
    'REEMPLAZAR_UUID_AUDITOR'::uuid,
    'Auditor Demo',
    'auditor.demo@criterioestrategico.cl',
    'Visualizador Auditor',
    'visualizador_auditor'
),
perfiles as (
  insert into public.profiles (
    id,
    nombre,
    email,
    cargo,
    telefono,
    foto_url,
    rol,
    empresa_id,
    obra_id,
    activo
  )
  select
    u.id,
    u.nombre,
    u.email,
    u.cargo,
    null,
    null,
    u.rol,
    o.empresa_id,
    case
      when u.rol in ('supervisor_reportante', 'visualizador_auditor')
      then o.id
      else null
    end,
    true
  from usuarios u
  cross join obra_objetivo o
  on conflict (id) do update
  set nombre = excluded.nombre,
      email = excluded.email,
      cargo = excluded.cargo,
      rol = excluded.rol,
      empresa_id = excluded.empresa_id,
      obra_id = excluded.obra_id,
      activo = true
  returning id, empresa_id, obra_id, rol
)
insert into public.usuario_asignaciones (
  usuario_id,
  empresa_id,
  obra_id,
  rol,
  activo
)
select
  p.id,
  p.empresa_id,
  coalesce(p.obra_id, o.id),
  p.rol,
  true
from perfiles p
cross join obra_objetivo o
on conflict (usuario_id, empresa_id, obra_id, rol) do update
set activo = true;

-- Verificacion manual:
-- select id, email, rol, empresa_id, obra_id, activo
-- from public.profiles
-- where email in (
--   'admin.ce.demo@criterioestrategico.cl',
--   'admin.cliente.demo@criterioestrategico.cl',
--   'supervisor.demo@criterioestrategico.cl',
--   'auditor.demo@criterioestrategico.cl'
-- )
-- order by rol;
