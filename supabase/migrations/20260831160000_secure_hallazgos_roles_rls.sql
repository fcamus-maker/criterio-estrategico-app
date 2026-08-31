-- Security hardening for the Hallazgos platform.
-- Applied to production on 2026-08-31 through Supabase migration secure_hallazgos_roles_rls.

drop policy if exists allow_all on public.hallazgos;
drop policy if exists allow_insert on public.hallazgos;

alter table public.hallazgos enable row level security;
alter table public.hallazgos_central enable row level security;
alter table public.roles enable row level security;

revoke all privileges on table public.hallazgos from anon;
revoke all privileges on table public.hallazgos_central from anon;
revoke all privileges on table public.roles from anon;

revoke all privileges on table public.hallazgos from authenticated;
revoke all privileges on table public.hallazgos_central from authenticated;
revoke all privileges on table public.roles from authenticated;

grant select, insert, update on table public.hallazgos to authenticated;
grant select, insert, update on table public.hallazgos_central to authenticated;
grant select on table public.roles to authenticated;

create policy hallazgos_super_admin_select
on public.hallazgos
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and p.rol = 'super_admin_ce'
  )
);

create policy hallazgos_super_admin_insert
on public.hallazgos
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and p.rol = 'super_admin_ce'
  )
);

create policy hallazgos_super_admin_update
on public.hallazgos
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and p.rol = 'super_admin_ce'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and p.rol = 'super_admin_ce'
  )
);

create policy hallazgos_central_select_scope
on public.hallazgos_central
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and (
        p.rol = 'super_admin_ce'
        or (
          hallazgos_central.empresa_id = p.empresa_id
          and (p.obra_id is null or hallazgos_central.obra_id = p.obra_id)
        )
        or exists (
          select 1 from public.usuario_asignaciones ua
          where ua.activo = true
            and (ua.usuario_id = p.id or ua.user_id = p.id)
            and ua.empresa_id = hallazgos_central.empresa_id
            and (ua.obra_id is null or ua.obra_id = hallazgos_central.obra_id)
        )
      )
  )
);

create policy hallazgos_central_insert_scope
on public.hallazgos_central
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and p.rol in (
        'super_admin_ce',
        'admin_cliente',
        'admin_mandante',
        'prevencionista_cliente',
        'supervisor_reportante'
      )
      and (
        p.rol = 'super_admin_ce'
        or (
          hallazgos_central.empresa_id = p.empresa_id
          and (p.obra_id is null or hallazgos_central.obra_id = p.obra_id)
        )
        or exists (
          select 1 from public.usuario_asignaciones ua
          where ua.activo = true
            and (ua.usuario_id = p.id or ua.user_id = p.id)
            and ua.empresa_id = hallazgos_central.empresa_id
            and (ua.obra_id is null or ua.obra_id = hallazgos_central.obra_id)
        )
      )
  )
);

create policy hallazgos_central_update_scope
on public.hallazgos_central
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and p.rol in (
        'super_admin_ce',
        'admin_cliente',
        'admin_mandante',
        'prevencionista_cliente',
        'supervisor_reportante',
        'responsable_cierre'
      )
      and (
        p.rol = 'super_admin_ce'
        or (
          hallazgos_central.empresa_id = p.empresa_id
          and (p.obra_id is null or hallazgos_central.obra_id = p.obra_id)
        )
        or exists (
          select 1 from public.usuario_asignaciones ua
          where ua.activo = true
            and (ua.usuario_id = p.id or ua.user_id = p.id)
            and ua.empresa_id = hallazgos_central.empresa_id
            and (ua.obra_id is null or ua.obra_id = hallazgos_central.obra_id)
        )
      )
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and p.rol in (
        'super_admin_ce',
        'admin_cliente',
        'admin_mandante',
        'prevencionista_cliente',
        'supervisor_reportante',
        'responsable_cierre'
      )
      and (
        p.rol = 'super_admin_ce'
        or (
          hallazgos_central.empresa_id = p.empresa_id
          and (p.obra_id is null or hallazgos_central.obra_id = p.obra_id)
        )
        or exists (
          select 1 from public.usuario_asignaciones ua
          where ua.activo = true
            and (ua.usuario_id = p.id or ua.user_id = p.id)
            and ua.empresa_id = hallazgos_central.empresa_id
            and (ua.obra_id is null or ua.obra_id = hallazgos_central.obra_id)
        )
      )
  )
);

create policy roles_active_user_select
on public.roles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.activo = true
  )
);
