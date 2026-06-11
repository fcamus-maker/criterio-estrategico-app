# Matriz legal base V2 - propuesta editable

Documento de apoyo para el motor de evaluacion. No es asesoria legal ni fundamento definitivo.

Advertencia obligatoria:

> Los articulos especificos deben validarse contra fuente oficial antes de mostrarse como fundamento definitivo.

## Criterios de uso

- La matriz debe sugerir normativa probable, no determinar responsabilidad legal.
- El motor puede asociar norma y materia por tipo de hallazgo.
- Los articulos/decretos especificos deben quedar vacios o marcados como "requiere validacion" si no estan revisados por fuente oficial y criterio legal.
- Todo caso CRITICO legal/ambiental debe marcar `requiereRevisionLegal = true`.

## Campos recomendados

| Campo | Descripcion |
| --- | --- |
| norma | Nombre de ley, decreto, reglamento, RCA, permiso o procedimiento |
| articulo_decreto | Articulo, decreto, permiso, RCA o clausula, solo si esta validado |
| materia | Seguridad laboral, salud ocupacional, ambiente, residuos, sustancias, ruido, agua, suelo, permisos |
| aplica_cuando | Condicion objetiva para asociar la norma |
| texto_breve | Resumen operativo no juridico |
| nivel_confianza | alto, medio, bajo |
| requiere_revision_legal | si/no |
| fuente_validacion | URL o referencia oficial usada para validar |

## Matriz base

| Norma / instrumento | Materia | Aplica cuando | Texto breve operativo | Nivel de confianza | Requiere revision legal |
| --- | --- | --- | --- | --- | --- |
| Ley 16.744 | Seguridad y salud laboral | Accidentes del trabajo, enfermedades profesionales, obligacion preventiva general | Marco base del seguro social y gestion preventiva asociada a riesgos laborales | Alto para materia general | Si, para articulos especificos |
| DS 44 | Gestion preventiva de riesgos laborales | Gestion preventiva, obligaciones de organizacion, identificacion y control de riesgos | Base reglamentaria moderna para ordenar gestion preventiva de riesgos laborales | Medio/alto, validar texto vigente | Si |
| DS 594 | Condiciones sanitarias y ambientales en lugares de trabajo | Higiene, condiciones sanitarias, agentes fisicos/quimicos, ventilacion, ruido, polvo, sustancias | Usar en hallazgos de salud ocupacional, higiene industrial y condiciones ambientales de trabajo | Alto para materia general | Si, para limites/articulos |
| Ley 19.300 | Bases generales del medio ambiente | Aspectos e impactos ambientales, dano ambiental, instrumentos de gestion ambiental | Marco base ambiental para clasificar aspecto/impacto y posibles obligaciones ambientales | Alto para materia general | Si |
| Normativa de residuos peligrosos aplicable | Residuos peligrosos | Residuo peligroso mal segregado, almacenado, transportado o gestionado | Asociar cuando hay residuos peligrosos o contaminacion potencial | Medio | Si |
| Normativa de sustancias peligrosas aplicable | Sustancias peligrosas | Almacenamiento, manipulacion, fuga o derrame de sustancias peligrosas | Asociar cuando hay liberacion, exposicion o falta de control de sustancias | Medio | Si |
| Normativa de emisiones atmosfericas aplicable | Aire/emisiones | Polvo, gases, humos, emisiones no controladas | Asociar cuando existe emision relevante o afectacion a aire/comunidad | Bajo/medio | Si |
| Normativa de ruido aplicable | Ruido ocupacional/ambiental | Exposicion a ruido laboral o afectacion comunitaria | Separar salud ocupacional de ruido ambiental | Bajo/medio | Si |
| Normativa de aguas aplicable | Agua/alcantarillado | Derrame o descarga con llegada real o probable a agua, drenaje o alcantarillado | Asociar a contaminacion o riesgo de contaminacion de agua | Bajo/medio | Si |
| Normativa de suelo aplicable | Suelo | Derrame, filtracion, disposicion irregular o contaminacion de suelo | Asociar cuando hay afectacion real o probable a suelo | Bajo/medio | Si |
| RCA / permiso ambiental del proyecto | Permisos ambientales | Hallazgo relacionado con compromiso, permiso, RCA o condicion ambiental especifica | Debe ser parametrizable por cliente/proyecto | Bajo hasta cargar permiso real | Si |
| Codigo del Trabajo u otras normas laborales | Laboral/documental | Jornada, condiciones laborales, deberes del empleador, documentacion laboral | Solo asociar si el hallazgo tiene materia laboral clara | Bajo/medio | Si |
| Procedimiento interno / PTS / AST | Control documental operacional | Actividad riesgosa ejecutada sin procedimiento, permiso o analisis requerido | No es norma legal por si sola, pero es control operacional exigible internamente | Alto para control interno | No/Si segun contrato |

