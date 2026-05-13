-- Plataforma Hallazgos - indices para consultas ejecutivas.
-- NO EJECUTAR TODAVIA.

create index if not exists hallazgos_central_codigo_idx
  on public.hallazgos_central (codigo);

create index if not exists hallazgos_central_codigo_local_idx
  on public.hallazgos_central (codigo_local)
  where codigo_local is not null;

create index if not exists hallazgos_central_empresa_idx
  on public.hallazgos_central (empresa);

create index if not exists hallazgos_central_obra_idx
  on public.hallazgos_central (obra);

create index if not exists hallazgos_central_empresa_obra_idx
  on public.hallazgos_central (empresa, obra);

create index if not exists hallazgos_central_empresa_obra_fecha_idx
  on public.hallazgos_central (empresa, obra, fecha_iso desc);

create index if not exists hallazgos_central_area_idx
  on public.hallazgos_central (area);

create index if not exists hallazgos_central_criticidad_idx
  on public.hallazgos_central (criticidad);

create index if not exists hallazgos_central_empresa_estado_criticidad_idx
  on public.hallazgos_central (empresa, estado, criticidad);

create index if not exists hallazgos_central_obra_area_criticidad_idx
  on public.hallazgos_central (obra, area, criticidad);

create index if not exists hallazgos_central_estado_idx
  on public.hallazgos_central (estado);

create index if not exists hallazgos_central_estado_cierre_idx
  on public.hallazgos_central (estado_cierre, estado_seguimiento);

create index if not exists hallazgos_central_tipo_hallazgo_idx
  on public.hallazgos_central (tipo_hallazgo);

create index if not exists hallazgos_central_fecha_reporte_idx
  on public.hallazgos_central (fecha_reporte);

create index if not exists hallazgos_central_fecha_iso_idx
  on public.hallazgos_central (fecha_iso);

create index if not exists hallazgos_central_responsable_cierre_idx
  on public.hallazgos_central (
    responsable_cierre_empresa,
    responsable_cierre_nombre,
    estado_seguimiento
  );

create index if not exists hallazgos_central_seguimiento_fecha_idx
  on public.hallazgos_central (estado_seguimiento, fecha_compromiso);

create index if not exists hallazgos_central_gps_idx
  on public.hallazgos_central (gps_latitud, gps_longitud)
  where gps_latitud is not null and gps_longitud is not null;

create index if not exists hallazgos_central_created_at_idx
  on public.hallazgos_central (created_at desc);

create index if not exists hallazgos_central_radar_idx
  on public.hallazgos_central (
    radar_categoria_riesgo,
    radar_causa_dominante,
    radar_nivel_exposicion
  );

create index if not exists hallazgos_central_kpi_periodo_idx
  on public.hallazgos_central (
    empresa,
    obra,
    fecha_iso desc,
    estado,
    criticidad
  );

create index if not exists hallazgos_central_multiempresa_idx
  on public.hallazgos_central (empresa_id, obra_id)
  where empresa_id is not null;
