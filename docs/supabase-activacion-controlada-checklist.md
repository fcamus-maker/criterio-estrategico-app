# Checklist activacion controlada Supabase real

Estado: inventario operativo y preparacion. No ejecutar SQL real, no crear
bucket real y no activar `NEXT_PUBLIC_CE_SUPABASE_ENABLED=true` hasta completar
este checklist en un entorno controlado.

## 1. Proyecto Supabase

- Crear o seleccionar un proyecto Supabase dedicado para Plataforma Hallazgos.
- Confirmar region, plan, backups y responsables de administracion.
- Obtener `Project URL` desde la configuracion API del proyecto.
- Obtener `anon public key` desde la configuracion API del proyecto.
- No usar service role key en cliente web ni en variables `NEXT_PUBLIC_*`.
- No pegar claves en chats, issues, documentos ni commits.

## 2. Variables locales

Agregar en `.env.local`, sin commitear valores reales:

```txt
NEXT_PUBLIC_SUPABASE_URL=project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-public-key
NEXT_PUBLIC_CE_SUPABASE_ENABLED=false
```

Reglas:

- Mantener `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false` durante preparacion.
- Cambiar a `true` solo para una prueba controlada con tabla, Storage y RLS
  listos.
- Reiniciar `next dev` despues de cambiar variables.
- Si algo falla, volver la bandera a `false` y validar fallback local/mock.

## 3. Schema central

- Revisar `docs/hallazgos-central.schema.sql` antes de ejecutar.
- Revisar el paquete separado `docs/supabase/README.md` y ejecutar, si se
  aprueba, en este orden: tabla, indices, Storage, RLS/policies y codigos.
- Confirmar nombre objetivo de tabla: `public.hallazgos_central`.
- Confirmar columnas de contexto: empresa, obra, area, reportante, fechas,
  criticidad, estado y cierre.
- Confirmar columnas GPS: latitud, longitud, precision, zona y sector.
- Confirmar columnas para Radar Preventivo, Mapa GPS y KPI Gerencial.
- Confirmar indices por empresa/obra, estado, criticidad, fecha, responsable y
  GPS.
- Ejecutar SQL solo en proyecto Supabase de prueba y con plan de rollback.

## 4. Storage evidencias

- Crear bucket `hallazgos-evidencias` solo en entorno controlado.
- No guardar Base64 en `hallazgos_central`.
- Guardar `storagePath`, URL firmada o metadatos de evidencia.
- Path recomendado:
  `empresa/{empresa}/obra/{obra}/hallazgo/{codigo}/{evidenciaId}.jpg`.
- Mantener respaldo local si falla la subida.
- Validar tamano maximo, tipo MIME y expiracion de URLs firmadas.

## 5. RLS y policies

- Revisar `docs/auth-profiles-roles-implementacion.md`.
- Revisar `docs/supabase/auth-profiles-roles-base-propuesta.sql`.
- Activar RLS despues de definir empresas, obras, roles y modelo de usuarios.
- Revisar `docs/seguridad-multiempresa-rls.md`.
- Revisar `docs/usuarios-roles-matriz.md`.
- Revisar `docs/supabase/rls-produccion-propuesta.sql`.
- Revisar `docs/supabase/storage-policies-produccion-propuesta.sql`.
- Separar lectura por empresa, obra, rol, mandante y contratista.
- Permitir escritura solo a usuarios autorizados o a una ruta server-side.
- Evitar lectura multiempresa con anon key sin filtros/policies.
- Registrar auditoria: usuario, dispositivo, version de app y timestamp.
- Probar policies con usuario de mandante, contratista y administrador.
- Eliminar la policy temporal anon de Storage antes de demo real o produccion.

## 6. Prueba controlada

Checklist detallado: `docs/supabase/06-prueba-e2e-controlada.md`.

1. Confirmar `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false`.
2. Levantar app y validar que app movil V2 y panel funcionan con fallback.
3. Crear tabla y bucket en entorno de prueba.
4. Configurar RLS/policies minimas de prueba.
5. Cambiar `NEXT_PUBLIC_CE_SUPABASE_ENABLED=true`.
6. Reiniciar servidor.
7. Crear un reporte desde app movil V2.
8. Confirmar guardado local como respaldo.
9. Confirmar insert central en `hallazgos_central`.
10. Confirmar que evidencias no llegan como Base64 a la tabla.
11. Confirmar lectura del panel desde Supabase.
12. Confirmar Radar, Mapa GPS y KPI con la fuente central.
13. Simular falla de red/Supabase y confirmar fallback.

## 6B. Fase 25C Auth demo

- [ ] SQL base Auth revisado.
- [ ] SQL base ejecutado manualmente desde SQL Editor.
- [ ] Usuarios Auth demo creados desde Supabase Dashboard.
- [ ] UUIDs de usuarios Auth copiados.
- [ ] `docs/supabase/auth-demo-seed-propuesta.sql` editado localmente con UUIDs
      reales antes de pegar en SQL Editor.
- [ ] Empresa demo creada.
- [ ] Obra demo creada.
- [ ] Profiles demo insertados.
- [ ] Asignaciones demo insertadas.
- [ ] `/login` probado.
- [ ] `/evaluar-v2` sigue sin bloqueo.
- [ ] `/panel` sigue sin bloqueo.
- [ ] RLS definitivo aun no activado.

## 7. Reversion

Plan detallado: `docs/supabase/07-rollback-fallback.md`.

- Volver `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false`.
- Reiniciar servidor.
- Confirmar que app movil V2 carga y mantiene guardado local.
- Confirmar que panel vuelve a local V2/mock si Supabase no responde.
- No borrar datos reales sin respaldo.

## No hacer

- No activar produccion sin prueba E2E.
- No guardar Base64 en tabla central.
- No pegar claves en chats ni documentacion.
- No usar service role key en cliente.
- No desactivar fallback.
- No ejecutar migraciones reales desde este repositorio sin aprobacion expresa.
