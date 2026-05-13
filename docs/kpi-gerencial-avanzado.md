# Modulo futuro: KPI Gerencial Avanzado

Estado: funcionalidad futura de alto valor gerencial y comercial. Este documento
registra el alcance esperado; no implementa interfaz, consultas reales ni
exportaciones.

## Objetivo

Crear una ventana ejecutiva exclusiva para que gerencia analice hallazgos desde
distintos cruces, filtros y periodos, y pueda construir informes segun la
necesidad de cada obra, empresa o contrato.

## Filtros y cruces requeridos

- Empresa, contratista, obra, proyecto y area.
- Fecha, semana, mes, periodo cerrado y rango personalizado.
- Estado: abiertos, cerrados, vencidos y en seguimiento.
- Criticidad: critico, alto, medio y bajo.
- Tipo de hallazgo y clasificacion operacional.
- Responsable real de cierre.
- Supervisor reportante.
- Reincidencias por empresa, obra, area, tipo y criticidad.

## Analisis gerencial esperado

- Ranking de empresas con mas hallazgos.
- Ranking de areas con mayor concentracion.
- Ranking por criticidad y estado.
- Comparacion entre empresas.
- Comparacion entre periodos.
- Hallazgos criticos abiertos.
- Hallazgos vencidos o sin gestion.
- Tendencias de reincidencia.
- Indicadores de cumplimiento de cierre.
- Resumen ejecutivo desde filtros seleccionados.

## Salidas futuras

- Vista gerencial interactiva para explorar datos.
- Informe ejecutivo armado desde filtros activos.
- Exportacion a PDF.
- Exportacion a Excel.
- Insumos para presentaciones de gerencia, comites y reuniones con empresas.

## Dependencias tecnicas

- Contrato central `HallazgoCentral`.
- Fuente central de hallazgos cuando Supabase quede activo.
- Adaptadores hacia panel PC y analitica.
- Datos completos de seguimiento de cierre, criticidad, geolocalizacion y
  responsable real de cierre.

## No incluido en esta etapa

- No se crea pantalla nueva.
- No se agregan botones al panel actual.
- No se conecta Supabase.
- No se generan PDF ni Excel.
- No se reemplazan KPIs actuales del dashboard.
