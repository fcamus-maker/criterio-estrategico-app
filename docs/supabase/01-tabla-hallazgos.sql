-- Plataforma Hallazgos - tabla central Supabase.
-- NO EJECUTAR TODAVIA.
-- Revisar en entorno de prueba antes de cualquier activacion real.

create extension if not exists pgcrypto;

create table if not exists public.hallazgos_central (
  id uuid primary key default gen_random_uuid(),

  -- Identificacion visible, origen y sincronizacion.
  codigo text not null unique,
  codigo_informe text,
  codigo_local text,
  origen text not null default 'mobile-v2',
  estado_sincronizacion text not null default 'SINCRONIZADO',

  -- Contexto operacional.
  empresa text not null,
  obra text not null,
  proyecto text,
  area text not null,
  sigla_empresa text,
  sigla_proyecto text,
  contratista text,

  -- Reportante/supervisor.
  reportante_nombre text not null,
  reportante_cargo text,
  reportante_empresa text,
  reportante_telefono text,
  reportante_email text,
  reportante_foto_url text,
  supervisor_nombre text,
  supervisor_cargo text,

  -- Registro del hallazgo.
  fecha_reporte date,
  hora_reporte time,
  fecha_iso timestamptz,
  fecha_hora_reporte timestamptz,
  descripcion text not null,
  tipo_hallazgo text not null default 'Condicion subestandar',

  -- Evaluacion preventiva.
  criticidad text not null default 'BAJO',
  prioridad text,
  puntaje_evaluacion numeric,
  evaluacion jsonb not null default '{}'::jsonb,
  respuestas_evaluacion jsonb not null default '{}'::jsonb,
  recomendacion text,
  accion_inmediata text,

  -- Estado operativo.
  estado text not null default 'ABIERTO',
  estado_cierre text not null default 'PENDIENTE',
  estado_seguimiento text not null default 'PENDIENTE',

  -- GPS y territorio.
  gps_latitud numeric(10, 7),
  gps_longitud numeric(10, 7),
  gps_precision numeric,
  gps_zona text,
  gps_sector text,
  gps_fecha_hora timestamptz,
  gps_estado text,
  gps_direccion_referencial text,
  visible_en_mapa boolean not null default true,
  geolocalizacion jsonb not null default '{}'::jsonb,

  -- Evidencias: guardar paths/URLs/metadatos, nunca Base64 en tabla central.
  evidencias jsonb not null default '[]'::jsonb,
  fotos jsonb not null default '[]'::jsonb,

  -- Seguimiento de cierre.
  responsable_cierre_nombre text,
  responsable_cierre_empresa text,
  responsable_cierre_cargo text,
  responsable_cierre_telefono text,
  responsable_cierre_email text,
  responsable_cierre_tipo text,
  fecha_compromiso date,
  fecha_compromiso_cierre date,
  fecha_maxima_permitida_cierre date,
  fecha_cierre timestamptz,
  observacion_inicial_cierre text,
  accion_correctiva_requerida text,
  evidencia_requerida jsonb not null default '[]'::jsonb,
  evidencia_recibida jsonb not null default '[]'::jsonb,
  seguimiento_cierre jsonb not null default '{}'::jsonb,

  -- Radar Preventivo y analitica.
  radar_categoria_riesgo text,
  radar_causa_dominante text,
  radar_palabras_clave text[] not null default '{}',
  radar_nivel_exposicion text,
  radar_potencial_severidad text,
  radar_probabilidad_repeticion text,
  radar_requiere_accion_inmediata boolean not null default false,
  radar_requiere_detencion_trabajo boolean not null default false,
  radar_indicadores jsonb not null default '{}'::jsonb,

  -- Auditoria y datos crudos.
  bitacora jsonb not null default '[]'::jsonb,
  raw_mobile_v2 jsonb,
  raw_panel jsonb,
  creado_por text,
  actualizado_por text,
  dispositivo_id text,
  version_app text,
  user_agent text,
  ip_registro inet,

  -- Control multiempresa futuro. Requiere modelo real de usuarios/claims.
  empresa_id uuid,
  obra_id uuid,
  mandante_id uuid,
  contratista_id uuid,
  supervisor_user_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz
);

comment on table public.hallazgos_central is
  'Tabla central preparada para Plataforma Hallazgos. No guardar Base64 en evidencias/fotos.';

comment on column public.hallazgos_central.evidencias is
  'JSONB con storagePath, url firmada/publica, tipo, tamano y metadatos. Sin Base64.';

comment on column public.hallazgos_central.codigo_local is
  'Codigo temporal generado offline por dispositivo; codigo central puede reemplazarlo.';
