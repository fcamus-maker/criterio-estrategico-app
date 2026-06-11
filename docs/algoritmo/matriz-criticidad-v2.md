# FASE MOTOR-2 - Matriz de criticidad V2

Documento de diseno. No modifica codigo funcional.

## 1. Niveles

| Nivel | Uso operacional |
| --- | --- |
| BAJO | Desviacion menor, sin exposicion directa ni impacto relevante. |
| MEDIO | Condicion corregible con riesgo controlable, seguimiento requerido. |
| ALTO | Riesgo relevante, exposicion o incumplimiento que requiere accion pronta. |
| CRITICO | Senal roja real con potencial grave/fatal, impacto ambiental significativo o actividad critica sin control. |

Regla principal:

`CRITICO` requiere senal roja real. No puede nacer solo por suma de respuestas.

## 2. Criticidad base por tipo

| Tipo de hallazgo | Base | Tope inicial | Comentario |
| --- | --- | --- | --- |
| Orden y aseo menor | BAJO | MEDIO | No sube a CRITICO sin obstruccion critica o exposicion directa. |
| Objeto inofensivo sin transito | BAJO | MEDIO | Caso maleta abierta sin bloqueo. |
| Obstruccion menor | BAJO/MEDIO | MEDIO | Subir solo si afecta flujo relevante. |
| Piso mojado sin transito activo | BAJO/MEDIO | MEDIO | Requiere control y senalizacion. |
| Piso mojado en transito activo | MEDIO | ALTO | ALTO si hay flujo alto o caida probable. |
| Extintor parcialmente obstruido | MEDIO | ALTO | Depende de criticidad del area y facilidad de acceso. |
| Via de evacuacion bloqueada | ALTO | CRITICO | CRITICO si impide evacuacion real. |
| Cable energizado expuesto | CRITICO | CRITICO | Senal roja de seguridad. |
| Trabajo en altura sin arnes/proteccion | CRITICO | CRITICO | Senal roja de seguridad. |
| Energia peligrosa no controlada | CRITICO | CRITICO | Senal roja de seguridad. |
| Maquinaria sin resguardo | ALTO | CRITICO | CRITICO si hay acceso/exposicion directa. |
| Carga suspendida con personas expuestas | CRITICO | CRITICO | Senal roja de seguridad. |
| Derrame menor contenido | MEDIO | MEDIO | Ambiental controlado. |
| Derrame no contenido hacia suelo/agua/alcantarillado | ALTO | CRITICO | CRITICO si sustancia/impacto significativo. |
| Residuo comun mal segregado | MEDIO | MEDIO | Sin exposicion peligrosa. |
| Residuo peligroso mal segregado sin exposicion | ALTO | ALTO | Requiere control y revision legal/ambiental. |
| Residuo peligroso con exposicion o liberacion | ALTO | CRITICO | CRITICO si exposicion/liberacion significativa. |
| Emision de polvo/ruido sin control | MEDIO | ALTO | CRITICO solo con condicion grave inmediata. |
| Sustancia quimica sin rotulacion, sin fuga | ALTO | ALTO | CRITICO solo con exposicion, fuga o condicion grave. |
| Documento faltante sin actividad riesgosa inmediata | BAJO/MEDIO | MEDIO | Legal/documental no escala solo. |
| Documento faltante para trabajo critico en ejecucion | ALTO | CRITICO | Depende de exposicion y actividad activa. |

## 3. Elevadores

| Elevador | Efecto maximo | Condicion |
| --- | --- | --- |
| Exposicion directa de personas | +1 o +2 niveles | Debe existir mecanismo de dano. |
| Consecuencia grave/fatal razonable | +1 o +2 niveles | No aplica sin mecanismo real. |
| Probabilidad inmediata alta | +1 nivel | Solo si la fuente de peligro sigue activa. |
| Falta de control proporcional | +1 nivel | Solo si el control era necesario. |
| Reincidencia o repeticion inmediata | +1 nivel | No convierte menor en CRITICO por si sola. |
| Terceros/comunidad expuestos | +1 o +2 niveles | Segun alcance y medio afectado. |
| Sustancia/residuo peligroso | +1 nivel | CRITICO solo con liberacion/exposicion. |
| Documento faltante que habilita actividad critica | +1 o +2 niveles | Requiere actividad riesgosa activa. |

## 4. Limitantes

| Limitante | Efecto |
| --- | --- |
| Sin exposicion directa | Limita hallazgos menores a MEDIO. |
| Control efectivo instalado | Reduce o mantiene criticidad. |
| Evento contenido | Limita ambiental a MEDIO salvo obligacion grave. |
| Documento faltante administrativo | Limita a MEDIO. |
| Descripcion/evidencia menor | Activa coherencia y puede limitar. |
| Informacion insuficiente | Marca revision manual y evita CRITICO automatico. |

## 5. Topes obligatorios

| Regla | Tope |
| --- | --- |
| Hallazgo menor sin exposicion directa | MEDIO |
| Orden y aseo menor | MEDIO |
| Objeto inofensivo sin obstruccion critica | BAJO/MEDIO |
| Documento faltante sin actividad riesgosa inmediata | MEDIO |
| Derrame contenido sin salida al ambiente | MEDIO |
| Residuo comun mal segregado sin exposicion | MEDIO |
| Emision/polvo/ruido sin condicion severa inmediata | ALTO |
| Sustancia quimica sin rotulacion, sin fuga ni exposicion | ALTO |
| Respuestas criticas pero tipo/descripcion menor | Revision manual y no CRITICO sin senal roja |
| CRITICO por suma sin senal roja | Bloquear; bajar a ALTO o MEDIO segun base |

