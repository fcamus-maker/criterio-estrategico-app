# FASE MOTOR-1 - Diagnostico motor de evaluacion V2

Documento de auditoria, diseno y propuesta. No es una implementacion.

## 1. Estado inicial revisado

- Rama revisada: `main`.
- Ultimo commit observado: `8faa13b incluye uuid en guardado central de reportes`.
- `.env.local`: no versionado.
- Working tree al iniciar esta fase: no estaba limpio. Existian cambios pendientes previos en `app/panel/page.tsx`, `app/globals.css`, `app/evaluar-v2/page.tsx`, `app/evaluar-v2/reportar/page.tsx` y `app/evaluar-v2/informe-final/page.tsx`. Esta auditoria no modifica esos archivos.

## 2. Archivos revisados

- `app/types/evaluacion.ts`
- `app/evaluar-v2/evaluacion/paso1/page.tsx`
- `app/evaluar-v2/evaluacion/paso2/page.tsx`
- `app/evaluar-v2/reportar/page.tsx`
- `app/evaluar-v2/resultado/page.tsx`
- `app/evaluar-v2/informe-final/page.tsx`
- `app/evaluar-v2/storageReporteV2.ts`
- `app/adapters/reporteV2ToHallazgoCentral.ts`
- `app/types/hallazgo.ts`
- `app/types/hallazgoCentral.ts`
- `app/analytics/alertaCriticos.ts`
- `app/analytics/radarPreventivo.ts`
- `app/analytics/kpiGerencialAvanzado.ts`
- `app/analytics/mapaGpsHallazgos.ts`

## 3. Inventario de captura actual

Antes de la evaluacion por preguntas, `/evaluar-v2/reportar` captura datos descriptivos y evidencia:

| Campo actual | Objetivo | Problema detectado | Propuesta |
| --- | --- | --- | --- |
| Area | Ubicar sector fisico/operacional | No clasifica dominio de riesgo | Mantener, agregar categoria de area o proceso |
| Descripcion | Texto libre del hallazgo | Puede inducir criticidad por palabras clave en fallback | Mantener, pero no usar como unico elevador de criticidad |
| Empresa involucrada / responsable | Asignar responsable de correccion | No distingue mandante, contratista, reportante o tercero | Mantener, separar tipo de responsable |
| Responsable de la empresa | Responsable de correccion | No valida si es responsable real de cierre | Mantener, asociar a asignacion futura |
| Cargo del responsable | Contexto del responsable | Sin efecto en criticidad | Mantener |
| Fotografias | Evidencia | No evalua contenido visual | Mantener como evidencia, no como scoring automatico sin analisis validado |
| GPS | Trazabilidad territorial | No incide en riesgo ambiental o comunitario | Mantener, en V2 usar cercania a agua/comunidad/zonas criticas si existe dato |

## 4. Inventario completo de preguntas actuales

Fuente: `app/types/evaluacion.ts`. La evaluacion actual tiene 20 preguntas.

