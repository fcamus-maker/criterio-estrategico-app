-- Plataforma Hallazgos - Auth + profiles + roles base.
-- PROPUESTA / NO EJECUTAR SIN REVISION.
-- No activa RLS definitivo por si sola.
-- No elimina la policy temporal anon de Storage.

create extension if not exists pgcrypto;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rut text,
  tipo_empresa text not null default 'cliente' check (
    tipo_empresa in (
      'criterio_estrategico',
      'cliente',
      'mandante',
      'contratista',
      'reportante'
    )
  ),
  estado text not null default 'activa' check (estado in ('activa', 'inactiva')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.obras (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(id),
  mandante_id uuid references public.empresas(id),
  nombre text not null,
  codigo text,
  ubicacion text,
  estado text not null default 'activa' check (estado in ('activa', 'inactiva')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  ('admin_mandante', 'Administrador mandante', 'Gestiona alcance de mandante.', false),
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
  nombre text not null,
  email text,
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

create table if not exists public.usuario_asignaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id),
  obra_id uuid references public.obras(id),
  rol text not null references public.roles(id),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id, empresa_id, obra_id, rol)
);

create index if not exists profiles_rol_idx
  on public.profiles (rol, activo);

create index if not exists profiles_empresa_obra_idx
  on public.profiles (empresa_id, obra_id)
  where activo = true;

create index if not exists usuario_asignaciones_usuario_idx
  on public.usuario_asignaciones (usuario_id, activo);

create index if not exists usuario_asignaciones_alcance_idx
  on public.usuario_asignaciones (empresa_id, obra_id, rol)
  where activo = true;

-- Compatibilidad futura con hallazgos_central.
-- Revisar contra tabla real antes de ejecutar.
alter table public.hallazgos_central
  add column if not exists reportante_id uuid references public.profiles(id),
  add column if not exists responsable_cierre_id uuid references public.profiles(id);

create or replace function public.usuario_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.rol
  from public.profiles p
  where p.id = auth.uid()
    and p.activo = true
  limit 1;
$$;

create or replace function public.is_super_admin_ce()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.usuario_rol() = 'super_admin_ce', false);
$$;

create or replace function public.usuario_tiene_acceso_empresa(p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin_ce()
    or exists (
      select 1
      from public.usuario_asignaciones a
      where a.usuario_id = auth.uid()
        and a.activo = true
        and a.empresa_id = p_empresa_id
    );
$$;

create or replace function public.usuario_tiene_acceso_obra(
  p_empresa_id uuid,
  p_obra_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin_ce()
    or exists (
      select 1
      from public.usuario_asignaciones a
      where a.usuario_id = auth.uid()
        and a.activo = true
        and a.empresa_id = p_empresa_id
        and (a.obra_id is null or a.obra_id = p_obra_id)
    );
$$;

comment on table public.profiles is
  'Perfiles vinculados a Supabase Auth. Base para roles y RLS futuro.';

comment on table public.usuario_asignaciones is
  'Asignaciones usuario-empresa-obra para permisos multiempresa.';
