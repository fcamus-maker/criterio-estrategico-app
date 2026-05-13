-- Plataforma Hallazgos - propuesta RLS/policies multiempresa.
-- NO EJECUTAR TODAVIA.
-- Estas policies requieren un modelo real de auth, roles y claims.

-- Claims sugeridos en auth.jwt() -> app_metadata:
-- {
--   "rol": "ce_admin" | "cliente" | "mandante" | "contratista" | "supervisor",
--   "empresa_id": "uuid",
--   "obra_ids": ["uuid"],
--   "contratista_id": "uuid"
-- }

alter table public.hallazgos_central enable row level security;

-- Administrador CE: lectura total.
create policy "ce_admin_select_all_hallazgos"
on public.hallazgos_central
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'ce_admin');

-- Cliente empresa: solo su empresa.
create policy "cliente_select_empresa_hallazgos"
on public.hallazgos_central
for select
to authenticated
using (
  empresa_id::text = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')
);

-- Mandante: obras asociadas. Requiere claim obra_ids como array JSON.
create policy "mandante_select_obras_hallazgos"
on public.hallazgos_central
for select
to authenticated
using (
  obra_id::text in (
    select jsonb_array_elements_text(auth.jwt() -> 'app_metadata' -> 'obra_ids')
  )
);

-- Contratista: registros asociados a su contratista.
create policy "contratista_select_propios_hallazgos"
on public.hallazgos_central
for select
to authenticated
using (
  contratista_id::text = (auth.jwt() -> 'app_metadata' ->> 'contratista_id')
);

-- Supervisor: inserta hallazgos autorizados para su empresa/obra.
create policy "supervisor_insert_hallazgos"
on public.hallazgos_central
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'rol') in ('ce_admin', 'supervisor')
  and (
    empresa_id::text = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')
    or (auth.jwt() -> 'app_metadata' ->> 'rol') = 'ce_admin'
  )
);

-- Actualizacion de cierre: limitar a roles autorizados.
create policy "cierre_update_hallazgos"
on public.hallazgos_central
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'rol') in (
    'ce_admin',
    'supervisor',
    'contratista'
  )
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'rol') in (
    'ce_admin',
    'supervisor',
    'contratista'
  )
);

-- Storage policies propuestas. Requieren bucket ya creado.
create policy "read_own_hallazgo_evidencias"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hallazgos-evidencias'
  and (
    (auth.jwt() -> 'app_metadata' ->> 'rol') = 'ce_admin'
    or name like (
      'empresa/' || coalesce(auth.jwt() -> 'app_metadata' ->> 'empresa_id', '') || '/%'
    )
  )
);

create policy "upload_hallazgo_evidencias"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hallazgos-evidencias'
  and (auth.jwt() -> 'app_metadata' ->> 'rol') in (
    'ce_admin',
    'supervisor',
    'contratista'
  )
);

-- Advertencias:
-- 1. No usar estas policies sin probar usuarios reales y claims.
-- 2. Si no existen empresa_id/obra_id/contratista_id, crear tabla de perfiles.
-- 3. La anon key sin auth real no debe leer datos multiempresa.