| ID | Pregunta actual | Opciones y puntaje | Objetivo inferido | Riesgo de sesgo | Problema detectado | Decision | Nueva redaccion propuesta |
| --- | --- | --- | --- | --- | --- | --- | --- |
| p1 | Existe exposicion actual de personas al peligro? | Si 12, Parcial 6, No 0 | Exposicion humana | Alto | No distingue tipo de peligro ni intensidad | Modificar | Existe exposicion directa de personas a un peligro con potencial de dano? |
| p2 | La consecuencia potencial podria ser grave o fatal? | Si 18, Parcial 9, No 0 | Severidad potencial | Alto | Pregunta amplia; el usuario puede marcar grave por percepcion | Dividir | Cual es la consecuencia razonable mas probable: leve, seria, grave o fatal? |
| p3 | Existe posibilidad de ocurrencia inmediata? | Alta 15, Media 8, Baja 2 | Probabilidad inmediata | Medio | No exige evento creible ni mecanismo de dano | Modificar | Existe un mecanismo de dano activo que pueda materializarse antes de controlar la condicion? |
| p4 | El peligro estaba activo al momento del reporte? | Si 12, Parcial 6, No 0 | Estado activo | Medio | Un objeto menor puede ser "activo" sin riesgo critico | Modificar | La fuente de peligro esta activa y sin control efectivo? |
| p5 | El area estaba segregada o controlada? | Si 0, Parcial 5, No 10, No aplica 0 | Control de area | Medio | La falta de segregacion no siempre implica criticidad alta | Mantener con tope | Existe control fisico o administrativo proporcional al riesgo? |
| p6 | Habia medidas de control visibles y operativas? | Si 0, Parcial 5, No 10, No aplica 0 | Controles existentes | Medio | Falta de control generica suma mucho | Modificar | Que controles existen y son suficientes para el tipo de peligro? |
| p7 | La tarea estaba en ejecucion al detectar el hallazgo? | Si 8, No 0 | Actividad en curso | Medio | Tarea en ejecucion no implica criticidad por si sola | Mantener con tope | La actividad riesgosa asociada estaba en ejecucion? |
| p8 | Existe posibilidad de repeticion inmediata? | Alta 12, Media 6, Baja 2 | Recurrencia | Medio | Repeticion inmediata puede elevar hallazgos menores | Modificar | La condicion es recurrente o puede repetirse antes de implementar control? |
| p9 | El trabajo fue detenido al detectar la condicion? | Si 0, No 10, No aplica 0 | Reaccion inmediata | Alto | "No detenido" penaliza aunque no requiera detencion | Dividir | La condicion requeria detener la actividad? Si si, fue detenida? |
| p10 | La tarea involucra energia peligrosa o condicion de alto potencial? | Si 12, Parcial 6, No 0 | Senal critica | Alto positivo | Mezcla energia peligrosa con alto potencial generico | Dividir | Existe energia peligrosa no controlada? Existe condicion de alto potencial especifica? |
| p11 | El entorno afecta a terceros, transito o areas adyacentes? | Si 8, Parcial 4, No 0 | Terceros/comunidad | Medio | No distingue transito peatonal menor de comunidad expuesta | Modificar | Hay terceros/comunidad/areas criticas expuestas? |
| p12 | Existen barreras fisicas, senalizacion o demarcacion suficiente? | Si 0, Parcial 4, No 8 | Barreras | Medio | Ausencia de barrera no siempre exige ALTO | Mantener con tope | Las barreras son requeridas para este riesgo y son suficientes? |
| p13 | La condicion podria escalar antes de la proxima intervencion? | Si 10, Parcial 5, No 0 | Escalamiento | Alto | Muy subjetiva; puede empujar casos menores | Modificar | Existe una ruta de escalamiento creible y especifica? |
| p14 | Existe procedimiento de trabajo seguro para esta tarea? | Si 0, No 10, No aplica 0 | Control documental | Alto | Documento faltante por si solo puede subir demasiado | Mantener con bloqueo | Existe PTS requerido para una actividad riesgosa en ejecucion? |
| p15 | El procedimiento esta actualizado y vigente? | Si 0, No 8, No aplica 0 | Vigencia documental | Medio | Puede elevar sin exposicion real | Mantener con tope | El documento requerido esta vigente y corresponde a la tarea real? |
| p16 | El trabajador fue capacitado en este procedimiento? | Si 0, No aplica 0, No 10 | Competencia | Alto | Penaliza fuerte sin distinguir si hay trabajo critico | Mantener con bloqueo | Para actividad critica, el trabajador acredita capacitacion especifica? |
| p17 | Existe registro de capacitacion firmado? | Si 0, No 6, No aplica 0 | Evidencia documental | Medio | Registro faltante no equivale a riesgo inmediato | Mantener con tope | Existe evidencia verificable de capacitacion cuando aplica? |
| p18 | Se realizo charla de seguridad previa o analisis previo? | Si 0, No 6, No aplica 0 | Analisis previo | Medio | Puede sobrerreaccionar en tareas menores | Mantener con tope | La tarea requeria AST/charla/analisis previo y fue realizado? |
| p19 | Los riesgos estaban correctamente identificados en la documentacion? | Si 0, Parcial 5, No 10, No aplica 0 | Calidad de AST/PTS | Medio | Documental suma como operativo sin diferencia | Mantener con bloqueo | La documentacion identifica los riesgos criticos reales de la tarea? |
| p20 | Los permisos aplicables estaban vigentes al momento del hallazgo? | Si 0, No 8, No aplica 0 | Permisos | Alto | Permiso faltante debe ser critico solo si habilita actividad critica | Dividir | Existe permiso/RCA/autorizacion aplicable? La falta habilita actividad riesgosa o incumplimiento grave? |

