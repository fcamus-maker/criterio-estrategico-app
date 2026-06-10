-- FASE FINAL-2B - MODELO BASE MULTIEMPRESA SIN RLS.
-- PREPARADO PARA EJECUCION MANUAL CONTROLADA / NO EJECUTAR AUTOMATICAMENTE.
--
-- Alcance:
-- - Crear/asegurar estructura base multiempresa.
-- - Usar public.usuario_asignaciones como tabla oficial de alcance.
-- - Agregar columnas UUID a public.hallazgos_central si faltan.
-- - Crear indices no destructivos.
--
-- Protecciones:
-- - NO activa RLS.
-- - NO crea policies.
-- - NO toca Storage.
-- - NO borra tablas.
-- - NO borra datos.
-- - NO elimina columnas texto historicas.
-- - NO usa service_role.
-- - NO contiene credenciales.

create extension if not exists pgcrypto;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  sigla text,
  rut text,
  estado text not null default 'activa',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.empresas
  add column if not exists sigla text,
  add column if not exists rut text,
  add column if not exists estado text default 'activa',
  add column if not exists logo_url text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists empresas_nombre_unique_idx
  on public.empresas (nombre);

create table if not exists public.obras (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id),
  nombre text not null,
  sigla text,
  estado text not null default 'activa',
  ubicacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.obras
  add column if not exists empresa_id uuid references public.empresas(id),
  add column if not exists sigla text,
  add column if not exists estado text default 'activa',
  add column if not exists ubicacion text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists obras_empresa_nombre_unique_idx
  on public.obras (empresa_id, nombre);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nombre text,
  cargo text,
  telefono text,
  foto_url text,
  rol text,
  empresa_id uuid references public.empresas(id),
  obra_id uuid references public.obras(id),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists nombre text,
  add column if not exists cargo text,
  add column if not exists telefono text,
  add column if not exists foto_url text,
  add column if not exists rol text,
  add column if not exists empresa_id uuid references public.empresas(id),
  add column if not exists obra_id uuid references public.obras(id),
  add column if not exists activo boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.usuario_asignaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id),
  obra_id uuid references public.obras(id),
  rol text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.usuario_asignaciones
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists empresa_id uuid references public.empresas(id),
  add column if not exists obra_id uuid references public.obras(id),
  add column if not exists rol text,
  add column if not exists activo boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.hallazgos_central
  add column if not exists empresa_id uuid references public.empresas(id),
  add column if not exists obra_id uuid references public.obras(id),
  add column if not exists reportante_user_id uuid references auth.users(id),
  add column if not exists supervisor_user_id uuid references auth.users(id),
  add column if not exists responsable_cierre_user_id uuid references auth.users(id),
  add column if not exists mandante_id uuid references public.empresas(id),
  add column if not exists contratista_id uuid references public.empresas(id);

-- Indices no destructivos para consultas y futura RLS.
create index if not exists hallazgos_central_empresa_id_idx
  on public.hallazgos_central (empresa_id);

create index if not exists hallazgos_central_obra_id_idx
  on public.hallazgos_central (obra_id);

create index if not exists hallazgos_central_reportante_user_id_idx
  on public.hallazgos_central (reportante_user_id);

create index if not exists hallazgos_central_supervisor_user_id_idx
  on public.hallazgos_central (supervisor_user_id);

create index if not exists hallazgos_central_responsable_cierre_user_id_idx
  on public.hallazgos_central (responsable_cierre_user_id);

create index if not exists hallazgos_central_empresa_obra_estado_idx
  on public.hallazgos_central (empresa_id, obra_id, estado);

create index if not exists usuario_asignaciones_user_id_idx
  on public.usuario_asignaciones (user_id);

create index if not exists usuario_asignaciones_empresa_id_idx
  on public.usuario_asignaciones (empresa_id);

create index if not exists usuario_asignaciones_obra_id_idx
  on public.usuario_asignaciones (obra_id);

create index if not exists usuario_asignaciones_alcance_idx
  on public.usuario_asignaciones (empresa_id, obra_id, rol)
  where activo = true;

create unique index if not exists usuario_asignaciones_obra_unique_idx
  on public.usuario_asignaciones (user_id, empresa_id, obra_id, rol)
  where obra_id is not null;

create unique index if not exists usuario_asignaciones_empresa_global_unique_idx
  on public.usuario_asignaciones (user_id, empresa_id, rol)
  where obra_id is null;

create index if not exists profiles_empresa_obra_idx
  on public.profiles (empresa_id, obra_id)
  where activo = true;

create index if not exists profiles_rol_activo_idx
  on public.profiles (rol, activo);

-- Validaciones sugeridas despues de pegar manualmente este archivo:
--
-- select table_name
-- from information_schema.tables
-- where table_schema = 'public'
--   and table_name in ('empresas', 'obras', 'profiles', 'usuario_asignaciones', 'hallazgos_central')
-- order by table_name;
--
-- select column_name, data_type
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'hallazgos_central'
--   and column_name in (
--     'empresa_id',
--     'obra_id',
--     'reportante_user_id',
--     'supervisor_user_id',
--     'responsable_cierre_user_id',
--     'mandante_id',
--     'contratista_id'
--   )
-- order by column_name;

