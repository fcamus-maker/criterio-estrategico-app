# FASE MOTOR-2 - Casos de prueba del motor V2

Documento de diseno. No modifica codigo funcional.

Cada caso incluye input resumido, respuestas simuladas, resultado esperado, justificacion, norma probable y revision manual.

## 1. Maleta abierta inofensiva sin transito

- Input: objeto personal/maleta abierta en sector sin transito activo, sin bloqueo, sin personas expuestas.
- Respuestas simuladas: tipo orden/aseo menor; exposicion no; consecuencia leve; controles simples; sin documento aplicable.
- Resultado esperado: `BAJO` o `MEDIO`, nunca `CRITICO`.
- Justificacion: hallazgo menor sin exposicion directa ni obstruccion critica.
- Norma probable: procedimiento interno de orden y aseo; no citar norma legal.
- Revision manual: no, salvo descripcion contradictoria.

## 2. Objeto bloqueando salida de emergencia

- Input: objeto obstruye salida o ruta de evacuacion.
- Respuestas simuladas: via evacuacion bloqueada parcial o efectiva; personas potencialmente expuestas; area ocupada.
- Resultado esperado: `ALTO`; `CRITICO` si el bloqueo impide evacuacion real o acceso a equipo critico.
- Justificacion: obstruccion afecta control de emergencia.
- Norma probable: seguridad laboral / gestion preventiva / procedimiento de emergencia.
- Revision manual: si el bloqueo no queda claro.

## 3. Derrame menor contenido en bandeja

- Input: derrame pequeno de sustancia controlada dentro de bandeja de contencion.
- Respuestas simuladas: aspecto ambiental si; impacto real no; riesgo bajo/medio; contenido si; suelo/agua no afectados.
- Resultado esperado: `MEDIO` ambiental.
- Justificacion: existe desviacion ambiental controlada, sin salida a medio receptor.
- Norma probable: Ley 19.300 materia ambiental general; sustancias si aplica; articulos pendientes.
- Revision manual: no, salvo sustancia no identificada.

## 4. Derrame de sustancia peligrosa hacia suelo o alcantarillado

- Input: sustancia peligrosa liberada sin contencion con llegada probable a suelo/alcantarillado.
- Respuestas simuladas: impacto/riesgo alto; medio afectado suelo/alcantarillado; no contenido; requiere contencion inmediata.
- Resultado esperado: `CRITICO` ambiental.
- Justificacion: senal roja ambiental por liberacion no contenida hacia medio receptor.
- Norma probable: Ley 19.300, sustancias peligrosas, agua/suelo, RCA/permiso si aplica.
- Revision manual: si, por validacion ambiental/legal.

## 5. Residuo peligroso mal segregado sin exposicion

- Input: residuo peligroso en contenedor incorrecto, sin derrame ni contacto.
- Respuestas simuladas: residuo peligroso si; exposicion no; liberacion no; control parcial.
- Resultado esperado: `ALTO` ambiental/legal, no `CRITICO`.
- Justificacion: riesgo legal/ambiental relevante, pero sin liberacion ni exposicion directa.
- Norma probable: residuos peligrosos, Ley 19.300, procedimiento interno.
- Revision manual: si la clasificacion del residuo no esta confirmada.

## 6. Cable energizado expuesto

- Input: conductor energizado expuesto al alcance de trabajadores.
- Respuestas simuladas: energia peligrosa si; personas expuestas directa; consecuencia grave/fatal; ocurrencia inmediata alta.
- Resultado esperado: `CRITICO` seguridad.
- Justificacion: senal roja real por energia peligrosa no controlada.
- Norma probable: Ley 16.744, DS 44, procedimiento electrico interno.
- Revision manual: no si energia/exposicion estan confirmadas.

## 7. Piso mojado en transito activo

- Input: piso mojado en pasillo con transito activo, sin senalizacion.
- Respuestas simuladas: exposicion potencial/directa; consecuencia moderada/grave segun contexto; controles inexistentes.
- Resultado esperado: `MEDIO` o `ALTO`.
- Justificacion: riesgo de caida, pero normalmente no `CRITICO` salvo contexto extremo.
- Norma probable: seguridad laboral, condiciones de trabajo, procedimiento interno.
- Revision manual: no, salvo si se marca fatal sin mecanismo claro.

## 8. Trabajo en altura sin arnes