## 5. Auditoria del algoritmo actual

### Donde se calcula

- El resultado se calcula en `app/evaluar-v2/evaluacion/paso2/page.tsx`, funcion `calcularResultado`.
- Suma todos los puntajes de `preguntasEvaluacion`.
- Cortes actuales:
  - `puntaje >= 80`: CRITICO, prioridad Urgente, detener trabajo.
  - `puntaje >= 45`: ALTO.
  - `puntaje >= 20`: MEDIO.
  - Menor a 20: BAJO.

### Variables que mas pesan

- Consecuencia grave/fatal: hasta 18.
- Ocurrencia inmediata: hasta 15.
- Exposicion, peligro activo, energia peligrosa: hasta 12 cada una.
- Falta de controles, PTS, capacitacion, riesgos documentados: hasta 10 cada una.

### Diagnostico tecnico

El motor es una suma lineal. No hay:

- clasificacion base por tipo de hallazgo;
- topes por hallazgo menor;
- requisito de senal roja real para CRITICO;
- diferenciacion entre seguridad, salud ocupacional, ambiente y legal;
- distincion entre aspecto ambiental e impacto ambiental;
- incoherencias entre descripcion menor y respuestas criticas;
- reglas para documentos faltantes sin actividad riesgosa;
- matriz normativa editable;
- resultado con factores que elevaron y factores que limitaron criticidad.

### Por que una condicion menor puede llegar a CRITICO

Un hallazgo menor puede acumular puntos si el usuario responde:

- exposicion actual parcial o si;
- consecuencia potencial grave o fatal;
- ocurrencia inmediata media/alta;
- peligro activo;
- area no segregada;
- controles no visibles;
- posibilidad de repeticion;
- no se detuvo trabajo;
- documentacion incompleta.

La suma puede superar 80 aun cuando no exista un mecanismo real de lesion grave/fatal ni impacto ambiental significativo. Ejemplo: una maleta abierta en un sector sin transito critico puede ser marcada como "peligro activo", "control no visible", "repeticion media", "area no segregada" y "documentacion no aplica/mal interpretada", elevando artificialmente la criticidad.

### Fallback adicional por texto

`app/evaluar-v2/resultado/page.tsx` genera criticidad preliminar por palabras clave si no hay evaluacion:

- "riesgo grave", "caida", "electricidad", "atropello", "atrapamiento", "incendio", "altura", "maquinaria", "energia" => CRITICO.
- "falta de control", "transito", "segregacion", "herramientas", "procedimiento", "exposicion" => ALTO.

Este fallback tambien puede sobrerreaccionar si la descripcion usa palabras comunes sin contexto.

## 6. Nueva arquitectura propuesta V2

El motor V2 debe dejar de ser una suma unica y pasar a un modelo por capas.

### Capa 1: Clasificacion del hallazgo

- Seguridad laboral.
- Salud ocupacional / higiene industrial.
- Medio ambiente.
- Emergencia.
- Legal/documental.
- Calidad operacional.
- Mixto.
- Otro.

### Capa 2: Tipo de evento

- Condicion subestandar.
- Acto inseguro.
- Incidente.
- Casi accidente.
- Aspecto ambiental.
- Impacto ambiental.
- Desviacion legal/documental.
- Riesgo operacional.

### Capa 3: Criticidad base

