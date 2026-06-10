# FASE FINAL-2A - Plan de migracion multiempresa

Estado: propuesta tecnica. No ejecutar SQL ni tocar Supabase hasta una fase
controlada de aplicacion.

## 1. Decision de modelo

El nombre oficial de la tabla de asignaciones sera:

`public.usuario_asignaciones`

No usar `public.usuario_empresa_obra` en nuevas migraciones, policies ni
documentos operativos. Ese nombre queda como referencia historica de borradores.

La tabla `usuario_asignaciones` debe cubrir:

- `user_id`: usuario de Supabase Auth.
- `empresa_id`: empresa autorizada.
- `obra_id`: obra autorizada, opcional.
- `rol`: rol operativo dentro del alcance.
- `activo`: control de vigencia.
- `created_at` y `updated_at`.

Reglas de alcance:

- Un usuario puede tener varias empresas mediante varias filas.
- Un usuario puede tener varias obras mediante varias filas.
- `obra_id = null` significa acceso a toda la empresa.
- `admin_cliente` normalmente usa `obra_id = null` para su empresa.
- `supervisor_reportante` debe tener una o mas obras explicitas, salvo caso
  operacional aprobado.
- `super_admin_ce` puede tener asignacion global administrativa, pero RLS debe
  reconocerlo por rol desde `profiles`.

## 2. Modelo final propuesto

### empresas

Campos:

- `id uuid primary key`
- `nombre text not null`
- `sigla text`
- `rut text`
- `estado text`
- `logo_url text`
- `created_at timestamptz`
- `updated_at timestamptz`

Uso:

- Representa cliente principal o empresa responsable del universo de datos.
- Debe usarse para RLS, filtros reales, reportes e identidad comercial.

### obras

Campos:

- `id uuid primary key`
- `empresa_id uuid references empresas(id)`
- `nombre text not null`
- `sigla text`
- `estado text`
- `ubicacion text`
- `created_at timestamptz`
- `updated_at timestamptz`

Uso:

- Representa obra/proyecto dentro de una empresa.
- `empresa_id + nombre` debe ser unico para evitar duplicados por texto.

### profiles

Campos:

- `id uuid primary key references auth.users(id)`
- `email text`
- `nombre text`
- `cargo text`
- `telefono text`
- `foto_url text`
- `rol text`
- `empresa_id uuid`
- `obra_id uuid`
- `activo boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Uso:

- Perfil principal del usuario autenticado.
- `empresa_id` y `obra_id` sirven como default operativo.
- El alcance real debe salir de `usuario_asignaciones`.

### usuario_asignaciones

Campos:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `empresa_id uuid references empresas(id)`
- `obra_id uuid references obras(id), nullable`
- `rol text references roles(id)`
- `activo boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Uso:

- Es la fuente oficial de autorizacion multiempresa.
- Permite un usuario en varias empresas/obras.
- Permite roles distintos por alcance si se requiere.

### hallazgos_central

Mantener campos texto actuales:

- `empresa`
- `obra`
- `sigla_empresa`
- `sigla_proyecto`
- `reportante_nombre`
- `responsable_cierre_*`

Agregar/usar campos UUID:

- `empresa_id`
- `obra_id`
- `reportante_user_id`
- `supervisor_user_id`
- `responsable_cierre_user_id`
- `mandante_id`
- `contratista_id`

Regla de transicion:

- Los textos quedan como snapshot historico para panel, PDF, trazabilidad y
  compatibilidad.
- Los UUID quedan como fuente de seguridad, RLS, joins y autorizacion.

## 3. Plan de migracion/backfill

Fase 1: inventario

- Contar empresas distintas desde `hallazgos_central.empresa`.
- Contar obras distintas por `empresa + obra`.
- Detectar homonimos, tildes, espacios dobles y siglas repetidas.
- Revisar registros sin empresa/obra antes de crear UUIDs.

Fase 2: crear modelo

- Crear `empresas`, `obras`, `roles`, `profiles`, `usuario_asignaciones`.
- Agregar columnas UUID a `hallazgos_central`.
- Crear indices.
- No activar RLS todavia.

Fase 3: backfill de empresas/obras

- Crear empresas desde textos existentes.
- Crear obras desde textos existentes por empresa.
- Poblar `hallazgos_central.empresa_id`.
- Poblar `hallazgos_central.obra_id`.
- Revisar manualmente registros sin match.

Fase 4: usuarios

- Crear usuarios reales o demo en Supabase Auth.
- Crear `profiles` vinculados a `auth.users`.
- Crear `usuario_asignaciones`.
- Validar que cada usuario tenga al menos una asignacion activa, salvo
  `super_admin_ce`.

Fase 5: codigo en modo hibrido

- Mantener lectura actual por texto mientras se validan UUIDs.
- Empezar a escribir `empresa_id`, `obra_id`, `supervisor_user_id` en nuevos
  reportes.
- El panel debe seguir funcionando con textos durante la transicion.

Fase 6: RLS controlado

- Probar RLS con usuarios demo cliente A/B.
- Confirmar que cliente A no ve cliente B.
- Confirmar que supervisor solo inserta en su empresa/obra.
- Confirmar que responsable solo ve/asigna lo correspondiente.

## 4. Storage productivo

Ruta productiva nueva:

