# FASE MOTOR-2 - Matriz legal operativa V2

Documento de diseno. No es asesoria legal. No modifica codigo funcional.

## 1. Principio de uso

El motor debe sugerir normativa probable, no declarar incumplimiento legal definitivo.

Regla de seguridad juridica:

- No inventar articulos.
- No mostrar articulos al usuario final si no estan validados.
- Si no hay articulo validado, usar texto seguro:

```txt
Normativa probable asociada: [norma/materia]. Requiere validacion legal especifica antes de citar articulo.
```

## 2. Estados de articulo

| Estado | Uso |
| --- | --- |
| validado | Puede mostrarse si fue revisado contra fuente oficial y criterio legal. |
| pendiente de validacion | Puede quedar en salida tecnica interna, no como afirmacion final. |
| no mostrar al usuario final todavia | Usar cuando solo se conoce norma/materia general. |

## 3. Campos del objeto legal

| Campo | Descripcion |
| --- | --- |
| norma | Ley, decreto, reglamento, permiso, RCA o procedimiento. |
| materia | Seguridad laboral, salud ocupacional, ambiente, residuos, sustancias, ruido, agua, suelo, permisos, laboral/documental. |
| articulo_estado | validado, pendiente de validacion, no mostrar al usuario final todavia. |
| articulo_referencia | Solo si esta validado. |
| aplica_cuando | Condicion objetiva que activa la asociacion. |
| texto_seguro | Redaccion no juridica para usuario. |
| nivel_confianza | alto, medio, bajo. |
| requiere_revision_legal | true/false. |
| fuente_validacion | URL o referencia oficial si existe. |

## 4. Seguridad laboral

| Norma/materia | Aplica cuando | Articulo | Texto seguro | Confianza | Revision legal |
| --- | --- | --- | --- | --- | --- |
| Ley 16.744 | Accidentes del trabajo, enfermedades profesionales y gestion preventiva general | pendiente de validacion | Normativa probable asociada a seguridad y salud laboral. Requiere validacion legal especifica antes de citar articulo. | Alto para materia general | Si |
| DS 44 | Gestion preventiva, identificacion y control de riesgos laborales | pendiente de validacion | Normativa probable asociada a gestion preventiva de riesgos laborales. Requiere validacion legal especifica antes de citar articulo. | Medio/alto | Si |
| Procedimiento interno / PTS / AST / PTP | Actividad riesgosa que requiere control documental interno | no aplica como ley por si solo | Control operacional interno probable asociado al hallazgo. | Alto para control interno | Segun contrato |

Reglas:

- Riesgo grave/fatal con exposicion directa: asociar Ley 16.744 + DS 44 + procedimiento interno.
- Trabajo en altura, energia peligrosa, maquinaria, izaje, espacio confinado: asociar DS 44 y procedimiento critico interno; agregar norma especifica solo si existe matriz validada.
- Documento faltante en actividad critica: asociar legal/documental, pero criticidad depende de exposicion real.

## 5. Salud ocupacional

| Norma/materia | Aplica cuando | Articulo | Texto seguro | Confianza | Revision legal |
| --- | --- | --- | --- | --- | --- |
| DS 594 | Condiciones sanitarias y ambientales en lugares de trabajo | pendiente de validacion | Normativa probable asociada a condiciones sanitarias y ambientales del lugar de trabajo. Requiere validacion legal especifica antes de citar articulo. | Alto para materia general | Si |
| Protocolos/normativa especifica de agente | Ruido, polvo, quimicos, calor, radiacion, biologicos u otros agentes especificos | pendiente de validacion | Normativa/protocolo probable asociado al agente de exposicion. Requiere validacion tecnica y legal especifica. | Medio/bajo hasta parametrizar | Si |

Reglas:

- Ruido, polvo, sustancias, ventilacion, calor/frio u otros agentes: asociar DS 594.
- Exposicion frecuente/permanente sin medicion: sugerir evaluacion higienica.
- No declarar superacion de limite si no existe medicion validada.

## 6. Medio ambiente

