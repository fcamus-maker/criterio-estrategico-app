# Arquitectura Premium V1

Estado: diseño compatible en rama aislada. No publicar ni modificar Supabase hasta completar la validación funcional.

## Objetivo

Convertir la plataforma en una herramienta ejecutiva, intuitiva y escalable, manteniendo su identidad visual Premium, los modos claro/oscuro, español/inglés y las conexiones actuales.

La regla de diseño es: una sección, un propósito, las herramientas exactas para cumplirlo.

## Diagnóstico operativo

La plataforma ya contiene la mayor parte de las funciones que una empresa grande necesita, pero las presenta como capacidades paralelas. El principal riesgo no es la falta de funciones, sino la duplicación de controles y la existencia de varias rutas para modificar o cerrar un hallazgo.

### Hallazgos críticos de arquitectura

| Área | Situación actual | Riesgo | Decisión V1 |
| --- | --- | --- | --- |
| Cierre | Asignación, estado, validación, rechazo y cierre comparten formulario | Cierres ambiguos y estados incompatibles | Separar asignación de revisión definitiva |
| Estados | `estado`, `estado_cierre` y JSON de seguimiento pueden divergir | KPI y filtros muestran resultados distintos | Sincronizar los tres campos desde una única función |
| Plazos | Vencido y plazo extendido se mezclan con el flujo | Se confunde condición temporal con etapa | Mantenerlos como indicadores derivados |
| KPI | Filtros maestros, detalle e informe conviven sin jerarquía clara | El usuario no sabe qué está filtrando | Un filtro maestro; informe independiente con transferencia explícita |
| Mapa | Controles visuales no siempre alteran puntos o zonas | Pérdida de confianza | Cada control debe producir un cambio verificable o eliminarse |
| Roles | La interfaz no refleja completamente las restricciones esperadas | Acciones visibles para perfiles incorrectos | Acciones por capacidad y alcance |
| Escala | Varias páginas concentran miles de líneas y responsabilidades | Cambios costosos y frágiles | Extraer dominio, consultas y componentes gradualmente |

## Flujo único de cierre

| Etapa visible | Responsable principal | Acción disponible | Resultado inequívoco |
| --- | --- | --- | --- |
| Pendiente de asignación | Prevención/administración | Asignar responsable, empresa y plazo | Asignado |
| Asignado | Responsable de cierre | Registrar avance | Pendiente de evidencia |
| Pendiente de evidencia | Responsable de cierre | Enviar evidencia | En revisión |
| En revisión | Validador autorizado | Aprobar o rechazar | Verificado o requiere corrección |
| Requiere corrección | Responsable de cierre | Corregir y reenviar | En revisión |
| Verificado | Consulta | Ver trazabilidad | Sin nuevas acciones de cierre |

`Vencido`, `vence hoy`, `dentro de plazo` y `plazo extendido` son semáforos, no etapas del flujo.

### Autoridad por rol

| Capacidad | Roles |
| --- | --- |
| Asignar y definir plan | `super_admin_ce`, `admin_cliente`, `admin_mandante`, `prevencionista_cliente` |
| Enviar evidencia | `responsable_cierre`, `supervisor_reportante` cuando esté autorizado/asignado |
| Aprobar o rechazar | `super_admin_ce`, `admin_cliente`, `admin_mandante`, `prevencionista_cliente` |
| Solo consultar | `visualizador_auditor` |

La interfaz oculta acciones no autorizadas, pero la protección definitiva debe reforzarse después en RLS y funciones transaccionales de Supabase.

## Arquitectura funcional objetivo

| Sección | Pregunta que responde | Herramientas propias |
| --- | --- | --- |
| Inicio | ¿Qué requiere mi atención ahora? | Semáforos, meta diaria, vencimientos, críticos y accesos rápidos |
| Hallazgos | ¿Qué se reportó y con qué evidencia? | Ficha, origen, reportante, empresa, fecha, hora, GPS y bitácora |
| Seguimiento | ¿Quién debe corregir y en qué etapa está? | Asignación, plazo, avance, evidencia y revisión |
| Mapa | ¿Dónde se concentran los riesgos? | Puntos, zonas, criticidad y agrupación geográfica |
| KPI | ¿Cómo está funcionando la gestión? | Tendencias, cumplimiento, recurrencia, rankings y comparaciones |
| Informes | ¿Qué debo comunicar o exportar? | Plantillas, alcance, formato y generación rápida |
| Configuración | ¿Cómo se administra la plataforma? | Empresas, obras, jerarquía, usuarios, permisos y parámetros |

