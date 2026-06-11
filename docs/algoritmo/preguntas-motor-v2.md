# FASE MOTOR-2 - Preguntas definitivas del motor V2

Documento de diseno. No modifica codigo funcional.

Cada pregunta define:

- texto;
- tipo de respuesta;
- opciones;
- impacto sobre criticidad;
- si activa senal critica;
- ambito;
- si es obligatoria u opcional.

## A. Identificacion general

| ID | Texto | Tipo y opciones | Impacto criticidad | Senal critica | Ambito | Obligatoria |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Que tipo de hallazgo se esta reportando? | select: condicion subestandar, acto inseguro, incidente, casi accidente, aspecto ambiental, impacto ambiental, desviacion legal/documental, otro | Define tipo base | No | mixto | Si |
| A2 | Cual es el ambito principal? | select: seguridad laboral, salud ocupacional, medio ambiente, legal/documental, emergencia, calidad operacional, otro | Define modulo principal | No | mixto | Si |
| A3 | Hay ambitos secundarios asociados? | multiselect: seguridad, salud, ambiente, legal, emergencia, calidad, ninguno | Abre modulos secundarios | No | mixto | Opcional |
| A4 | Describa la condicion observada | texto libre | Apoya clasificacion; no eleva sola | No | mixto | Si |
| A5 | Area o sector donde ocurre | texto/select segun catalogo | Contexto operacional | No | mixto | Si |
| A6 | Actividad que se estaba ejecutando | texto/select | Permite evaluar si hay actividad riesgosa | No | mixto | Si |
| A7 | La condicion corresponde a acto, condicion o ambas? | select: acto, condicion, ambas, no determinado | Ajusta tipo evento | No | seguridad_laboral | Si |
| A8 | Existe exposicion general de personas, ambiente o terceros? | select: no, potencial, directa, no determinado | Elevador general si es directa | No por si sola | mixto | Si |

## B. Seguridad laboral

| ID | Texto | Tipo y opciones | Impacto criticidad | Senal critica | Ambito | Obligatoria |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Hay personas expuestas al peligro? | select: no, potencial, directa | Directa eleva; sin exposicion limita | No por si sola | seguridad_laboral | Si si aplica |
| B2 | Cual es la consecuencia razonablemente probable? | select: leve, moderada, grave, fatal, no determinada | Grave/fatal eleva si hay mecanismo real | No por si sola | seguridad_laboral | Si si aplica |
| B3 | La ocurrencia podria ser inmediata antes de controlar la condicion? | select: baja, media, alta | Media/alta eleva si hay exposicion | No por si sola | seguridad_laboral | Si si aplica |
| B4 | Existe energia peligrosa no controlada? | boolean | Eleva a ALTO/CRITICO segun exposicion | Si | seguridad_laboral | Si si aplica |
| B5 | Hay trabajo en altura sin proteccion efectiva? | boolean | Eleva a CRITICO si hay exposicion real | Si | seguridad_laboral | Si si aplica |
| B6 | Hay maquinaria/equipo sin resguardo con acceso a partes peligrosas? | boolean | Eleva a ALTO/CRITICO segun exposicion | Si si hay exposicion directa | seguridad_laboral | Si si aplica |
| B7 | Hay izaje, carga suspendida o caida de objetos con personas expuestas? | boolean | Eleva a CRITICO con personas expuestas | Si | seguridad_laboral | Si si aplica |
| B8 | Hay via de evacuacion, salida o equipo de emergencia bloqueado? | select: no, parcial, bloqueado efectivo | Parcial eleva; bloqueo efectivo puede ser CRITICO | Si si bloquea evacuacion/equipo critico | emergencia | Si si aplica |
| B9 | La actividad debia suspenderse inmediatamente? | boolean | Suspension necesaria eleva | Si si no se suspendio y riesgo grave sigue activo | seguridad_laboral | Si si aplica |
| B10 | Existen controles fisicos o administrativos suficientes? | select: suficientes, parciales, inexistentes, no aplica | Falta de control eleva solo si hay riesgo relevante | No por si sola | seguridad_laboral | Si si aplica |

## C. Salud ocupacional

| ID | Texto | Tipo y opciones | Impacto criticidad | Senal critica | Ambito | Obligatoria |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | Existe exposicion a agente de salud ocupacional? | multiselect: ruido, polvo, quimicos, calor, frio, radiacion, biologico, otro, ninguno | Abre modulo salud | No | salud_ocupacional | Si si aplica |
| C2 | La exposicion es ocasional, frecuente o permanente? | select: sin exposicion, ocasional, frecuente, permanente | Frecuente/permanente eleva | No por si sola | salud_ocupacional | Si si aplica |
| C3 | Hay controles de higiene industrial suficientes? | select: suficientes, parciales, inexistentes, no determinados | Parciales/inexistentes elevan | No por si sola | salud_ocupacional | Si si aplica |
| C4 | Existe medicion higienica o evaluacion vigente cuando aplica? | select: si, no, no aplica, no determinado | Falta eleva a MEDIO/ALTO | No por si sola | salud_ocupacional | Si si aplica |
| C5 | Hay trabajadores con sintomas o exposicion severa evidente? | boolean | Eleva a ALTO/CRITICO segun gravedad | Si si exposicion severa inmediata | salud_ocupacional | Si si aplica |
| C6 | El agente puede afectar a terceros o comunidad? | boolean | Eleva por alcance externo | No por si sola | salud_ocupacional/medio_ambiente | Opcional |

