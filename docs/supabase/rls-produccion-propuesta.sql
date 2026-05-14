-- Plataforma Hallazgos - RLS produccion propuesta.
-- NO EJECUTAR TODAVIA.
-- Requiere Supabase Auth, profiles, empresas, obras y asignaciones reales.
-- Reemplaza la logica temporal anon solo despues de pruebas controladas.

create extension if not exists pgcrypto;

create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rut text,
  tipo_empresa text not null check (
    tipo_empresa in (
      'criterio_estrategico',
      'cliente',
      'mandante',
      'contratista',
      'reportante'
    )
  ),
  estado text not null default 'activa',
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
  estado text not null default 'activa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text,
  cargo text,
  telefono text,
  foto_url text,
  empresa_id uuid references public.empresas(id),
  obra_id uuid references public.obras(id),
  rol text not null check (
    rol in (
      'super_admin_ce',
      'admin_cliente',
      'admin_mandante',
      'prevencionista_cliente',
      'supervisor_reportante',
      'responsable_cierre',
      'visualizador_auditor'
    )
  ),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usuario_empresa_obra (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id),
  obra_id uuid references public.obras(id),
  rol text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id, empresa_id, obra_id, rol)
);

-- Compatibilidad: agregar solo si faltan columnas en hallazgos_central.
-- Revisar contra schema real antes de ejecutar.
alter table public.hallazgos_central
  add column if not exists reportante_id uuid references public.profiles(id),
  add column if not exists responsable_cierre_id uuid references public.profiles(id);

create index if not exists usuario_empresa_obra_usuario_idx
  on public.usuario_empresa_obra (usuario_id, activo);

create index if not exists usuario_empresa_obra_alcance_idx
  on public.usuario_empresa_obra (empresa_id, obra_id, rol)
  where activo = true;

create index if not exists hallazgos_central_acl_idx
  on public.hallazgos_central (empresa_id, obra_id, estado, criticidad);

alter table public.empresas enable row level security;
alter table public.obras enable row level security;
alter table public.profiles enable row level security;
alter table public.usuario_empresa_obra enable row level security;
alter table public.hallazgos_central enable row level security;

create or replace function public.es_super_admin_ce()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.activo = true
      and p.rol = 'super_admin_ce'
  );
$$;

create or replace function public.tiene_asignacion_empresa_obra(
  p_empresa_id uuid,
  p_obra_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.es_super_admin_ce()
    or exists (
      select 1
      from public.usuario_empresa_obra a
      where a.usuario_id = auth.uid()
        and a.activo = true
        and a.empresa_id = p_empresa_id
        and (a.obra_id is null or p_obra_id is null or a.obra_id = p_obra_id)
    );
$$;

create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.es_super_admin_ce());

create policy "profiles_update_self_limited"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.es_super_admin_ce())
with check (id = auth.uid() or public.es_super_admin_ce());

create policy "empresas_select_asignadas"
on public.empresas
for select
to authenticated
using (
  public.es_super_admin_ce()
  or exists (
    select 1
    from public.usuario_empresa_obra a
    where a.usuario_id = auth.uid()
      and a.activo = true
      and a.empresa_id = empresas.id
  )
);

create policy "obras_select_asignadas"
on public.obras
for select
to authenticated
using (
  public.es_super_admin_ce()
  or public.tiene_asignacion_empresa_obra(obras.empresa_id, obras.id)
);

create policy "asignaciones_select_propias_o_admin"
on public.usuario_empresa_obra
for select
to authenticated
using (usuario_id = auth.uid() or public.es_super_admin_ce());

create policy "hallazgos_select_por_alcance"
on public.hallazgos_central
for select
to authenticated
using (
  public.es_super_admin_ce()
  or public.tiene_asignacion_empresa_obra(empresa_id, obra_id)
  or reportante_id = auth.uid()
  or responsable_cierre_id = auth.uid()
  or supervisor_user_id = auth.uid()
);

create policy "hallazgos_insert_supervisor_asignado"
on public.hallazgos_central
for insert
to authenticated
with check (
  public.es_super_admin_ce()
  or (
    supervisor_user_id = auth.uid()
    and public.tiene_asignacion_empresa_obra(empresa_id, obra_id)
  )
);

create policy "hallazgos_update_gestion_autorizada"
on public.hallazgos_central
for update
to authenticated
using (
  public.es_super_admin_ce()
  or public.tiene_asignacion_empresa_obra(empresa_id, obra_id)
  or responsable_cierre_id = auth.uid()
)
with check (
  public.es_super_admin_ce()
  or public.tiene_asignacion_empresa_obra(empresa_id, obra_id)
  or responsable_cierre_id = auth.uid()
);

-- No crear delete policy para roles operativos.
-- Borrado logico debe implementarse con estado/auditoria.

