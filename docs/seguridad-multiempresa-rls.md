# Seguridad multiempresa, usuarios, roles y RLS

Estado: propuesta tecnica. No ejecutar SQL ni activar RLS definitivo sin una
prueba controlada con usuarios reales.

## Estado actual

- App movil V2 inserta hallazgos reales en `public.hallazgos_central`.
- Panel PC lee desde `public.hallazgos_central`.
- Evidencias fotograficas suben al bucket privado `hallazgos-evidencias`.
- Existe una policy temporal de desarrollo para permitir insert anon en
  `storage.objects`; debe eliminarse antes de produccion.
- `.env.local` es local, no versionado, y contiene Supabase activo.
- El flujo V2 central no usa `public.hallazgos`.

## Brechas detectadas

- `hallazgos_central` opera hoy principalmente con campos texto: `empresa`,
  `obra`, `reportante_nombre`, `responsable_cierre_*`.
- Existen columnas preparatorias UUID en el SQL de activacion:
  `empresa_id`, `obra_id`, `mandante_id`, `contratista_id`,
  `supervisor_user_id`, pero el codigo aun no las completa.
- No existe login Supabase Auth implementado en la app movil o panel.
- No existe tabla `profiles`/`perfiles`.
- No existe tabla de asignaciones usuario-empresa-obra.
- Storage esta validado con policy temporal anon, no con policy productiva.
- La foto/perfil del supervisor aun depende de estado local del navegador.

## Arquitectura objetivo

### Empresas

Tabla propuesta: `public.empresas`.

Debe representar clientes, mandantes, contratistas y empresas reportantes.

Campos minimos:

- `id uuid primary key`
- `nombre text not null`
- `rut text`
- `tipo_empresa text` con valores sugeridos:
  `criterio_estrategico`, `cliente`, `mandante`, `contratista`, `reportante`
- `estado text` con valores `activa`, `inactiva`
- `created_at timestamptz`
- `updated_at timestamptz`

### Obras / proyectos

Tabla propuesta: `public.obras`.

Campos minimos:

- `id uuid primary key`
- `empresa_id uuid references public.empresas(id)`
- `mandante_id uuid references public.empresas(id)`
- `nombre text not null`
- `codigo text`
- `ubicacion text`
- `estado text`
- `created_at timestamptz`
- `updated_at timestamptz`

### Perfiles

Tabla propuesta: `public.profiles`.

Debe estar vinculada a Supabase Auth mediante `id uuid references auth.users(id)`.

Campos minimos:

- `id uuid primary key references auth.users(id)`
- `nombre text not null`
- `email text`
- `cargo text`
- `telefono text`
- `foto_url text`
- `empresa_id uuid references public.empresas(id)`
- `obra_id uuid references public.obras(id)`
- `rol text not null`
- `activo boolean not null default true`
- `created_at timestamptz`
- `updated_at timestamptz`

### Asignaciones

Tabla propuesta: `public.usuario_empresa_obra`.

Necesaria cuando un usuario pertenece a varias empresas u obras.

Campos minimos:

- `id uuid primary key`
- `usuario_id uuid references public.profiles(id)`
- `empresa_id uuid references public.empresas(id)`
- `obra_id uuid references public.obras(id)`
- `rol text not null`
- `activo boolean not null default true`
- `created_at timestamptz`
- `updated_at timestamptz`

### Hallazgos central

Mantener compatibilidad con texto actual y agregar/usar relaciones:

- `empresa_id`
- `obra_id`
- `mandante_id`
- `contratista_id`
- `reportante_id`
- `responsable_cierre_id`
- `supervisor_user_id`

Recomendacion: fase inicial hibrida. Conservar `empresa`, `obra` y textos para
reportes/PDF, pero poblar UUID para RLS y joins.

### Evidencias

Modelo recomendado: hibrido.

- Mantener metadata liviana en `hallazgos_central.evidencias` para lectura rapida
  de panel y PDF.
- Crear tabla futura `public.evidencias_hallazgo` para auditoria, permisos finos,
  signed URLs, trazabilidad y volumen alto.

Ventajas del enfoque hibrido:

- No rompe el flujo ya validado.
- Permite panel rapido sin joins obligatorios.
- Permite auditoria seria por archivo.
- Permite controlar signed URLs por usuario/rol.

## Riesgos actuales

- Anon temporal en Storage permite pruebas, pero no separa clientes.
- Sin Auth, el panel no puede filtrar por usuario real.
- Sin UUID poblados, RLS por empresa/obra no puede ser estricta.
- Si se activa RLS antes de perfiles/asignaciones, la app puede quedar bloqueada.
- Paths de Storage ya separan empresa/obra/hallazgo, pero hoy usan texto
  normalizado; en produccion deben usar UUID o codigo estable de empresa/obra.

## Orden de implementacion recomendado

1. Revisar `docs/supabase/auth-profiles-roles-base-propuesta.sql`.
2. Crear `empresas`, `obras`, `roles`, `profiles`, `usuario_asignaciones`.
3. Crear usuarios demo en Supabase Auth.
4. Poblar perfiles y asignaciones.
5. Actualizar app movil para cargar perfil autenticado.
6. Actualizar repositorio para enviar `empresa_id`, `obra_id`,
   `supervisor_user_id`.
7. Actualizar panel para leer segun sesion/rol.
8. Probar RLS en entorno controlado con usuarios demo.
9. Eliminar policy temporal anon de Storage.
10. Activar policies productivas.
11. Preparar signed URLs para evidencias.

## Fase 25B preparada

- Tipos base: `app/types/authRoles.ts`.
- Servicio no bloqueante: `app/services/authProfileService.ts`.
- Login de prueba no obligatorio: `/login`.
- SQL base no ejecutado:
  `docs/supabase/auth-profiles-roles-base-propuesta.sql`.
- Documentacion operativa:
  `docs/auth-profiles-roles-implementacion.md`.

## Rollback

- Mantener `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false` como regreso inmediato a
  fallback.
- No eliminar columnas texto.
- Probar RLS primero con una copia o entorno controlado.
- Mantener scripts SQL separados y reversibles.