## Sistema de filtros

Los filtros maestros deben ser únicos y compartidos: periodo, mandante/empresa, contrato/obra, contratista/subcontratista, área, criticidad, categoría, estado y responsable.

Cada sección solo agrega filtros que cambian su lectura específica. El constructor de informes conserva selección independiente para evitar que un informe cambie accidentalmente al navegar; ofrece una acción explícita “Usar análisis actual”.

### Aplicación en la rama de validación

| Contexto | Decisión aplicada | Resultado esperado |
| --- | --- | --- |
| KPI | Se eliminó el segundo estado de filtros de la tabla accionable | Indicadores, gráficos y tabla parten del mismo universo maestro |
| Detalle KPI | Conserva foco operativo, búsqueda y paginación | Navega el resultado sin crear una interpretación paralela |
| Informes | Mantiene configuración independiente y copia explícita del análisis | Un informe no cambia accidentalmente por navegación |
| Mapa | Barra maestra única para empresa, obra, criticidad, estado, periodo, área, tipo y GPS | Cada selección cambia puntos, contadores y exportación |
| Mapa | Se retiraron accesos redundantes y “Vencidos” | No se muestra una acción cuyo comportamiento real sea distinto de su etiqueta |

Los focos `abiertos`, `críticos abiertos`, `vencidos`, `sin fecha` y `cerrados` de la tabla KPI son vistas operativas del resultado ya filtrado; no vuelven a filtrar por empresa, obra, responsable o criticidad.

## KPI ejecutivo

La primera pantalla debe responder en menos de diez segundos:

- cuántos críticos siguen abiertos;
- cuántos están vencidos y quién es responsable;
- tasa y tiempo medio de cierre;
- recurrencia por categoría, área y empresa;
- tendencia semanal y mensual;
- ranking de cumplimiento por empresa y supervisor;
- calidad de evidencia y porcentaje de rechazo;
- cumplimiento de la meta diaria.

El ranking no debe castigar a quien reporta más. Debe ponderar oportunidad de cierre, severidad, recurrencia, calidad de evidencia y cultura de reporte.

## Diseño Premium

- Mantener modos oscuro y claro con paridad funcional.
- Mantener español e inglés sin textos incrustados fuera del sistema de traducción.
- Usar iconografía minimalista consistente y siempre acompañada de etiqueta o ayuda contextual.
- Reservar colores fuertes para criticidad, alertas y acción principal; no para decoración indiscriminada.
- Una acción primaria por contexto y jerarquía visual estable.
- Tablas densas para análisis; tarjetas para decisiones; modales solo para tareas breves.

## Estrategia sin riesgo

1. Extraer y probar el dominio de cierre sin modificar datos.
2. Simplificar la interfaz conservando adaptadores de compatibilidad.
3. Probar escenarios con datos existentes y corregir divergencias solo en una migración revisada.
4. Crear despliegue de vista previa y validar por rol, idioma, tema y tamaño de pantalla.
5. Reforzar RLS, Storage y transacciones en una fase separada.
6. Publicar con respaldo, monitoreo y procedimiento de reversión.

## Estado de implementación de la rama

- Producción, Supabase, RLS, Storage y variables de entorno permanecen sin cambios.
- La lógica de cierre está extraída en un dominio único y cuenta con escenarios automatizados.
- El formulario de asignación ya no permite aprobar, rechazar ni cerrar.
- PC y móvil envían evidencia al mismo estado de revisión autorizada.
- KPI usa un solo estado de filtros para análisis y detalle.
- El mapa muestra filtros maestros, cantidad visible y filtros activos.
- La acción engañosa de vencimiento del mapa fue retirada; su reincorporación requiere un cálculo real de plazo.
- Falta validar visualmente la vista previa autenticada por rol, tema, idioma y tamaño de pantalla antes de considerar publicación.

## Criterios de aceptación antes de producción

- Ningún hallazgo puede cerrarse desde el formulario de asignación.
- Todo cierre requiere evidencia y una revisión autorizada, salvo excepción empresarial futura explícita y auditable.
- Aprobar/rechazar actualiza de forma coherente los campos de estado y la bitácora.
- El usuario siempre ve una sola acción principal según etapa y rol.
- Los filtros activos muestran alcance y cantidad de resultados.
- Cada filtro del mapa produce un cambio observable.
- KPI y exportaciones usan el mismo universo de datos.
- Funciona en claro/oscuro, español/inglés y escritorio/móvil.
- Compila sin errores y supera los escenarios automatizados del flujo.