| Tipo base | Criticidad base | Tope inicial | Comentario |
| --- | --- | --- | --- |
| Orden y aseo menor | BAJO | MEDIO | No puede ser CRITICO sin obstruccion critica o exposicion directa |
| Objeto inofensivo sin transito | BAJO | MEDIO | Caso maleta abierta sin bloqueo |
| Obstruccion menor | BAJO/MEDIO | MEDIO | Subir solo si afecta transito relevante |
| Obstruccion via evacuacion | ALTO | CRITICO | CRITICO si impide evacuacion o hay emergencia |
| Trabajo en altura sin control | CRITICO | CRITICO | Senal roja real |
| Energia peligrosa no controlada | CRITICO | CRITICO | Senal roja real |
| Maquinaria sin resguardo | ALTO/CRITICO | CRITICO | Depende de exposicion directa |
| Carga suspendida con personas expuestas | CRITICO | CRITICO | Senal roja real |
| Derrame menor contenido | MEDIO | MEDIO | Ambiental controlado |
| Derrame hacia suelo/agua/alcantarillado | ALTO/CRITICO | CRITICO | Ambiental significativo |
| Residuo comun mal segregado | MEDIO | MEDIO | Sin exposicion peligrosa |
| Residuo peligroso mal gestionado | ALTO | CRITICO | CRITICO si hay exposicion/liberacion |
| Emision/polvo/ruido sin control | MEDIO/ALTO | ALTO | CRITICO solo con dano grave/inmediato |
| Documento faltante sin actividad riesgosa | BAJO/MEDIO | MEDIO | Legal/documental no debe escalar solo |
| Documento faltante en actividad critica activa | ALTO | CRITICO | Si habilita actividad peligrosa sin control |

### Capa 4: Exposicion

- Sin exposicion.
- Exposicion potencial.
- Exposicion directa.
- Personas expuestas.
- Medio ambiente expuesto.
- Comunidad/terceros expuestos.

### Capa 5: Consecuencia razonable

- Leve.
- Moderada.
- Grave.
- Fatal.
- Dano ambiental menor.
- Dano ambiental significativo.
- Incumplimiento legal.

### Capa 6: Probabilidad / recurrencia

- Baja.
- Media.
- Alta.
- Recurrente.

### Capa 7: Controles existentes

- Controlado.
- Parcialmente controlado.
- Sin control.
- Requiere aislamiento.
- Requiere suspension.

### Capa 8: Marco legal probable

Debe ser una matriz editable. No debe hardcodear articulos especificos no validados. Cada norma debe tener:

- norma;
- articulo/decreto;
- materia;
- aplica cuando;
- texto breve;
- nivel de confianza;
- requiere revision legal.

## 7. Modulo ambiental V2

### Definicion operativa

Aspecto ambiental: elemento de una actividad, producto o servicio que puede interactuar con el medio ambiente. Ejemplos:

- almacenamiento de sustancias;
- generacion de residuos;
- uso de agua;
- emision de polvo;
- ruido;
- transporte de materiales.

Impacto ambiental: cambio en el medio ambiente, adverso o beneficioso, total o parcial, derivado de un aspecto ambiental. Ejemplos:

- contaminacion de suelo;
- afectacion de agua;
- emision no controlada;
- dano a flora/fauna;
- afectacion a comunidad;
- incumplimiento de RCA/permisos.

### Preguntas ambientales minimas

- Existe aspecto ambiental?
- Existe impacto ambiental real?
- Existe riesgo de impacto ambiental?
- El impacto esta contenido?
- Hay residuo peligroso o sustancia peligrosa?
- Existe posible afectacion a suelo, agua, aire, flora, fauna o comunidad?
- Hay obligacion legal, permiso o RCA aplicable?
- Requiere contencion, notificacion o escalamiento?

### Reglas ambientales para CRITICO

CRITICO ambiental solo si existe una senal fuerte:

