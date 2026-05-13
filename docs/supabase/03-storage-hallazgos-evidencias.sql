-- Plataforma Hallazgos - Storage evidencias.
-- NO EJECUTAR TODAVIA.
-- Requiere revisar modelo de acceso y RLS antes de crear bucket real.

-- Opcion SQL si se decide crear bucket desde SQL Editor Supabase:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hallazgos-evidencias',
  'hallazgos-evidencias',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Estructura recomendada de path:
-- empresa/{empresa}/obra/{obra}/hallazgo/{codigo}/{evidencia_id}.jpg
--
-- Reglas:
-- 1. No guardar Base64 en public.hallazgos_central.
-- 2. Guardar storagePath, tipo MIME, tamano, fecha y origen en evidencias JSONB.
-- 3. No hacer bucket publico sin decision formal de seguridad.
-- 4. Preferir URLs firmadas para evidencia sensible.
-- 5. Mantener copia local temporal si falla subida desde app movil.
--
-- Ejemplo de metadato en hallazgos_central.evidencias:
-- {
--   "id": "uuid",
--   "nombre": "antes-cierre.jpg",
--   "tipo": "image/jpeg",
--   "storagePath": "empresa/tnt/obra/pel/hallazgo/CE-PEL-TNT-0001/uuid.jpg",
--   "url": null,
--   "fechaCarga": "2026-05-13T12:00:00.000Z",
--   "origen": "mobile-v2",
--   "tamanoBytes": 240000
-- }
