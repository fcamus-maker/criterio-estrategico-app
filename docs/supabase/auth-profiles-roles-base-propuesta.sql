-- FASE 25C - SQL BASE CONTROLADO / SIN RLS DEFINITIVO.
-- PROPUESTA / NO EJECUTAR SIN REVISION.
--
-- Que crea:
-- - public.empresas
-- - public.obras
-- - public.roles
-- - public.profiles
-- - public.usuario_asignaciones
-- - funciones helper para RLS futuro
--
-- Que NO hace:
-- - NO activa RLS definitivo.
-- - NO crea policies.
-- - NO inserta usuarios en auth.users.
-- - NO contiene passwords ni credenciales.
-- - NO toca public.hallazgos.
-- - NO elimina ni modifica Storage ni la policy temporal anon.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create index if not exists profiles_email_idx
  on public.profiles (email);

create index if not exists profiles_empresa_obra_idx
  on public.profiles (empresa_id, obra_id)
  where activo = true;

create index if not exists obras_empresa_idx
  on public.obras (empresa_id);

create index if not exists usuario_asignaciones_usuario_idx
  on public.usuario_asignaciones (usuario_id, activo);

create index if not exists usuario_asignaciones_empresa_idx
  on public.usuario_asignaciones (empresa_id, activo);

create index if not exists usuario_asignaciones_obra_idx
  on public.usuario_asignaciones (obra_id, activo);

create index if not exists usuario_asignaciones_alcance_idx
  on public.usuario_asignaciones (empresa_id, obra_id, rol)
  where activo = true;

drop trigger if exists empresas_set_updated_at on public.empresas;
create trigger empresas_set_updated_at
before update on public.empresas
for each row execute function public.set_updated_at();

drop trigger if exists obras_set_updated_at on public.obras;
create trigger obras_set_updated_at
before update on public.obras
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists usuario_asignaciones_set_updated_at on public.usuario_asignaciones;
create trigger usuario_asignaciones_set_updated_at
before update on public.usuario_asignaciones
for each row execute function public.set_updated_at();

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

-- Verificacion manual sugerida despues de ejecutar:
-- select table_name
-- from information_schema.tables
-- where table_schema = 'public'
--   and table_name in ('empresas', 'obras', 'roles', 'profiles', 'usuario_asignaciones')
-- order by table_name;
--
-- Rollback manual si se ejecuta en entorno equivocado y no hay datos:
-- drop table if exists public.usuario_asignaciones;
-- drop table if exists public.profiles;
-- drop table if exists public.obras;
-- drop table if exists public.empresas;
-- drop table if exists public.roles;
-- drop function if exists public.usuario_tiene_acceso_obra(uuid, uuid);
-- drop function if exists public.usuario_tiene_acceso_empresa(uuid);
-- drop function if exists public.is_super_admin_ce();
-- drop function if exists public.usuario_rol();
