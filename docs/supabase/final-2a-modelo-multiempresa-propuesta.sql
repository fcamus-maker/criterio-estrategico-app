-- FASE FINAL-2A - MODELO MULTIEMPRESA Y ASIGNACIONES.
-- PROPUESTA PREPARADA / NO EJECUTAR TODAVIA.
--
-- Objetivo:
-- - Unificar el modelo real multiempresa.
-- - Dejar public.usuario_asignaciones como tabla oficial de alcance.
-- - Preparar columnas UUID para RLS futuro sin eliminar textos historicos.
-- - Preparar backfill inicial desde textos empresa/obra existentes.
--
-- Protecciones:
-- - No contiene service_role.
-- - No contiene credenciales.
-- - No publica buckets.
-- - No crea policies de Storage.
-- - No elimina datos.
-- - Revisar y ejecutar solo en entorno controlado.

create extension if not exists pgcrypto;

create or replace function public.ce_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.ce_slug(p_valor text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      lower(
        translate(
          trim(coalesce(p_valor, '')),
          'áéíóúÁÉÍÓÚñÑ',
          'aeiouAEIOUnN'
        )
      ),
      '[^a-z0-9]+',
      '-',
      'g'
    ),
    ''
  );
$$;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  sigla text,
  rut text,
  estado text not null default 'activa'
    check (estado in ('activa', 'inactiva')),
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint empresas_nombre_unique unique (nombre)
);

create table if not exists public.obras (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  nombre text not null,
  sigla text,
  estado text not null default 'activa'
    check (estado in ('activa', 'inactiva')),
  ubicacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint obras_empresa_nombre_unique unique (empresa_id, nombre)
);

create table if not exists public.roles (
  id text primary key,
  nombre text not null,
  descripcion text,
  es_operativo boolean not null default false
);

insert into public.roles (id, nombre, descripcion, es_operativo)
values
  ('super_admin_ce', 'Administrador Criterio Estrategico', 'Acceso global CE.', false),
  ('admin_cliente', 'Administrador cliente', 'Gestiona empresa/obras asignadas.', false),
  ('admin_mandante', 'Administrador mandante', 'Gestiona alcance mandante.', false),
  ('prevencionista_cliente', 'Prevencionista cliente', 'Gestion preventiva y seguimiento.', true),
  ('supervisor_reportante', 'Supervisor reportante', 'Crea hallazgos desde app movil.', true),
  ('responsable_cierre', 'Responsable de cierre', 'Gestiona acciones asignadas.', true),
  ('visualizador_auditor', 'Visualizador auditor', 'Solo lectura dentro de alcance.', false)
on conflict (id) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    es_operativo = excluded.es_operativo;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nombre text not null,
  cargo text,
  telefono text,
  foto_url text,
  rol text not null references public.roles(id),
  empresa_id uuid references public.empresas(id),
  obra_id uuid references public.obras(id),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nombre oficial de produccion: public.usuario_asignaciones.
-- No usar public.usuario_empresa_obra en nuevas propuestas.
create table if not exists public.usuario_asignaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id),
  obra_id uuid references public.obras(id),
  rol text not null references public.roles(id),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint usuario_asignaciones_scope_unique
    unique (user_id, empresa_id, obra_id, rol)
);

alter table public.hallazgos_central
  add column if not exists empresa_id uuid references public.empresas(id),
  add column if not exists obra_id uuid references public.obras(id),
  add column if not exists reportante_user_id uuid references auth.users(id),
  add column if not exists supervisor_user_id uuid references auth.users(id),
  add column if not exists responsable_cierre_user_id uuid references auth.users(id),
  add column if not exists mandante_id uuid references public.empresas(id),
  add column if not exists contratista_id uuid references public.empresas(id);

create index if not exists empresas_estado_idx
  on public.empresas (estado);

create index if not exists empresas_sigla_idx
  on public.empresas (sigla);

create index if not exists obras_empresa_estado_idx
  on public.obras (empresa_id, estado);

create index if not exists obras_empresa_sigla_idx
  on public.obras (empresa_id, sigla);

create index if not exists profiles_rol_activo_idx
  on public.profiles (rol, activo);

create index if not exists profiles_empresa_obra_idx
  on public.profiles (empresa_id, obra_id)
  where activo = true;

create index if not exists usuario_asignaciones_user_idx
  on public.usuario_asignaciones (user_id, activo);

create index if not exists usuario_asignaciones_empresa_idx
  on public.usuario_asignaciones (empresa_id, activo);

create index if not exists usuario_asignaciones_obra_idx
  on public.usuario_asignaciones (obra_id, activo);

create index if not exists usuario_asignaciones_alcance_idx
  on public.usuario_asignaciones (empresa_id, obra_id, rol)
  where activo = true;

create unique index if not exists usuario_asignaciones_empresa_global_unique
  on public.usuario_asignaciones (user_id, empresa_id, rol)
  where obra_id is null;

