# HV-DATA contratos de filtros y DTOs

## Objetivo

Esta fase crea contratos TypeScript pasivos para preparar lecturas futuras de alto volumen en Panel Ejecutivo, KPI Gerencial, Detalle accionable, Seguimiento de Cierre, Mapa GPS, App movil e informes gerenciales.

No cambia consultas actuales, UI, comportamiento visible, Supabase SQL, Storage, RLS/policies, Google Maps, API key ni `.env.local`.

## Regla periodo + backlog

La lectura gerencial futura debe considerar:

- Hallazgos nuevos dentro del periodo seleccionado.
- Backlog historico anterior no cerrado.
- Hallazgos vencidos abiertos anteriores.
- Hallazgos sin fecha compromiso anteriores.
- Hallazgos en seguimiento sin cierre formal.
- Hallazgos cerrados durante el periodo, aunque hayan sido reportados antes.

Formula objetivo:

```text
Periodo visible = hallazgos del periodo + backlog historico no cerrado anterior + cerrados del periodo
```

Por defecto, `incluirBacklogNoCerrado` debe operar como `true` en futuras lecturas gerenciales para evitar ocultar brechas pendientes de meses anteriores.

## Contratos creados

- `HallazgosReadFilters`: filtros server-side futuros, periodo, backlog, trazabilidad, busqueda y paginacion.
- `KpiResumenDto`: agregados livianos para tableros y KPI.
- `ComparativoDto`: rankings y matriz comparativa.
- `HallazgoDetalleDto`: filas paginadas para listados accionables.
- `EvidenciaDto`: evidencias bajo demanda.
- `InformeGerencialDto`: base para informes sobre dataset filtrado real.

## Modulos futuros

Estos contratos preparan fases posteriores:

- HV-DATA-1C: periodo default y separacion periodo/backlog.
- HV-DATA-2: paginacion server-side en listados.
- HV-DATA-3/HV-DATA-4: agregados y rankings server-side.
- HV-DATA-5/HV-DATA-6: informes y exportaciones sobre dataset filtrado real.
- HV-DATA-7: Mapa GPS con clustering/bounds.
- HV-DATA-8: sincronizacion movil-PC.

## Fuera de alcance

Esta fase no implementa SQL, RPC, materialized views, indices, migraciones, servicios activos, consultas nuevas, cambios visuales, PDF real ni Excel real.