`empresa/{empresa_id}/obra/{obra_id}/hallazgo/{codigo}/{archivo}.jpg`

Decision recomendada:

- No migrar evidencias antiguas en esta fase.
- Mantener rutas antiguas basadas en texto para compatibilidad historica.
- Usar rutas UUID solo para reportes nuevos cuando el app ya tenga
  `empresa_id` y `obra_id`.
- El panel debe soportar ambos formatos mientras dure la transicion.
- Las policies productivas deben aplicarse solo a rutas UUID.

Riesgo de migrar evidencias antiguas ahora:

- Se puede romper metadata existente en `hallazgos_central.evidencias`.
- Se pueden invalidar URLs o paths guardados en informes.
- Se puede perder trazabilidad si no hay tabla de auditoria de evidencias.

## 5. Impacto app movil/offline

Estado actual:

- El perfil movil guarda principalmente texto: empresa, obra, siglas, nombre,
  cargo y foto.
- El reporte offline conserva texto y fotos locales.
- No hay contrato principal con `empresa_id`, `obra_id`,
  `reportante_user_id` ni `supervisor_user_id`.

Cambios necesarios:

- `app/evaluar-v2/supervisorProfileStorage.ts`
  - Agregar `empresaId`, `obraId`, `userId`.
  - Cargar empresa/obra desde `profiles` y `usuario_asignaciones`.
  - Evitar que el supervisor escriba una empresa no asignada.

- `app/evaluar-v2/storageReporteV2.ts`
  - Agregar campos persistidos `empresaId`, `obraId`, `reportanteUserId`,
    `supervisorUserId`.
  - Mantener los textos para compatibilidad.
  - Asegurar que IndexedDB/localStorage no pierdan UUIDs.

- `app/services/guardarReporteV2Completo.ts`
  - Validar sesion y asignacion antes de subir Storage/Supabase.
  - Enviar Storage con ruta UUID.
  - Mantener pendiente si falta autorizacion real.

- `app/adapters/reporteV2ToHallazgoCentral.ts`
  - Mapear UUIDs hacia `HallazgoCentral`.

- `app/repositories/hallazgosCentralRepository.ts`
  - Insertar y actualizar columnas UUID.
  - Construir `storagePath` con UUID cuando existan.

## 6. Impacto panel, informes y alarma

Estado actual:

- `cargarHallazgosPanelConFuentesOpcionales` llama
  `listarHallazgosCentrales({ limit: 500 })`.
- La alarma trabaja sobre hallazgos visibles en el panel.
- Informes, mapa GPS y KPI heredan el universo leido.

Cambios necesarios:

- `app/repositories/hallazgosCentralRepository.ts`
  - Agregar filtros por `empresa_id`, `obra_id`, `user_id` cuando corresponda.
  - Mantener compatibilidad con RLS: si RLS esta activo, el query puede ser
    simple, pero debe existir trazabilidad de alcance.

- `app/panel/sources/hallazgosPanelSource.ts`
  - Obtener perfil/asignaciones antes de leer o confiar en RLS activo.
  - Evitar fallback global con datos reales multiempresa.

- `app/panel/page.tsx`
  - Mostrar filtros solo dentro del universo autorizado.
  - No permitir que informes exporten datos fuera del alcance.

- `app/panel/kpi-gerencial/page.tsx`
  - Usar el mismo universo autorizado que el panel.

- `app/panel/mapa-gps/page.tsx`
  - Filtrar puntos GPS por alcance.

- `app/analytics/alertaCriticos.ts`
  - No requiere RLS propio si recibe solo datos autorizados.
  - Debe documentarse que su entrada ya debe venir filtrada.

## 7. Validaciones futuras

- Usuario `super_admin_ce` ve todas las empresas.
- Usuario `admin_cliente` ve solo su empresa.
- Usuario con dos empresas ve exactamente esas dos.
- Usuario con una obra ve solo esa obra.
- `supervisor_reportante` inserta solo en obra asignada.
- `responsable_cierre` ve solo hallazgos asignados o de su alcance.
- `visualizador_auditor` no puede insertar ni actualizar.
- Cliente A no ve hallazgos, mapa, KPI, informes ni evidencias de cliente B.
- Storage no permite listar/firmar objetos fuera del alcance.
- Offline guarda UUIDs y sincroniza al volver online.
- Reportes antiguos con rutas texto siguen visibles durante transicion.

## 8. Riesgos

- Activar RLS antes de poblar UUIDs puede dejar la app sin datos.
- Permitir fallback mock/local en produccion puede mezclar percepcion de datos.
- Usar rutas Storage con texto no garantiza aislamiento robusto.
- Migrar evidencias antiguas sin tabla de auditoria puede romper visualizacion.
- Duplicados por nombres de empresa/obra pueden mapear mal el backfill.
- Mantener `usuario_empresa_obra` en policies nuevas reintroduce inconsistencia.
- Guardar `empresa_id` solo en perfil y no en asignaciones no escala a usuarios
  multiempresa.

## 9. Proxima fase recomendada

FASE FINAL-2B:

- Revisar manualmente el SQL preparado.
- Decidir entorno de prueba.
- Crear snapshot/backup.
- Ejecutar solo modelo base sin RLS.
- Validar backfill.
- Ajustar codigo para escribir UUIDs en nuevos reportes.

