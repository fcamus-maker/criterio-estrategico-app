-- Esquema de referencia para la futura base central de Plataforma Hallazgos.
-- NO EJECUTAR TODAVIA.
-- Este archivo documenta la estructura objetivo para conectar:
-- app movil V2 -> Supabase/base central -> panel PC -> Radar -> Mapa GPS -> KPI.
--
-- Antes de ejecutar en un proyecto real se debe revisar:
-- 1. estrategia de codigos unicos centralizados;
-- 2. bucket Storage `hallazgos-evidencias`;
-- 3. RLS/policies multiempresa;
-- 4. migracion desde datos locales/mock;
-- 5. plan de rollback y entorno de prueba.

create table if not exists public.hallazgos_central (
  id uuid primary key default gen_random_uuid(),

  -- Identificacion visible y origen.
  codigo text not null unique,
  codigo_informe text,
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

  -- Supervisor/reportante.
  reportante_nombre text not null,
  reportante_cargo text,
  reportante_empresa text,
  reportante_telefono text,
  reportante_email text,
  reportante_foto_url text,

  -- Registro del hallazgo.
  fecha_reporte date,
  hora_reporte time,
  fecha_hora_reporte timestamptz,
  descripcion text not null,
  tipo_hallazgo text not null default 'Condicion subestandar',

  -- Evaluacion, criticidad y recomendaciones.
  criticidad text not null default 'BAJO',
  prioridad text,
  puntaje_evaluacion numeric,
  respuestas_evaluacion jsonb not null default '{}'::jsonb,
  accion_inmediata text,
  recomendacion text,

  -- Estado operativo y cierre.
  estado text not null default 'ABIERTO',
  estado_cierre text not null default 'PENDIENTE',

  -- Evidencias. En produccion se recomienda guardar archivos en Storage
  -- y conservar aqui URL, storage_path y metadatos, no base64 pesado.
  -- Estructura sugerida de cada item:
  -- { id, nombre, tipo, storagePath, url, fechaCarga, origen, tamanoBytes }
  evidencias jsonb not null default '[]'::jsonb,

  -- Geolocalizacion para mapa GPS y trazabilidad territorial.
  latitud numeric(10, 7),
  longitud numeric(10, 7),
  precision_gps numeric,
  fecha_hora_geolocalizacion timestamptz,
  estado_geolocalizacion text,
  direccion_referencial text,
  zona text,
  sector text,
  visible_en_mapa boolean not null default true,
  geolocalizacion jsonb not null default '{}'::jsonb,

  -- Seguimiento de cierre y responsable real de correccion.
  responsable_cierre_tipo text,
  responsable_cierre_nombre text,
  responsable_cierre_cargo text,
  responsable_cierre_empresa text,
  responsable_cierre_telefono text,
  responsable_cierre_email text,
  fecha_compromiso_cierre date,
  fecha_maxima_permitida_cierre date,
  plazo_cierre_por_criticidad text,
  observacion_inicial_cierre text,
  accion_correctiva_requerida text,
  evidencia_requerida jsonb not null default '[]'::jsonb,
  evidencia_recibida jsonb not null default '[]'::jsonb,
  fecha_cierre timestamptz,
  validador_cierre_nombre text,
  validador_cierre_estado text,
  validador_cierre_observacion text,
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

  -- Bitacora, auditoria y datos crudos de transicion.
  bitacora jsonb not null default '[]'::jsonb,
  raw_mobile_v2 jsonb,
  raw_panel jsonb,
  creado_por text,
  actualizado_por text,
  dispositivo_id text,
  version_app text,
  user_agent text,
  ip_registro inet,

  -- Fechas de auditoria y sincronizacion.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz
);

create index if not exists hallazgos_central_codigo_idx
  on public.hallazgos_central (codigo);

create index if not exists hallazgos_central_estado_idx
  on public.hallazgos_central (estado, estado_cierre);

create index if not exists hallazgos_central_empresa_obra_idx
  on public.hallazgos_central (empresa, obra);

create index if not exists hallazgos_central_area_idx
  on public.hallazgos_central (area);

create index if not exists hallazgos_central_fecha_reporte_idx
  on public.hallazgos_central (fecha_hora_reporte);

create index if not exists hallazgos_central_criticidad_idx
  on public.hallazgos_central (criticidad);

create index if not exists hallazgos_central_responsable_cierre_idx
  on public.hallazgos_central (
    responsable_cierre_empresa,
    responsable_cierre_nombre,
    estado_cierre
  );

create index if not exists hallazgos_central_gps_idx
  on public.hallazgos_central (latitud, longitud)
  where latitud is not null and longitud is not null;

create index if not exists hallazgos_central_radar_idx
  on public.hallazgos_central (
    radar_categoria_riesgo,
    radar_causa_dominante,
    radar_nivel_exposicion
  );

-- Storage futuro recomendado:
-- bucket: hallazgos-evidencias
-- path: empresa/{empresa}/obra/{obra}/hallazgo/{codigo}/{evidencia_id}.jpg
-- No guardar Base64 en esta tabla central.

-- RLS futuro recomendado:
-- enable row level security on public.hallazgos_central;
-- Crear policies por empresa/obra/rol despues de definir autenticacion real.
-- No activar policies sin pruebas multiempresa y usuarios de mandante/contratista.
