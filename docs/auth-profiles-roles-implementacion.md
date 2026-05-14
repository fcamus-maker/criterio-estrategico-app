# Implementacion Auth + profiles + roles

Estado: Fase 25C preparada para ejecucion manual. No ejecutar RLS definitivo
todavia.

## Objetivo

Preparar la base para que Plataforma Hallazgos use Supabase Auth, perfiles,
roles y asignaciones multiempresa sin bloquear el flujo actual de app movil V2
ni panel PC.

## Implementado en Fase 25B

- SQL propuesto para `empresas`, `obras`, `roles`, `profiles` y
  `usuario_asignaciones`.
- Tipos TypeScript base para roles, perfiles, empresas, obras y asignaciones.
- Servicio defensivo `authProfileService` para leer usuario/perfil si existe
  sesion.
- Ruta `/login` preparada para pruebas manuales con email/password o magic link.

## No activado

- No se ejecuto SQL.
- No se activo RLS definitivo.
- No se elimino la policy temporal anon de Storage.
- No se exigio login en `/evaluar-v2`.
- No se exigio login en `/panel`.
- No se modifico el flujo de guardado de hallazgos.

## Fase 25C - SQL base manual

Archivo:

- `docs/supabase/auth-profiles-roles-base-propuesta.sql`

Ejecutar manualmente:

1. Abrir Supabase Dashboard.
2. Ir a SQL Editor.
3. Abrir el archivo `docs/supabase/auth-profiles-roles-base-propuesta.sql`.
4. Copiar el contenido completo.
5. Pegar en SQL Editor.
6. Revisar que el encabezado diga `FASE 25C - SQL BASE CONTROLADO`.
7. Ejecutar.
8. Verificar que existan:
   - `public.empresas`
   - `public.obras`
   - `public.roles`
   - `public.profiles`
   - `public.usuario_asignaciones`

Este SQL no crea usuarios en `auth.users`, no contiene passwords y no activa RLS.

## Crear usuarios demo en Supabase Auth

Crear manualmente en Supabase Dashboard > Authentication > Users:

1. `admin.ce.demo@criterioestrategico.cl` con rol posterior
   `super_admin_ce`.
2. `admin.cliente.demo@criterioestrategico.cl` con rol posterior
   `admin_cliente`.
3. `supervisor.demo@criterioestrategico.cl` con rol posterior
   `supervisor_reportante`.
4. `auditor.demo@criterioestrategico.cl` con rol posterior
   `visualizador_auditor`.

No guardar contrasenas en archivos ni chats. Usar contrasenas temporales desde
Dashboard o magic link segun configuracion del proyecto.

## Obtener UUID de usuarios

Para cada usuario creado:

1. Abrir el usuario en Authentication > Users.
2. Copiar el `User UID`.
3. Reemplazar placeholders en:
   `docs/supabase/auth-demo-seed-propuesta.sql`.

Placeholders:

- `REEMPLAZAR_UUID_SUPER_ADMIN`
- `REEMPLAZAR_UUID_ADMIN_CLIENTE`
- `REEMPLAZAR_UUID_SUPERVISOR`
- `REEMPLAZAR_UUID_AUDITOR`

## Seed demo manual

Archivo:

- `docs/supabase/auth-demo-seed-propuesta.sql`

Ejecutar solo despues de reemplazar los cuatro UUID reales de Auth.

El seed crea o actualiza:

- empresa demo `Criterio Estrategico Demo`;
- obra demo `Proyecto Demo Seguridad`;
- perfiles en `public.profiles`;
- asignaciones en `public.usuario_asignaciones`.

No inserta en `auth.users`.

## Probar `/login`

1. Levantar app local.
2. Abrir `/login`.
3. Entrar con email/password o solicitar magic link.
4. Si el perfil existe, debe mostrar nombre del perfil.
5. Si falta el perfil, debe informar estado pendiente sin romper.
6. Confirmar que `/evaluar-v2` y `/panel` siguen cargando sin login.

## Orden recomendado despues de Fase 25C

1. Revisar `docs/supabase/auth-profiles-roles-base-propuesta.sql`.
2. Ejecutar SQL base manualmente en Supabase de prueba.
3. Crear usuarios demo en Supabase Auth.
4. Poblar `empresas`, `obras`, `profiles` y `usuario_asignaciones`.
5. Probar `/login` con usuario demo.
6. Confirmar que app movil y panel siguen sin bloqueo.
7. Empezar a poblar `empresa_id`, `obra_id`, `supervisor_user_id` en
   `hallazgos_central`.
8. Recien despues preparar RLS controlado por usuario/asignacion.

## Usuarios demo sugeridos

- `supervisor.demo@criterioestrategico.cl`
- `admin.ce.demo@criterioestrategico.cl`
- `admin.cliente.demo@criterioestrategico.cl`
- `admin.demo@criterioestrategico.cl`
- `auditor.demo@criterioestrategico.cl`

## Perfil supervisor centralizado

El perfil debe venir de `public.profiles`:

- nombre,
- cargo,
- telefono,
- foto_url,
- empresa_id,
- obra_id,
- rol.

La app movil debe mantener localStorage solo como cache/fallback hasta que Auth
este validado con usuarios reales.

## Riesgos

- Si RLS se activa antes de poblar perfiles/asignaciones, app y panel pueden
  quedar sin lectura/escritura.
- Si se elimina anon temporal de Storage antes de Auth, la subida de fotos puede
  fallar.
- Si no se poblan UUIDs en hallazgos, RLS por empresa/obra sera incompleto.
- Si se ejecuta el seed sin reemplazar UUIDs, fallara por cast UUID; eso es
  esperado y evita crear perfiles falsos.

## Rollback

- Mantener rutas sin guard obligatorio.
- Volver `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false` si Supabase falla.
- No eliminar campos texto ni fallback local.
- Revertir solo SQL de Auth/RLS si bloquea demo controlada.