- derrame no contenido con posible llegada a suelo, agua o alcantarillado;
- sustancia peligrosa liberada;
- residuo peligroso mal gestionado con exposicion;
- dano ambiental real o probable significativo;
- incumplimiento grave de permiso/RCA;
- emision no controlada significativa;
- afectacion a comunidad o terceros.

## 8. Modulo legal V2

Legal/documental no debe ser CRITICO por acumulacion generica. Debe distinguir:

- documento faltante administrativo;
- documento faltante que habilita actividad critica;
- permiso/RCA/autorizacion ambiental;
- obligacion de registro o evidencia;
- incumplimiento con consecuencia inmediata.

Regla propuesta:

- Documento faltante sin actividad riesgosa inmediata: maximo MEDIO.
- Documento faltante para actividad critica en ejecucion: ALTO o CRITICO segun exposicion.
- Incumplimiento legal ambiental con impacto significativo o deber de notificacion: ALTO/CRITICO y revision legal obligatoria.

## 9. Reglas para CRITICO / rojo

CRITICO requiere senal roja real. No basta una suma de respuestas genericas.

### Seguridad laboral

- riesgo inmediato de lesion grave/fatal;
- exposicion directa;
- trabajo en altura sin proteccion;
- energia peligrosa;
- maquinaria sin resguardo;
- carga suspendida;
- incendio/explosion;
- espacio confinado;
- suspension inmediata necesaria.

### Medio ambiente

- derrame no contenido hacia suelo, agua o alcantarillado;
- sustancia peligrosa liberada;
- residuo peligroso mal gestionado con exposicion;
- dano ambiental real o probable significativo;
- incumplimiento grave de permiso/RCA;
- emision no controlada significativa;
- afectacion a comunidad o terceros.

### Legal/documental

- CRITICO solo si la falta documental genera riesgo grave inmediato o exposicion legal grave inmediata.
- Documentos faltantes por si solos normalmente no son CRITICO.

## 10. Topes y bloqueos de criticidad

| Regla | Resultado |
| --- | --- |
| Hallazgo menor sin exposicion directa | Maximo MEDIO |
| Orden y aseo menor | Maximo MEDIO |
| Objeto inofensivo sin obstruccion critica | Maximo BAJO/MEDIO |
| Documento faltante sin actividad riesgosa inmediata | Maximo MEDIO |
| Derrame contenido sin salida al ambiente | Maximo MEDIO |
| Residuo comun mal segregado sin exposicion | Maximo MEDIO |
| Respuestas criticas pero tipo menor | Inconsistencia, revision manual, no CRITICO sin senal roja |
| CRITICO por suma sin senal roja | Bloquear, bajar a ALTO o MEDIO segun base y controles |

## 11. Nueva lista de preguntas propuesta

### Modulo A: Identificacion basica

1. Que tipo de hallazgo es?
2. Cual es el area/dimension principal?
3. Existe exposicion de personas?
4. Existe exposicion ambiental?
5. El hallazgo es seguridad, salud, ambiente, legal, emergencia, calidad u otro?

### Modulo B: Seguridad laboral

1. Puede causar lesion?
2. La lesion razonablemente probable seria leve, seria, grave o fatal?
3. Hay energia peligrosa no controlada?
4. Hay trabajo en altura?
5. Hay maquinaria, carga suspendida o izaje?
6. Hay espacio confinado, fuego, explosion o atmosfera peligrosa?
7. Requiere detener actividad?
8. Hay controles fisicos/administrativos suficientes?

### Modulo C: Salud ocupacional / higiene

1. Existe exposicion a ruido, polvo, quimicos, calor, radiacion o agentes biologicos?
2. La exposicion es ocasional, frecuente o permanente?
3. Hay controles de higiene industrial?
4. Requiere medicion o evaluacion higienica?
5. Hay trabajadores sintomaticos o exposicion fuera de control?

### Modulo D: Medio ambiente

1. Existe aspecto ambiental?
2. Existe impacto ambiental real?
3. Existe riesgo de impacto ambiental?
4. Afecta o podria afectar suelo, agua, aire, flora, fauna o comunidad?
5. Hay derrame o fuga?
6. Hay residuo peligroso?
7. Esta contenido?
8. Requiere contencion o notificacion?
9. Existe permiso/RCA/compromiso ambiental aplicable?

