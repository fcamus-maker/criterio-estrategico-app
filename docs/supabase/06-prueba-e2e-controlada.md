# Prueba E2E controlada Supabase

Estado: checklist manual. No activar sin proyecto, credenciales y aprobacion.

## Preparacion

1. Crear proyecto Supabase de prueba.
2. Obtener `Project URL` y `anon public key`.
3. Agregar variables en `.env.local` sin commitear:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false`
4. Confirmar que app movil V2 carga con fallback.
5. Confirmar que `/panel`, `/panel/mapa-gps` y `/panel/kpi-gerencial` cargan.

## Recursos Supabase

1. Revisar `01-tabla-hallazgos.sql`.
2. Ejecutar tabla solo en Supabase de prueba.
3. Revisar y ejecutar `02-indices-hallazgos.sql`.
4. Crear bucket `hallazgos-evidencias` con `03-storage-hallazgos-evidencias.sql`
   o desde UI.
5. Revisar RLS/policies contra usuarios reales.
6. Ejecutar `04-rls-policies-hallazgos.sql` solo si claims/roles existen.
7. Revisar estrategia de codigos en `05-codigos-unicos.sql`.

## Activacion controlada

1. Cambiar `NEXT_PUBLIC_CE_SUPABASE_ENABLED=true`.
2. Reiniciar servidor local.
3. Crear reporte desde app movil V2.
4. Confirmar guardado local en historial V2.
5. Confirmar insert en `public.hallazgos_central`.
6. Confirmar que `evidencias` y `fotos` no contienen Base64.
7. Confirmar evidencia en Storage si subida real esta habilitada.
8. Confirmar path/URL en JSONB de evidencias.
9. Confirmar que el panel muestra el hallazgo desde Supabase.
10. Confirmar que Radar Preventivo lo considera.
11. Confirmar que Mapa GPS lo ubica si tiene latitud/longitud.
12. Confirmar que KPI Gerencial actualiza conteos/rankings.

## Prueba de falla

1. Desactivar red o cambiar temporalmente bandera a `false`.
2. Reiniciar app.
3. Confirmar app movil V2 sigue guardando local.
4. Confirmar panel vuelve a local V2/mock.
5. Confirmar que no aparece pantalla blanca ni error visible al usuario.
6. Confirmar que no se duplican codigos al reactivar.

## Evidencia minima de cierre

- Captura de app movil V2 cargando.
- Captura de fila en Supabase sin secretos visibles.
- Captura de Storage con path, sin exponer URLs sensibles.
- Captura de panel, Radar, Mapa GPS y KPI actualizados.
- Registro de fallback probado.
