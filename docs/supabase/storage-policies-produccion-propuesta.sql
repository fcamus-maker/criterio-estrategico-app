-- Plataforma Hallazgos - Storage policies produccion propuesta.
-- NO EJECUTAR TODAVIA.
-- Requiere que existan public.profiles, public.usuario_empresa_obra y RLS base.
-- Bucket objetivo: hallazgos-evidencias, privado.

-- IMPORTANTE:
-- Antes de produccion eliminar las policies temporales anon usadas para prueba:
-- drop policy if exists "dev_anon_insert_hallazgos_evidencias" on storage.objects;
-- drop policy if exists "dev_anon_select_hallazgos_evidencias" on storage.objects;

update storage.buckets
set public = false
where id = 'hallazgos-evidencias';

create or replace function public.storage_empresa_segmento(p_name text)
returns text
language sql
immutable
as $$
  select nullif(split_part(p_name, '/', 2), '');
$$;

create or replace function public.storage_obra_segmento(p_name text)
returns text
language sql
immutable
as $$
  select nullif(split_part(p_name, '/', 4), '');
$$;

-- Recomendacion productiva: usar UUID o codigo estable de empresa/obra en path.
-- Path objetivo:
-- empresa/{empresa_id}/obra/{obra_id}/hallazgo/{codigo}/{evidencia_id}.jpg

create policy "storage_evidencias_select_autenticado_alcance"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hallazgos-evidencias'
  and (
    public.es_super_admin_ce()
    or exists (
      select 1
      from public.usuario_empresa_obra a
      where a.usuario_id = auth.uid()
        and a.activo = true
        and a.empresa_id::text = public.storage_empresa_segmento(storage.objects.name)
        and (
          a.obra_id is null
          or a.obra_id::text = public.storage_obra_segmento(storage.objects.name)
        )
    )
  )
);

create policy "storage_evidencias_insert_supervisor_autorizado"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hallazgos-evidencias'
  and name like 'empresa/%/obra/%/hallazgo/%/%'
  and (
    public.es_super_admin_ce()
    or exists (
      select 1
      from public.usuario_empresa_obra a
      join public.profiles p on p.id = a.usuario_id
      where a.usuario_id = auth.uid()
        and a.activo = true
        and p.activo = true
        and p.rol in (
          'super_admin_ce',
          'admin_cliente',
          'prevencionista_cliente',
          'supervisor_reportante',
          'responsable_cierre'
        )
        and a.empresa_id::text = public.storage_empresa_segmento(storage.objects.name)
        and (
          a.obra_id is null
          or a.obra_id::text = public.storage_obra_segmento(storage.objects.name)
        )
    )
  )
);

-- No crear delete policy.
-- No crear update policy salvo flujo formal de reemplazo con bitacora.
-- Para visualizacion sensible, preferir signed URLs generadas server-side.