## Fuentes oficiales sugeridas para validacion

- LeyChile, Ley 16.744: https://www.bcn.cl/leychile/navegar?idNorma=28650
- LeyChile, Ley 19.300: https://www.bcn.cl/leychile/navegar?idNorma=30667
- LeyChile, DS 594: https://www.bcn.cl/leychile/navegar?idNorma=167766
- LeyChile busqueda oficial para DS 44 y reglamentos vigentes: https://www.bcn.cl/leychile/
- SUSESO, normativa y orientaciones de seguridad social laboral: https://www.suseso.cl/
- Direccion del Trabajo, normativa laboral: https://www.dt.gob.cl/

## Reglas de asociacion sugeridas

### Seguridad laboral

- Si existe riesgo inmediato de lesion grave/fatal: Ley 16.744 + DS 44 + procedimiento interno.
- Si existe trabajo en altura, energia peligrosa, maquinaria, izaje o espacio confinado: asociar DS 44 y procedimiento critico interno; agregar normativa especifica solo si esta parametrizada.
- Si falta capacitacion o PTS en actividad critica: asociar DS 44/procedimiento interno, criticidad ALTO/CRITICO segun exposicion real.

### Salud ocupacional / higiene

- Ruido, polvo, quimicos, calor, radiacion o agentes biologicos: asociar DS 594 y requerir evaluacion higienica si corresponde.
- Exposicion sin medicion o sin control: criticidad MEDIO/ALTO; CRITICO solo si existe condicion grave inmediata o exposicion severa evidente.

### Medio ambiente

- Aspecto ambiental sin impacto: asociar Ley 19.300 como marco general y normativa especifica si aplica; criticidad BAJO/MEDIO segun control.
- Impacto ambiental real o probable: Ley 19.300 + normativa especifica + RCA/permiso si existe.
- Derrame contenido: MEDIO, contencion y seguimiento.
- Derrame no contenido hacia suelo/agua/alcantarillado: ALTO/CRITICO, contencion, escalamiento y revision legal.

### Legal/documental

- Documento faltante administrativo sin actividad riesgosa: BAJO/MEDIO.
- Documento faltante que habilita actividad critica en ejecucion: ALTO/CRITICO.
- Permiso/RCA faltante o incumplido: requiere revision legal; criticidad depende de impacto, obligacion y exposicion.

## Salida esperada por norma en el motor

Ejemplo de objeto conceptual:

```json
{
  "norma": "DS 594",
  "articulo_decreto": "requiere validacion",
  "materia": "Salud ocupacional / condiciones ambientales de trabajo",
  "aplica_cuando": "Exposicion a polvo, ruido, sustancias o condiciones sanitarias deficientes",
  "texto_breve": "Revisar condiciones sanitarias y ambientales basicas aplicables al lugar de trabajo.",
  "nivel_confianza": "medio",
  "requiere_revision_legal": true
}
```

## Nota de producto

La UI no deberia mostrar "incumple articulo X" si ese articulo no fue validado. La recomendacion segura es mostrar:

- "Normativa probable relacionada".
- "Materia legal asociada".
- "Requiere revision legal".
- "Fuente pendiente de validacion".
