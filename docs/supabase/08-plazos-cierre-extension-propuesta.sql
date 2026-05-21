-- Propuesta controlada Fase 2D-B: trazabilidad de plazos de cierre.
-- NO EJECUTAR AUTOMATICAMENTE.
-- Revisar en Supabase SQL Editor antes de aplicar en un ambiente controlado.

alter table public.hallazgos_central
  add column if not exists plazo_estado text,
  add column if not exists plazo_extendido boolean not null default false,
  add column if not exists justificacion_extension_plazo text,
  add column if not exists seguimiento_cierre_actualizado_en timestamptz,
  add column if not exists seguimiento_cierre_actualizado_por text;

comment on column public.hallazgos_central.plazo_estado is
  'Estado operativo del plazo de cierre: Sin fecha compromiso, Dentro de plazo, Vence mañana, Vence hoy, Vencido o Plazo extendido.';

comment on column public.hallazgos_central.plazo_extendido is
  'Indica que la fecha compromiso supera el plazo recomendado por criticidad y cuenta con justificacion.';

comment on column public.hallazgos_central.justificacion_extension_plazo is
  'Justificacion obligatoria cuando la fecha compromiso excede el plazo recomendado por criticidad.';

comment on column public.hallazgos_central.seguimiento_cierre_actualizado_en is
  'Fecha y hora de la ultima actualizacion operativa del seguimiento de cierre.';

comment on column public.hallazgos_central.seguimiento_cierre_actualizado_por is
  'Usuario o identificador responsable de la ultima actualizacion operativa del seguimiento de cierre.';

create index if not exists idx_hallazgos_central_plazo_cierre
  on public.hallazgos_central (plazo_estado, plazo_extendido, fecha_compromiso);