create index if not exists hallazgos_central_acl_idx
  on public.hallazgos_central (empresa_id, obra_id, estado, criticidad);

create index if not exists hallazgos_central_supervisor_user_idx
  on public.hallazgos_central (supervisor_user_id)
  where supervisor_user_id is not null;

create index if not exists hallazgos_central_responsable_user_idx
  on public.hallazgos_central (responsable_cierre_user_id)
  where responsable_cierre_user_id is not null;

drop trigger if exists empresas_set_updated_at on public.empresas;
create trigger empresas_set_updated_at
before update on public.empresas
for each row execute function public.ce_set_updated_at();

drop trigger if exists obras_set_updated_at on public.obras;
create trigger obras_set_updated_at
before update on public.obras
for each row execute function public.ce_set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.ce_set_updated_at();

drop trigger if exists usuario_asignaciones_set_updated_at on public.usuario_asignaciones;
create trigger usuario_asignaciones_set_updated_at
before update on public.usuario_asignaciones
for each row execute function public.ce_set_updated_at();

-- Backfill propuesto desde textos existentes.
-- Revisar datos duplicados, tildes, siglas y empresas homonimas antes de ejecutar.

insert into public.empresas (nombre, sigla, estado)
select distinct
  trim(h.empresa) as nombre,
  upper(left(coalesce(public.ce_slug(h.sigla_empresa), public.ce_slug(h.empresa)), 12)) as sigla,
  'activa' as estado
from public.hallazgos_central h
where nullif(trim(coalesce(h.empresa, '')), '') is not null
on conflict (nombre) do update
set sigla = coalesce(public.empresas.sigla, excluded.sigla),
    estado = 'activa';

insert into public.obras (empresa_id, nombre, sigla, estado)
select distinct
  e.id as empresa_id,
  trim(h.obra) as nombre,
  upper(left(coalesce(public.ce_slug(h.sigla_proyecto), public.ce_slug(h.obra)), 12)) as sigla,
  'activa' as estado
from public.hallazgos_central h
join public.empresas e on e.nombre = trim(h.empresa)
where nullif(trim(coalesce(h.empresa, '')), '') is not null
  and nullif(trim(coalesce(h.obra, '')), '') is not null
on conflict (empresa_id, nombre) do update
set sigla = coalesce(public.obras.sigla, excluded.sigla),
    estado = 'activa';

update public.hallazgos_central h
set empresa_id = e.id
from public.empresas e
where h.empresa_id is null
  and e.nombre = trim(h.empresa);

update public.hallazgos_central h
set obra_id = o.id
from public.obras o
join public.empresas e on e.id = o.empresa_id
where h.obra_id is null
  and h.empresa_id = e.id
  and e.nombre = trim(h.empresa)
  and o.nombre = trim(h.obra);

-- Profiles y asignaciones deben poblarse desde Supabase Auth con usuarios
-- conocidos. Este bloque es plantilla y requiere reemplazar valores.
--
-- insert into public.profiles (
--   id, email, nombre, cargo, telefono, rol, empresa_id, obra_id, activo
-- )
-- select
--   u.id,
--   u.email,
--   coalesce(u.raw_user_meta_data ->> 'nombre', u.email),
--   u.raw_user_meta_data ->> 'cargo',
--   u.raw_user_meta_data ->> 'telefono',
--   'admin_cliente',
--   e.id,
--   null,
--   true
-- from auth.users u
-- join public.empresas e on e.nombre = 'NOMBRE_EMPRESA'
-- where u.email = 'usuario@empresa.cl'
-- on conflict (id) do update
-- set email = excluded.email,
--     nombre = excluded.nombre,
--     cargo = excluded.cargo,
--     telefono = excluded.telefono,
--     rol = excluded.rol,
--     empresa_id = excluded.empresa_id,
--     obra_id = excluded.obra_id,
--     activo = excluded.activo;
--
-- insert into public.usuario_asignaciones (
--   user_id, empresa_id, obra_id, rol, activo
-- )
-- select
--   p.id,
--   p.empresa_id,
--   p.obra_id,
--   p.rol,
--   true
-- from public.profiles p
-- where p.email = 'usuario@empresa.cl'
-- on conflict (user_id, empresa_id, obra_id, rol) do update
-- set activo = true;

-- Verificaciones sugeridas despues de ejecutar en entorno controlado:
--
-- select count(*) as hallazgos_sin_empresa_id
-- from public.hallazgos_central
-- where empresa_id is null;
--
-- select count(*) as hallazgos_sin_obra_id
-- from public.hallazgos_central
-- where obra_id is null;
--
-- select e.nombre, o.nombre, count(*) as hallazgos
-- from public.hallazgos_central h
-- join public.empresas e on e.id = h.empresa_id
-- left join public.obras o on o.id = h.obra_id
-- group by e.nombre, o.nombre
-- order by hallazgos desc;
--
-- select rol, activo, count(*)
-- from public.profiles
-- group by rol, activo
-- order by rol, activo;
