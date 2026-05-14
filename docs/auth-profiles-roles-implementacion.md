# Implementacion Auth + profiles + roles

Estado: Fase 25B preparada. No ejecutar SQL ni activar RLS definitivo todavia.

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

## Orden recomendado para Fase 25C

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

## Rollback

- Mantener rutas sin guard obligatorio.
- Volver `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false` si Supabase falla.
- No eliminar campos texto ni fallback local.
- Revertir solo SQL de Auth/RLS si bloquea demo controlada.