### Modulo E: Legal/documental

1. Existe incumplimiento documental?
2. La falta documental permite ejecutar una actividad riesgosa?
3. Existe permiso, RCA, procedimiento o autorizacion aplicable?
4. La obligacion legal es laboral, sanitaria, ambiental u operacional?
5. Requiere revision legal?

### Modulo F: Coherencia

1. La criticidad sugerida coincide con descripcion y evidencia?
2. Hay contradiccion entre tipo menor y respuestas criticas?
3. Falta informacion para decidir?
4. Requiere revision manual?

## 12. Resultado automatico V2

Debe entregar:

1. Clasificacion: Seguridad / Salud / Medio ambiente / Legal / Mixto.
2. Tipo: condicion, acto, incidente, aspecto ambiental, impacto ambiental, legal-documental.
3. Criticidad final.
4. Justificacion tecnica.
5. Senales que elevaron criticidad.
6. Factores que limitaron criticidad.
7. Medida inmediata.
8. Plazo sugerido.
9. Requiere suspension: si/no.
10. Requiere contencion ambiental: si/no.
11. Marco legal probable.
12. Recomendacion final.
13. Revision manual requerida: si/no.

## 13. Casos de prueba minimos

| Caso | Resumen | Esperado |
| --- | --- | --- |
| 1 | Maleta abierta inofensiva sin transito | BAJO/MEDIO, no CRITICO |
| 2 | Maleta/objeto bloqueando salida de emergencia | ALTO/CRITICO segun bloqueo real |
| 3 | Derrame menor contenido en bandeja | MEDIO ambiental |
| 4 | Derrame de sustancia peligrosa hacia suelo/alcantarillado | CRITICO ambiental |
| 5 | Residuo peligroso mal segregado sin exposicion | ALTO ambiental/legal |
| 6 | Cable energizado expuesto | CRITICO seguridad |
| 7 | Piso mojado en transito | MEDIO/ALTO segun flujo y controles |
| 8 | Trabajo en altura sin arnes | CRITICO |
| 9 | Documento faltante sin actividad riesgosa inmediata | BAJO/MEDIO legal-documental |
| 10 | Documento faltante para trabajo critico en ejecucion | ALTO/CRITICO |

## 14. Recomendacion de implementacion por fases

### Fase Motor-2: Modelo y tipos

- Crear tipos `DominioHallazgo`, `TipoEvento`, `SenalCritica`, `FactorLimitante`, `NormaAplicable`.
- Separar scoring por dominio.
- Agregar `revisionManualRequerida`.

### Fase Motor-3: Preguntas V2

- Reemplazar preguntas genericas por modulos condicionales.
- Si el usuario elige "Medio ambiente", abrir modulo ambiental.
- Si elige "Legal/documental", aplicar topes salvo actividad critica.

### Fase Motor-4: Criticidad y topes

- Implementar criticidad base por tipo.
- Implementar senales rojas obligatorias para CRITICO.
- Implementar bloqueos de criticidad menor.
- Implementar deteccion de incoherencias.

### Fase Motor-5: Resultado automatico

- Generar explicacion auditable: "subio por", "se limito por", "requiere revision".
- Mantener recomendaciones editables.

### Fase Motor-6: Matriz legal editable

- Cargar matriz legal base desde archivo/configuracion.
- No mostrar articulos especificos como definitivos hasta validacion legal.
- Marcar fuente, nivel de confianza y fecha de revision.

## 15. Conclusiones

El motor actual es funcional para demo y captura preventiva, pero es demasiado lineal para produccion. La mejora clave no es subir o bajar puntajes, sino cambiar el enfoque:

- primero clasificar el hallazgo;
- despues aplicar criticidad base;
- luego elevar solo con senales reales;
- limitar hallazgos menores;
- separar seguridad, salud, ambiente y legal;
- explicar la decision;
- exigir revision manual ante incoherencias.
