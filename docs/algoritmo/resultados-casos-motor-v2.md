# FASE MOTOR-3D - Resultados casos motor V2

Documento generado a partir del runner aislado `generarReporteCasosMotorV2()`.

El motor V2 esta conectado al flujo `/evaluar-v2` mediante fallback seguro. MOTOR-3D agrega router semantico, base de conocimiento extensible por familias y preguntas adaptativas sugeridas.

## Resumen

- Total casos ejecutados: 15.
- Casos aprobados: 15.
- Casos fallidos: 0.
- Regla critica validada: no hay `CRITICO` sin senal critica real.
- Router validado: el caso "Maleta abierta en area de trabajo" queda como orden/aseo u objeto fuera de lugar, no legal/documental.

## Ajustes realizados durante MOTOR-3D

- Se agrego `diccionarioHallazgosV2.ts` como base de conocimiento por familias: palabras clave, sinonimos, frases frecuentes, exclusiones, ambitos, tipo de evento, base/tope de criticidad, senales de elevacion, senales que permiten CRITICO, normativa probable y revision manual.
- Se agrego `routerHallazgoV2.ts` para clasificar por descripcion, tipo, area, actividad y respuestas con nivel de confianza.
- Se agrego `preguntasAdaptativasV2.ts` con bancos de preguntas por modulo y fallback por confianza baja.
- `evaluarHallazgoV2()` usa el router antes de clasificar ambito y tipo de evento.
- Las respuestas documentales genericas ya no fuerzan legal/documental si la descripcion apunta a orden/aseo, electrico, derrame u otra categoria operacional.
- Para hallazgos menores de orden/aseo, la normativa probable queda como marco preventivo general y no como transgresion especifica DS 44.
- La salida incluye modulo aplicado, preguntas sugeridas, preguntas criticas respondidas, preguntas faltantes recomendadas y justificacion de seleccion del modulo.

## Tabla de resultados

| Caso | Categoria detectada | Ambito | Tipo evento | Criticidad esperada | Criticidad obtenida | Aprobado | Normativa probable | Observacion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Maleta abierta en area de trabajo | orden_aseo_objeto_fuera_lugar | seguridad_laboral | condicion_subestandar | BAJO/MEDIO | BAJO | Si | Gestion preventiva general | No queda CRITICO, no exige suspension y no se clasifica como legal/documental. |
| Objeto bloqueando salida de emergencia | evacuacion | emergencia | emergencia | ALTO/CRITICO | ALTO | Si | Ley 16.744; DS 44 | CRITICO solo si el bloqueo efectivo queda confirmado. |
| Derrame menor contenido en bandeja | derrame_fuga | medio_ambiente | aspecto_ambiental | MEDIO | MEDIO | Si | DS 594; Ley 19.300; sustancias peligrosas aplicable | Diferencia aspecto ambiental contenido de impacto ambiental critico. |
| Derrame de sustancia peligrosa hacia suelo o alcantarillado | derrame_fuga | medio_ambiente | impacto_ambiental | CRITICO | CRITICO | Si | DS 594; Ley 19.300; sustancias peligrosas; agua; suelo | Requiere contencion ambiental. |
| Residuo peligroso mal segregado sin exposicion | residuos | medio_ambiente | aspecto_ambiental | ALTO | ALTO | Si | Ley 19.300; residuos | No queda CRITICO sin exposicion ni liberacion. |
| Cable energizado expuesto | electrico | seguridad_laboral | condicion_subestandar | CRITICO | CRITICO | Si | Ley 16.744; DS 44 | Requiere suspension. |
| Piso mojado en transito activo | transito_caida_mismo_nivel | seguridad_laboral | condicion_subestandar | MEDIO/ALTO | ALTO | Si | Ley 16.744; DS 44 | No queda CRITICO por defecto. |
| Trabajo en altura sin arnes | caida_altura | seguridad_laboral | condicion_subestandar | CRITICO | CRITICO | Si | Ley 16.744; DS 44 | Requiere suspension. |
| Documento faltante sin actividad riesgosa inmediata | documentos_legales_preventivos | legal_documental | desviacion_legal_documental | BAJO/MEDIO | MEDIO | Si | DS 44 | No queda CRITICO. |
| Sin AST para trabajo en altura | procedimientos_ast_permisos | legal_documental | desviacion_legal_documental | ALTO/CRITICO | CRITICO | Si | Ley 16.744; DS 44 | Mixto documental y trabajo critico; requiere preguntas de exposicion y suspension. |
| Documento faltante para trabajo critico en ejecucion | legal_documental | legal_documental | desviacion_legal_documental | ALTO/CRITICO | CRITICO | Si | DS 44 | Puede ser CRITICO por exposicion y actividad critica activa. |
| Emision de polvo visible sin control con trabajadores expuestos | salud_ocupacional_ruido_polvo_quimicos | salud_ocupacional | aspecto_ambiental | MEDIO/ALTO | ALTO | Si | DS 594; Ley 19.300; emisiones | Salud/ambiente, no CRITICO sin condicion severa inmediata. |
| Ruido elevado sin proteccion ni evaluacion | salud_ocupacional_ruido_polvo_quimicos | salud_ocupacional | condicion_subestandar | MEDIO/ALTO | ALTO | Si | DS 594; ruido | Requiere medicion para conclusion legal especifica. |
| Extintor parcialmente obstruido | incendio_emergencia | emergencia | emergencia | MEDIO/ALTO | ALTO | Si | Ley 16.744; DS 44; DS 594 | Depende de criticidad del area y acceso real. |
| Sustancia quimica sin rotulacion sin derrame | sustancias_peligrosas | medio_ambiente | aspecto_ambiental | ALTO | ALTO | Si | Ley 19.300; sustancias peligrosas | CRITICO solo si hay exposicion, fuga o condicion grave. |

## Confirmaciones clave

- Maleta abierta: `BAJO`, categoria `orden_aseo_objeto_fuera_lugar`, ambito `seguridad_laboral`, tipo `condicion_subestandar`, sin suspension y sin DS 44 como transgresion especifica.
- Derrame contenido: `MEDIO`, categoria `derrame_fuga`, sin contencion obligatoria si esta contenido.
- Derrame hacia suelo/alcantarillado: `CRITICO`, categoria `derrame_fuga`, requiere contencion ambiental.
- Cable energizado expuesto: `CRITICO`, categoria `electrico`, requiere suspension.
- Documento faltante sin actividad riesgosa: `MEDIO`, categoria `documentos_legales_preventivos`, no `CRITICO`.
- Sin AST para trabajo en altura: `CRITICO` por exposicion y actividad critica, categoria `procedimientos_ast_permisos`, con preguntas mixtas de documento, exposicion y suspension.
