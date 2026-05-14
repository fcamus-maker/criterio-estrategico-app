# Paquete Supabase activacion controlada

Estado: preparado para revision manual. No ejecutar en produccion ni en un
proyecto Supabase real sin aprobacion expresa, backup, RLS validado y plan de
rollback.

Este paquete separa la activacion futura en piezas revisables:

1. `01-tabla-hallazgos.sql`: tabla central compatible con `HallazgoCentral`.
2. `02-indices-hallazgos.sql`: indices para panel, Radar, Mapa GPS y KPI.
3. `03-storage-hallazgos-evidencias.sql`: preparacion documental del bucket.
4. `04-rls-policies-hallazgos.sql`: propuesta de RLS/policies multiempresa.
5. `05-codigos-unicos.sql`: propuesta para codigos centralizados.
6. `06-prueba-e2e-controlada.md`: checklist App V2 -> Supabase -> Panel.
7. `07-rollback-fallback.md`: retorno seguro a fallback.
8. `auth-profiles-roles-base-propuesta.sql`: base Auth/perfiles/roles sin RLS
   definitivo.
9. `auth-demo-seed-propuesta.sql`: seed demo con placeholders de UUID Auth.
10. `rls-produccion-propuesta.sql`: modelo Auth/perfiles/asignaciones y RLS
   definitivo propuesto.
11. `storage-policies-produccion-propuesta.sql`: policies productivas propuestas
   para `hallazgos-evidencias`.

Documentos complementarios:

- `../seguridad-multiempresa-rls.md`
- `../usuarios-roles-matriz.md`
- `../demo-controlada-plan.md`
- `../auth-profiles-roles-implementacion.md`

## Orden recomendado de revision

1. Revisar variables en `.env.local` sin mostrar valores.
2. Mantener `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false`.
3. Revisar SQL de tabla e indices con un responsable tecnico.
4. Crear proyecto Supabase de prueba, nunca produccion directa.
5. Revisar RLS/policies contra el modelo real de usuarios/roles.
6. Ejecutar solo manualmente en Supabase SQL Editor o migracion aprobada.
7. Crear bucket `hallazgos-evidencias` solo despues de validar policies.
8. Activar bandera solo para prueba controlada.
9. Eliminar policies temporales anon antes de demo real o produccion.

## Protecciones

- No pegar claves en chats, issues ni documentos.
- No versionar `.env.local`.
- No usar service role key en cliente.
- No guardar Base64 en `hallazgos_central`.
- No hacer bucket publico sin decision de seguridad.
- No desactivar fallback local/mock.
- No activar Supabase real sin prueba E2E y rollback.
