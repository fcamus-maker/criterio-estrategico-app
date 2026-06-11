# FASE MOTOR-3B - Resultados casos motor V2

Documento generado a partir del runner aislado `generarReporteCasosMotorV2()`.

El motor V2 sigue aislado y no esta conectado a `/evaluar-v2`.

## Resumen

- Total casos ejecutados: 14.
- Casos aprobados: 14.
- Casos fallidos: 0.
- Regla critica validada: no hay `CRITICO` sin senal critica real.

## Ajustes realizados durante MOTOR-3B

- Se agrego `runCasosMotorV2.ts` para generar un reporte detallado de casos sin ejecutar nada en runtime productivo.
- Se ajusto la medida inmediata de hallazgos menores para indicar retirar/ordenar/verificar transito.
- Se corrigio la regla de hallazgo menor: la palabra generica `menor` ya no degrada eventos ambientales como derrames contenidos.
- Se corrigio la deteccion legal de ruido para evitar falsos positivos por substrings como `obstruido`.

## Tabla de resultados

| Caso | Criticidad esperada | Criticidad obtenida | Aprobado | Justificacion principal | Revision manual | Normativa probable | Observacion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Maleta abierta inofensiva sin transito | BAJO/MEDIO | BAJO | Si | Base BAJO; final BAJO; limitado por sin exposicion, controles suficientes y bajo potencial. | No | Ley 16.744; DS 44 | No queda CRITICO y no exige suspension. Medida simple: retirar/ordenar/verificar transito. |
| Objeto bloqueando salida de emergencia | ALTO/CRITICO | ALTO | Si | Base MEDIO; sube por exposicion potencial, consecuencia grave y controles inexistentes. | No | Ley 16.744; DS 44 | CRITICO solo si el bloqueo efectivo queda confirmado. |
| Derrame menor contenido en bandeja | MEDIO | MEDIO | Si | Base MEDIO; final MEDIO; limitado por derrame contenido. | No | Ley 19.300; sustancias peligrosas aplicable | Diferencia aspecto ambiental contenido de impacto ambiental critico. |
| Derrame de sustancia peligrosa hacia suelo o alcantarillado | CRITICO | CRITICO | Si | Senales criticas: derrame no contenido hacia suelo/agua/alcantarillado y sustancia peligrosa liberada. | No | Ley 19.300; sustancias peligrosas; agua; suelo | Requiere contencion ambiental. |
| Residuo peligroso mal segregado sin exposicion | ALTO | ALTO | Si | Base MEDIO; sube por residuo peligroso y controles parciales. | No | Ley 19.300; residuos | No queda CRITICO sin exposicion ni liberacion. |
| Cable energizado expuesto | CRITICO | CRITICO | Si | Senales criticas: energia peligrosa expuesta y riesgo grave/fatal con exposicion directa. | No | Ley 16.744; DS 44 | Requiere suspension. |
| Piso mojado en transito activo | MEDIO/ALTO | ALTO | Si | Base MEDIO; sube por exposicion potencial y controles inexistentes. | No | Ley 16.744; DS 44 | No queda CRITICO por defecto. |
| Trabajo en altura sin arnes | CRITICO | CRITICO | Si | Senales criticas: altura sin proteccion, riesgo grave/fatal y suspension inmediata. | No | Ley 16.744; DS 44 | Requiere suspension. |
| Documento faltante sin actividad riesgosa inmediata | BAJO/MEDIO | MEDIO | Si | Base MEDIO; limitado por sin exposicion y documento faltante sin actividad riesgosa. | No | DS 44 | No queda CRITICO. |
| Documento faltante para trabajo critico en ejecucion | ALTO/CRITICO | CRITICO | Si | Senales criticas: riesgo grave/fatal con exposicion directa y falta documental habilitante. | No | DS 44 | Puede ser CRITICO por exposicion y actividad critica activa. |
| Emision de polvo visible sin control con trabajadores expuestos | MEDIO/ALTO | ALTO | Si | Base MEDIO; sube por exposicion directa y controles inexistentes. | No | DS 594; Ley 19.300; emisiones | Salud/ambiente, no CRITICO sin condicion severa inmediata. |
| Ruido elevado sin proteccion ni evaluacion | MEDIO/ALTO | ALTO | Si | Base MEDIO; sube por exposicion directa y controles inexistentes. | No | DS 594; ruido | Requiere medicion para conclusion legal especifica. |
| Extintor parcialmente obstruido | MEDIO/ALTO | ALTO | Si | Base MEDIO; sube por exposicion potencial, consecuencia grave y controles parciales. | No | Ley 16.744; DS 44; DS 594 | Depende de criticidad del area y acceso real. |
| Sustancia quimica sin rotulacion sin derrame | ALTO | ALTO | Si | Base MEDIO; sube por exposicion potencial, controles parciales y sustancia peligrosa involucrada. | No | DS 594; Ley 19.300; sustancias peligrosas | CRITICO solo si hay exposicion, fuga o condicion grave. |

## Confirmaciones clave

- Maleta inofensiva: `BAJO`, no `CRITICO`, sin suspension.
- Cable energizado expuesto: `CRITICO`.
- Trabajo en altura sin arnes: `CRITICO`.
- Derrame peligroso hacia suelo/alcantarillado: `CRITICO` ambiental con contencion.
- Documento faltante sin actividad riesgosa: `MEDIO`, no `CRITICO`.
- Derrame contenido: `MEDIO`, no `CRITICO`.