| Norma/materia | Aplica cuando | Articulo | Texto seguro | Confianza | Revision legal |
| --- | --- | --- | --- | --- | --- |
| Ley 19.300 | Aspectos/impactos ambientales, dano ambiental, instrumentos de gestion ambiental | pendiente de validacion | Normativa probable asociada a materia ambiental. Requiere validacion legal especifica antes de citar articulo. | Alto para materia general | Si |
| Residuos peligrosos | Residuo peligroso mal segregado, almacenado, transportado o gestionado | pendiente de validacion | Normativa probable asociada a manejo de residuos peligrosos. Requiere validacion legal especifica. | Medio | Si |
| Sustancias peligrosas | Almacenamiento, manipulacion, fuga o derrame de sustancias peligrosas | pendiente de validacion | Normativa probable asociada a sustancias peligrosas. Requiere validacion legal especifica. | Medio | Si |
| Emisiones atmosfericas | Polvo, gases, humos o emisiones no controladas | pendiente de validacion | Normativa probable asociada a emisiones atmosfericas. Requiere validacion legal especifica. | Bajo/medio | Si |
| Ruido ambiental | Afectacion comunitaria por ruido | pendiente de validacion | Normativa probable asociada a ruido ambiental. Requiere validacion legal especifica. | Bajo/medio | Si |
| Agua/alcantarillado | Derrame o descarga con llegada real o probable a agua, drenaje o alcantarillado | pendiente de validacion | Normativa probable asociada a afectacion de agua o alcantarillado. Requiere validacion legal especifica. | Bajo/medio | Si |
| Suelo | Derrame, filtracion o contaminacion de suelo | pendiente de validacion | Normativa probable asociada a afectacion de suelo. Requiere validacion legal especifica. | Bajo/medio | Si |
| RCA / permiso ambiental del proyecto | Compromiso, permiso o condicion ambiental especifica | pendiente de validacion segun proyecto | Instrumento ambiental probable asociado al proyecto. Requiere revision del permiso/RCA real. | Bajo hasta cargar proyecto | Si |

Reglas:

- Aspecto ambiental controlado: sugerir Ley 19.300 como marco, sin elevar por si solo.
- Derrame contenido: MEDIO, contencion y seguimiento.
- Derrame no contenido hacia suelo/agua/alcantarillado: ALTO/CRITICO y revision legal.
- RCA/permiso debe ser parametrizable por cliente/obra.

## 7. Legal/documental operativo

| Norma/materia | Aplica cuando | Articulo | Texto seguro | Confianza | Revision legal |
| --- | --- | --- | --- | --- | --- |
| Codigo del Trabajo u otras normas laborales | Condiciones laborales, jornada, deberes laborales o documentacion laboral clara | pendiente de validacion | Normativa laboral probable asociada. Requiere validacion legal especifica. | Bajo/medio | Si |
| DS 44 / gestion preventiva | Falta de matriz, procedimiento, AST, PTS, PTP o control preventivo | pendiente de validacion | Normativa probable asociada a gestion preventiva y controles documentales. Requiere validacion legal especifica. | Medio | Si |
| Procedimiento interno / contrato | Requisito documental interno o contractual | no aplica como ley por si solo | Requisito interno/contractual probable asociado al control operacional. | Medio/alto | Segun contrato |

Reglas:

- Falta documental sin actividad riesgosa inmediata: maximo MEDIO.
- Falta documental que habilita actividad critica activa: ALTO/CRITICO segun exposicion.
- Falta de articulo validado: no mostrar afirmacion legal definitiva.

## 8. Salida segura para usuario

Ejemplo:

```json
{
  "norma": "DS 594",
  "materia": "Salud ocupacional / condiciones ambientales de trabajo",
  "articulo_estado": "pendiente de validacion",
  "texto_seguro": "Normativa probable asociada: DS 594 / condiciones sanitarias y ambientales en lugares de trabajo. Requiere validacion legal especifica antes de citar articulo.",
  "nivel_confianza": "medio",
  "requiere_revision_legal": true
}
```

## 9. Reglas de UI

- Mostrar "Normativa probable relacionada", no "incumple articulo X".
- Mostrar "Materia legal asociada".
- Mostrar "Requiere revision legal" si aplica.
- Ocultar articulo si `articulo_estado` no es `validado`.
- Permitir que en el futuro una matriz validada por cliente/proyecto agregue articulos.

## 10. Pendientes antes de produccion

- Validar DS 44 vigente y referencias especificas.
- Validar articulos DS 594 por agente.
- Parametrizar RCA/permisos por obra.
- Parametrizar sustancias/residuos por cliente.
- Definir responsable legal interno para aprobar articulos visibles.

