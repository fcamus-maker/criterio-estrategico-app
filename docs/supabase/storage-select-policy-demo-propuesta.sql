-- Plataforma Hallazgos - Policy temporal de lectura Storage para demo.
-- TEMPORAL DEMO / NO PRODUCCION.
--
-- OBJETIVO:
-- Permitir que el panel PC pueda generar/ver URLs firmadas de evidencias
-- fotograficas del bucket privado hallazgos-evidencias durante una demo
-- controlada.
--
-- IMPORTANTE:
-- - NO ejecutar en produccion final.
-- - NO hace publico el bucket.
-- - NO usa service_role en frontend.
-- - NO permite delete.
-- - NO permite update.
-- - NO permite acceso a otros buckets.
-- - Debe reemplazarse por policies definitivas con Auth + empresa_id + obra_id.
-- - Usar solo con datos ficticios o no sensibles.
--
-- Contexto tecnico:
-- El panel usa createSignedUrl() contra el bucket privado. Para que Supabase
-- pueda firmar/leer el objeto con anon/authenticated, storage.objects necesita
-- una policy de SELECT que permita la ruta esperada.

drop policy if exists "demo_select_hallazgos_evidencias" on storage.objects;

create policy "demo_select_hallazgos_evidencias"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'hallazgos-evidencias'
  and name like 'empresa/%/obra/%/hallazgo/%/%'
);

-- NO incluir policies de update/delete.
-- NO ejecutar:
-- update storage.buckets set public = true ...
--
-- Rollback de esta policy temporal:
-- drop policy if exists "demo_select_hallazgos_evidencias" on storage.objects;
