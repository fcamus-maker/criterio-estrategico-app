-- FASE FINAL-2G - SEED CLIENTE DEMO COMERCIAL LIMPIO.
-- PREPARADO PARA EJECUCION MANUAL CONTROLADA EN SUPABASE SQL EDITOR.
--
-- Objetivo:
-- - Crear/asegurar empresa y obra limpias para demo comercial.
-- - Vincular usuarios Auth ya creados manualmente a profiles y usuario_asignaciones.
-- - Mantener contador de hallazgos en cero para esta empresa/obra.
-- - Usar public.usuario_asignaciones.usuario_id como columna principal.
-- - Poblar public.usuario_asignaciones.user_id solo por compatibilidad.
--
-- Protecciones:
-- - NO crea usuarios en auth.users.
-- - NO guarda contrasenas.
-- - NO toca hallazgos_central.
-- - NO crea reportes.
-- - NO borra datos.
-- - NO activa RLS.
-- - NO crea policies.
-- - NO toca Storage.
-- - NO usa service_role.
-- - NO contiene credenciales.

-- ==================================================
-- A. DATOS OBJETIVO
-- ==================================================
-- Empresa:
--   nombre: Cliente Demo Comercial
--   sigla: CDC
--   estado: activa
--
-- Obra:
--   nombre: Obra Demo Comercial
--   sigla: ODC
--   estado: activa
--
-- Usuarios Auth requeridos, creados manualmente antes de ejecutar este SQL:
--   cliente@criterioestrategico.cl        rol: admin_cliente
--   ito.supervisor@criterioestrategico.cl rol: supervisor_reportante

-- ==================================================
-- B. INSPECCION PREVIA: USUARIOS AUTH DISPONIBLES
-- ==================================================

select
  u.email,
  u.id as auth_user_id,
  u.created_at
from auth.users u
where lower(u.email) in (
  'cliente@criterioestrategico.cl',
  'ito.supervisor@criterioestrategico.cl'
)
order by u.email;

select
  esperado.email,
  case when u.id is null then 'FALTA_CREAR_EN_AUTH' else 'OK_AUTH_EXISTE' end as estado
from (
  values
    ('cliente@criterioestrategico.cl'),
    ('ito.supervisor@criterioestrategico.cl')
) as esperado(email)
left join auth.users u on lower(u.email) = esperado.email
order by esperado.email;

-- ==================================================
-- C. CREAR O ASEGURAR EMPRESA DEMO COMERCIAL
-- ==================================================

insert into public.empresas (nombre, sigla, estado)
values ('Cliente Demo Comercial', 'CDC', 'activa')
on conflict (nombre) do update
set
  sigla = excluded.sigla,
  estado = 'activa',
  updated_at = now();

-- ==================================================
-- D. CREAR O ASEGURAR OBRA DEMO COMERCIAL
-- ==================================================

with empresa_demo as (
  select id
  from public.empresas
  where nombre = 'Cliente Demo Comercial'
  limit 1
)
insert into public.obras (empresa_id, nombre, sigla, estado)
select
  empresa_demo.id,
  'Obra Demo Comercial',
  'ODC',
  'activa'
from empresa_demo
on conflict (empresa_id, nombre) do update
set
  sigla = excluded.sigla,
  estado = 'activa',
  updated_at = now();

-- ==================================================
-- E. CREAR / ACTUALIZAR PROFILES VINCULADOS A AUTH
-- ==================================================
-- Este bloque solo actua sobre usuarios que ya existan en auth.users.
-- Si falta un usuario Auth, no crea un sustituto ni inserta datos parciales.

with contexto as (
  select
    e.id as empresa_id,
    o.id as obra_id
  from public.empresas e
  join public.obras o on o.empresa_id = e.id
  where e.nombre = 'Cliente Demo Comercial'
    and o.nombre = 'Obra Demo Comercial'
  limit 1
),
usuarios_objetivo as (
  select *
  from (
    values
      (
        'cliente@criterioestrategico.cl',
        'Cliente Demo Comercial',
        'Administrador cliente demo',
        'admin_cliente'
      ),
      (
        'ito.supervisor@criterioestrategico.cl',
        'ITO Supervisor Demo',
        'Supervisor reportante',
        'supervisor_reportante'
      )
  ) as datos(email, nombre, cargo, rol)
),
usuarios_auth as (
  select
    u.id,
    lower(u.email) as email,
    objetivo.nombre,
    objetivo.cargo,
    objetivo.rol
  from auth.users u
  join usuarios_objetivo objetivo on lower(u.email) = objetivo.email
)
insert into public.profiles (
  id,
  email,
  nombre,
  cargo,
  rol,
  empresa_id,
  obra_id,
  activo,
  created_at,
  updated_at
)
select
  usuarios_auth.id,
  usuarios_auth.email,
  usuarios_auth.nombre,
  usuarios_auth.cargo,
  usuarios_auth.rol,
  contexto.empresa_id,
  contexto.obra_id,
  true,
  now(),
  now()
from usuarios_auth
cross join contexto
on conflict (id) do update
set
  email = excluded.email,
  nombre = excluded.nombre,
  cargo = excluded.cargo,
  rol = excluded.rol,
  empresa_id = excluded.empresa_id,
  obra_id = excluded.obra_id,
  activo = true,
  updated_at = now();

-- ==================================================
-- F. CREAR / ACTUALIZAR USUARIO_ASIGNACIONES
-- ==================================================

