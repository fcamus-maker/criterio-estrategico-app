-- FASE FINAL-2H - POLICIES DE LECTURA MINIMA EJECUTADAS.
-- DOCUMENTACION / NO EJECUTAR AUTOMATICAMENTE.
--
-- Alcance documentado:
-- - Permitir lectura minima de empresas asignadas al usuario autenticado.
-- - Permitir lectura minima de obras asignadas al usuario autenticado.
-- - Permitir lectura de las asignaciones propias del usuario autenticado.
--
-- Protecciones:
-- - NO activa RLS.
-- - NO crea policies nuevas fuera de las tres documentadas.
-- - NO toca Storage.
-- - NO modifica datos.
-- - NO contiene credenciales.
--
-- Policies minimas ejecutadas en FASE FINAL-2H:
-- - empresas_select_by_profile_scope
-- - obras_select_by_profile_scope
-- - usuario_asignaciones_select_own_scope

create policy empresas_select_by_profile_scope
on public.empresas
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.activo = true
      and (
        p.rol = 'super_admin_ce'
        or p.empresa_id = empresas.id
      )
  )
  or exists (
    select 1
    from public.usuario_asignaciones ua
    where ua.usuario_id = auth.uid()
      and ua.empresa_id = empresas.id
      and ua.activo = true
  )
);

create policy obras_select_by_profile_scope
on public.obras
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.activo = true
      and (
        p.rol = 'super_admin_ce'
        or p.obra_id = obras.id
        or p.empresa_id = obras.empresa_id
      )
  )
  or exists (
    select 1
    from public.usuario_asignaciones ua
    where ua.usuario_id = auth.uid()
      and ua.empresa_id = obras.empresa_id
      and (ua.obra_id is null or ua.obra_id = obras.id)
      and ua.activo = true
  )
);

create policy usuario_asignaciones_select_own_scope
on public.usuario_asignaciones
for select
to authenticated
using (
  usuario_id = auth.uid()
);