## 6. Senales rojas reales

### Seguridad laboral

- Riesgo inmediato de lesion grave/fatal con exposicion directa.
- Trabajo en altura sin proteccion.
- Energia peligrosa no controlada.
- Cable energizado expuesto.
- Maquinaria sin resguardo con acceso directo.
- Carga suspendida con personas expuestas.
- Incendio, explosion o atmosfera peligrosa.
- Espacio confinado sin control.
- Bloqueo efectivo de via de evacuacion critica.
- Actividad que requiere suspension inmediata y sigue activa.

### Medio ambiente

- Derrame no contenido hacia suelo, agua o alcantarillado.
- Sustancia peligrosa liberada.
- Residuo peligroso mal gestionado con exposicion o liberacion.
- Dano ambiental real o probable significativo.
- Incumplimiento grave de permiso/RCA con impacto o deber de notificacion.
- Emision no controlada significativa.
- Afectacion a comunidad o terceros.

### Legal/documental

- Falta documental que permite ejecutar actividad critica sin control.
- Permiso/RCA/autorizacion clave incumplida con impacto significativo.
- Falta de procedimiento/control critico en actividad de alto potencial activa.

## 7. Reglas para CRITICO

Un resultado `CRITICO` requiere todas estas condiciones:

1. Existe al menos una senal roja real.
2. La senal tiene conexion directa con el hallazgo.
3. La exposicion o impacto es actual, directo o razonablemente inminente.
4. No existe un tope aplicable que limite la criticidad.
5. No hay incoherencia grave que invalide la senal.

Si las respuestas fuerzan `CRITICO` pero el tipo/descripcion es menor:

- marcar `requiereRevisionManual = true`;
- registrar inconsistencia;
- aplicar tope;
- no mostrar `CRITICO` automatico salvo que exista senal roja confirmada.

## 8. Reglas ambientales

| Situacion | Resultado esperado |
| --- | --- |
| Aspecto ambiental controlado sin impacto | BAJO/MEDIO |
| Riesgo de impacto bajo y contenido | MEDIO |
| Derrame menor contenido en bandeja | MEDIO |
| Derrame parcialmente contenido | MEDIO/ALTO |
| Derrame no contenido hacia suelo/agua/alcantarillado | ALTO/CRITICO |
| Residuo peligroso mal segregado sin exposicion | ALTO |
| Residuo peligroso con exposicion/liberacion | CRITICO |
| Emision visible sin control con trabajadores expuestos | MEDIO/ALTO |
| Afectacion a comunidad | ALTO/CRITICO |
| Incumplimiento RCA/permiso con impacto significativo | ALTO/CRITICO y revision legal |

## 9. Reglas legales/documentales

| Situacion | Resultado esperado |
| --- | --- |
| Documento faltante administrativo | BAJO/MEDIO |
| Registro faltante sin actividad riesgosa | BAJO/MEDIO |
| PTS/AST faltante para tarea no critica | MEDIO |
| PTS/AST faltante para tarea critica activa | ALTO/CRITICO segun exposicion |
| Capacitacion faltante en tarea critica activa | ALTO/CRITICO segun exposicion |
| Permiso ambiental/RCA no determinado | Revision legal; criticidad segun impacto |
| Articulo legal no validado | No mostrar como definitivo |

## 10. Reglas de salud ocupacional

| Situacion | Resultado esperado |
| --- | --- |
| Ruido/polvo/quimico con exposicion ocasional y control parcial | MEDIO |
| Exposicion frecuente sin medicion | MEDIO/ALTO |
| Exposicion permanente sin control | ALTO |
| Sintomas o exposicion severa evidente | ALTO/CRITICO segun gravedad inmediata |
| Riesgo higienico sin datos suficientes | MEDIO/ALTO y revision manual |

## 11. Revision manual

Activar revision manual si:

- Hay contradiccion entre descripcion y respuestas.
- Hay respuesta de consecuencia fatal sin mecanismo real.
- Se intenta clasificar como `CRITICO` un hallazgo menor.
- Falta informacion esencial.
- La norma aplicable requiere articulo especifico no validado.
- El caso mezcla seguridad, ambiente y legal con datos insuficientes.

## 12. Casos de prueba resumen

| Caso | Esperado |
| --- | --- |
| Maleta abierta inofensiva sin transito | BAJO/MEDIO, no CRITICO |
| Objeto bloqueando salida de emergencia | ALTO/CRITICO segun bloqueo real |
| Derrame menor contenido en bandeja | MEDIO ambiental |
| Derrame de sustancia peligrosa hacia suelo/alcantarillado | CRITICO ambiental |
| Residuo peligroso mal segregado sin exposicion | ALTO ambiental/legal |
| Cable energizado expuesto | CRITICO seguridad |
| Piso mojado en transito activo | MEDIO/ALTO |
| Trabajo en altura sin arnes | CRITICO |
| Documento faltante sin actividad riesgosa inmediata | BAJO/MEDIO |
| Documento faltante para trabajo critico en ejecucion | ALTO/CRITICO |
| Emision de polvo visible sin control con trabajadores expuestos | MEDIO/ALTO |
| Ruido elevado sin proteccion ni evaluacion | MEDIO/ALTO |
| Extintor parcialmente obstruido | MEDIO/ALTO |
| Sustancia quimica sin rotulacion, sin derrame | ALTO; CRITICO solo con exposicion/fuga |