## D. Medio ambiente

| ID | Texto | Tipo y opciones | Impacto criticidad | Senal critica | Ambito | Obligatoria |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Existe aspecto ambiental asociado? | boolean | Clasifica aspecto ambiental | No | medio_ambiente | Si si aplica |
| D2 | Existe impacto ambiental real observado? | boolean | Eleva a ALTO/CRITICO segun magnitud | Si si significativo | medio_ambiente | Si si aplica |
| D3 | Existe riesgo de impacto ambiental? | select: no, bajo, medio, alto | Medio/alto eleva | No por si sola | medio_ambiente | Si si aplica |
| D4 | Que medio podria estar afectado? | multiselect: suelo, agua, aire, flora/fauna, comunidad, alcantarillado, ninguno | Define normativa probable y elevadores | Si si agua/suelo/alcantarillado con liberacion no contenida | medio_ambiente | Si si aplica |
| D5 | Hay derrame o fuga? | boolean | Eleva segun sustancia y contencion | Si si no contenido y medio sensible | medio_ambiente | Si si aplica |
| D6 | La sustancia o residuo es peligroso? | select: no, si sustancia peligrosa, si residuo peligroso, no determinado | Eleva a ALTO; CRITICO si hay liberacion/exposicion | Si con liberacion/exposicion | medio_ambiente | Si si aplica |
| D7 | El evento esta contenido? | select: contenido, parcialmente contenido, no contenido, no aplica | No contenido eleva fuerte | Si si hay salida a medio receptor | medio_ambiente | Si si aplica |
| D8 | Requiere contencion ambiental inmediata? | boolean | Define medida inmediata | Si si hay liberacion activa | medio_ambiente | Si si aplica |
| D9 | Existe RCA, permiso, compromiso o notificacion ambiental aplicable? | select: si, no, no determinado, no aplica | Activa revision legal | No por si sola | medio_ambiente/legal_documental | Si si aplica |

## E. Legal/documental

| ID | Texto | Tipo y opciones | Impacto criticidad | Senal critica | Ambito | Obligatoria |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | Falta un documento, permiso, registro o procedimiento requerido? | multiselect: PTS, AST, PTP, permiso, matriz, induccion, capacitacion, RCA/permiso ambiental, registro, ninguno | Clasifica desviacion documental | No por si sola | legal_documental | Si si aplica |
| E2 | La falta documental habilita una actividad riesgosa en ejecucion? | boolean | Eleva a ALTO/CRITICO | Si si actividad critica sigue activa | legal_documental/seguridad_laboral | Si si aplica |
| E3 | El documento existe pero esta vencido o no corresponde a la tarea real? | select: vigente, vencido, no corresponde, no existe, no aplica | Eleva segun riesgo de la tarea | No por si sola | legal_documental | Si si aplica |
| E4 | La falta afecta controles de seguridad, salud o ambiente? | multiselect: seguridad, salud, ambiente, ninguno, no determinado | Abre modulo asociado | No por si sola | legal_documental | Si si aplica |
| E5 | Hay referencia probable a Ley 16.744, DS 44, DS 594, Ley 19.300, permiso/RCA u otra norma? | multiselect | Sugiere normativa probable | No | legal_documental | Opcional |
| E6 | La observacion requiere validacion legal antes de citar articulo? | boolean por defecto true si hay norma especifica | Marca revision legal | No | legal_documental | Si si aplica |

## F. Coherencia y revision manual

| ID | Texto | Tipo y opciones | Impacto criticidad | Senal critica | Ambito | Obligatoria |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | La descripcion coincide con el tipo de hallazgo seleccionado? | select: si, parcialmente, no, no determinado | No coincide activa revision manual | No | mixto | Si |
| F2 | Las respuestas criticas son coherentes con evidencia/descripcion? | select: si, parcialmente, no, no determinado | Incoherencia limita criticidad | No | mixto | Si |
| F3 | Existe contradiccion entre "sin exposicion" y respuestas de peligro grave? | boolean | Activa revision manual y tope | No | mixto | Si |
| F4 | Falta informacion esencial para decidir? | boolean | Activa revision manual | No | mixto | Si |
| F5 | El resultado sugerido debe ser revisado por un responsable? | boolean calculado | Marca `requiereRevisionManual` | No | mixto | Calculado |

## Reglas de obligatoriedad dinamica

- Si A2 = seguridad laboral, modulo B es obligatorio.
- Si A2 = salud ocupacional o C1 tiene agentes, modulo C es obligatorio.
- Si A2 = medio ambiente o D1/D2/D3 son positivos, modulo D es obligatorio.
- Si A2 = legal/documental o E1 tiene opciones, modulo E es obligatorio.
- Modulo F siempre debe ejecutarse, aunque algunas respuestas sean calculadas.

## Reglas de visualizacion

- Preguntas tecnicas deben mostrarse con lenguaje simple.
- La UI no debe inducir al usuario a marcar "grave/fatal" sin mecanismo concreto.
- Cuando se marca una senal critica, pedir confirmacion operacional breve.
- Si se detecta incoherencia, mostrar "requiere revision manual", no bloquear necesariamente el reporte.