with contexto as (
  select
    e.id as empresa_id,
    o.id as obra_id
  from public.empresas e
  join public.obras o on o.empresa_id = e.id
  where e.nombre = 'Cliente Demo Comercial'
    and o.nombre = 'Obra Demo Comercial'
  limit 1
),
usuarios_objetivo as (
  select *
  from (
    values
      ('cliente@criterioestrategico.cl', 'admin_cliente'),
      ('ito.supervisor@criterioestrategico.cl', 'supervisor_reportante')
  ) as datos(email, rol)
),
asignaciones_objetivo as (
  select
    u.id as usuario_id,
    u.id as user_id_compat,
    contexto.empresa_id,
    contexto.obra_id,
    objetivo.rol
  from auth.users u
  join usuarios_objetivo objetivo on lower(u.email) = objetivo.email
  cross join contexto
),
asignaciones_actualizadas as (
  update public.usuario_asignaciones ua
  set
    user_id = coalesce(ua.user_id, objetivo.user_id_compat),
    activo = true,
    updated_at = now()
  from asignaciones_objetivo objetivo
  where ua.usuario_id = objetivo.usuario_id
    and ua.empresa_id = objetivo.empresa_id
    and ua.obra_id = objetivo.obra_id
    and ua.rol = objetivo.rol
  returning ua.id
)
insert into public.usuario_asignaciones (
  usuario_id,
  user_id,
  empresa_id,
  obra_id,
  rol,
  activo,
  created_at,
  updated_at
)
select
  objetivo.usuario_id,
  objetivo.user_id_compat,
  objetivo.empresa_id,
  objetivo.obra_id,
  objetivo.rol,
  true,
  now(),
  now()
from asignaciones_objetivo objetivo
where not exists (
  select 1
  from public.usuario_asignaciones ua
  where ua.usuario_id = objetivo.usuario_id
    and ua.empresa_id = objetivo.empresa_id
    and ua.obra_id = objetivo.obra_id
    and ua.rol = objetivo.rol
);

-- ==================================================
-- G. VALIDACIONES POSTERIORES
-- ==================================================

-- A. Ver empresa/obra creada.
select
  e.id as empresa_id,
  e.nombre as empresa,
  e.sigla as sigla_empresa,
  e.estado as estado_empresa,
  o.id as obra_id,
  o.nombre as obra,
  o.sigla as sigla_obra,
  o.estado as estado_obra
from public.empresas e
join public.obras o on o.empresa_id = e.id
where e.nombre = 'Cliente Demo Comercial'
  and o.nombre = 'Obra Demo Comercial';

-- B. Ver usuarios vinculados.
select
  p.email,
  p.nombre,
  p.rol,
  p.empresa_id,
  e.nombre as empresa,
  p.obra_id,
  o.nombre as obra,
  p.activo
from public.profiles p
left join public.empresas e on e.id = p.empresa_id
left join public.obras o on o.id = p.obra_id
where lower(p.email) in (
  'cliente@criterioestrategico.cl',
  'ito.supervisor@criterioestrategico.cl'
)
order by p.email;

-- C. Ver asignaciones.
select
  ua.usuario_id,
  ua.user_id as user_id_compat,
  p.email,
  ua.empresa_id,
  e.nombre as empresa,
  ua.obra_id,
  o.nombre as obra,
  ua.rol,
  ua.activo
from public.usuario_asignaciones ua
left join public.profiles p on p.id = ua.usuario_id
left join public.empresas e on e.id = ua.empresa_id
left join public.obras o on o.id = ua.obra_id
where lower(p.email) in (
  'cliente@criterioestrategico.cl',
  'ito.supervisor@criterioestrategico.cl'
)
order by p.email, ua.rol;

-- D. Confirmar contador en cero para esa empresa.
select
  e.id as empresa_id,
  e.nombre as empresa,
  count(h.id) as total_hallazgos_empresa
from public.empresas e
left join public.hallazgos_central h on h.empresa_id = e.id
where e.nombre = 'Cliente Demo Comercial'
group by e.id, e.nombre;

-- E. Confirmar contador en cero para esa obra.
select
  o.id as obra_id,
  o.nombre as obra,
  count(h.id) as total_hallazgos_obra
from public.empresas e
join public.obras o on o.empresa_id = e.id
left join public.hallazgos_central h on h.obra_id = o.id
where e.nombre = 'Cliente Demo Comercial'
  and o.nombre = 'Obra Demo Comercial'
group by o.id, o.nombre;

-- F. Validacion compacta esperada:
-- - total_hallazgos_empresa = 0
-- - total_hallazgos_obra = 0
-- - ambos usuarios tienen profile activo
-- - ambos usuarios tienen usuario_asignaciones activo
with contexto as (
  select
    e.id as empresa_id,
    o.id as obra_id
  from public.empresas e
  join public.obras o on o.empresa_id = e.id
  where e.nombre = 'Cliente Demo Comercial'
    and o.nombre = 'Obra Demo Comercial'
  limit 1
)
select
  (select count(*) from public.hallazgos_central h join contexto c on h.empresa_id = c.empresa_id) as total_hallazgos_empresa,
  (select count(*) from public.hallazgos_central h join contexto c on h.obra_id = c.obra_id) as total_hallazgos_obra,
  (
    select count(*)
    from public.profiles p
    join contexto c on p.empresa_id = c.empresa_id and p.obra_id = c.obra_id
    where lower(p.email) in (
      'cliente@criterioestrategico.cl',
      'ito.supervisor@criterioestrategico.cl'
    )
      and p.activo = true
  ) as profiles_activos,
  (
    select count(*)
    from public.usuario_asignaciones ua
    join public.profiles p on p.id = ua.usuario_id
    join contexto c on ua.empresa_id = c.empresa_id and ua.obra_id = c.obra_id
    where lower(p.email) in (
      'cliente@criterioestrategico.cl',
      'ito.supervisor@criterioestrategico.cl'
    )
      and ua.activo = true
  ) as asignaciones_activas;