- Input: trabajador ejecuta labor en altura sin arnes ni proteccion equivalente.
- Respuestas simuladas: trabajo altura si; exposicion directa; consecuencia grave/fatal; controles inexistentes; requiere suspension.
- Resultado esperado: `CRITICO`.
- Justificacion: senal roja real con potencial fatal.
- Norma probable: Ley 16.744, DS 44, procedimiento trabajo en altura.
- Revision manual: no si exposicion esta confirmada.

## 9. Documento faltante sin actividad riesgosa inmediata

- Input: registro administrativo o documento faltante; no hay tarea riesgosa activa.
- Respuestas simuladas: documento faltante si; actividad riesgosa no; exposicion no.
- Resultado esperado: `BAJO` o `MEDIO` legal/documental.
- Justificacion: falta documental sin riesgo inmediato tiene tope MEDIO.
- Norma probable: gestion preventiva/procedimiento interno; articulo pendiente.
- Revision manual: no.

## 10. Documento faltante para trabajo critico en ejecucion

- Input: tarea critica activa sin PTS/AST/permiso requerido.
- Respuestas simuladas: documento faltante si; falta habilita actividad riesgosa si; exposicion directa o potencial; controles parciales/inexistentes.
- Resultado esperado: `ALTO` o `CRITICO` segun exposicion y tipo de tarea.
- Justificacion: la falta documental afecta control de actividad critica activa.
- Norma probable: DS 44, Ley 16.744, procedimiento interno.
- Revision manual: si falta validar alcance documental.

## 11. Emision de polvo visible sin control con trabajadores expuestos

- Input: polvo visible en area de trabajo sin control efectivo y trabajadores expuestos.
- Respuestas simuladas: agente polvo; exposicion frecuente; controles inexistentes; medicion no disponible.
- Resultado esperado: `MEDIO` o `ALTO`.
- Justificacion: riesgo de salud ocupacional/ambiental, pero `CRITICO` solo si hay exposicion severa inmediata o afectacion significativa.
- Norma probable: DS 594, Ley 19.300 si hay impacto ambiental, normativa de emisiones si aplica.
- Revision manual: si no hay medicion o agente definido.

## 12. Ruido elevado sin proteccion ni evaluacion

- Input: ruido percibido elevado, sin proteccion auditiva ni medicion vigente.
- Respuestas simuladas: agente ruido; exposicion frecuente; controles inexistentes; medicion no.
- Resultado esperado: `MEDIO` o `ALTO`.
- Justificacion: salud ocupacional requiere evaluacion higienica; no declarar limite superado sin medicion.
- Norma probable: DS 594, protocolo/normativa especifica de ruido pendiente.
- Revision manual: si se intenta declarar incumplimiento especifico sin medicion.

## 13. Extintor parcialmente obstruido

- Input: extintor visible pero acceso parcialmente obstruido.
- Respuestas simuladas: equipo emergencia parcialmente bloqueado; area operativa; control puede corregirse.
- Resultado esperado: `MEDIO` o `ALTO` segun criticidad del area.
- Justificacion: afecta respuesta a emergencia; `CRITICO` solo si queda inutilizable en area critica.
- Norma probable: seguridad laboral, procedimiento de emergencia.
- Revision manual: si no se sabe si el equipo queda accesible.

## 14. Sustancia quimica sin rotulacion, sin derrame

- Input: envase quimico sin rotulacion, sin fuga, sin contacto directo.
- Respuestas simuladas: sustancia peligrosa no determinada; derrame no; exposicion no/potencial; control documental faltante.
- Resultado esperado: `ALTO`; `CRITICO` solo si hay exposicion, fuga o condicion grave.
- Justificacion: riesgo de manejo/identificacion y cumplimiento, pero sin liberacion ni exposicion directa.
- Norma probable: DS 594, sustancias peligrosas, procedimiento interno.
- Revision manual: si no se identifica sustancia.

## Reglas de aprobacion de pruebas

- Ningun caso menor puede llegar a `CRITICO` sin senal roja real.
- Casos ambientales contenidos no deben superar `MEDIO` salvo informacion adicional.
- Documentos faltantes administrativos no deben superar `MEDIO`.
- Casos con energia peligrosa, altura sin proteccion o liberacion ambiental no contenida deben llegar a `CRITICO`.
- Todo caso con articulo legal no validado debe marcar texto legal seguro.

