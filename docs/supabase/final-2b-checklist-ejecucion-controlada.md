# FASE FINAL-2B - Checklist de ejecucion controlada

Estado: preparacion. No ejecutar SQL sin autorizacion explicita.

Archivos preparados:

- `docs/supabase/final-2b-modelo-base-sin-rls.sql`
- `docs/supabase/final-2b-backfill-uuid-propuesta.sql`

## Reglas absolutas

- No activar RLS en esta fase.
- No crear policies.
- No tocar Storage.
- No hacer publico ningun bucket.
- No borrar datos.
- No eliminar columnas texto existentes.
- No usar service_role en frontend.
- No ejecutar en produccion sin respaldo.

## Antes de ejecutar

- Confirmar entorno correcto de Supabase.
- Confirmar si es entorno demo, staging o produccion.
- Exportar respaldo de `public.hallazgos_central`.
- Exportar respaldo de `storage.objects` solo como inventario de metadatos si aplica.
- Confirmar que existe `public.hallazgos_central`.
- Confirmar columnas texto actuales: `empresa`, `obra`, `sigla_empresa`,
  `sigla_proyecto`, `reportante_nombre`.
- Confirmar que el bucket `hallazgos-evidencias` existe, sin modificarlo.
- Confirmar que no se cambiaran policies de Storage.
- Confirmar usuarios demo disponibles en Supabase Auth.
- Confirmar que `.env.local` no se modifica.
- Confirmar que RLS sigue desactivado o, si ya estuviera activo, detenerse y
  revisar antes de aplicar cualquier SQL.
- Confirmar que no hay clientes reales mezclados con datos ficticios si el
  entorno es de prueba.
- Leer completo `final-2b-modelo-base-sin-rls.sql`.
- Leer completo `final-2b-backfill-uuid-propuesta.sql`.

## Ejecucion modelo base

Archivo:

`docs/supabase/final-2b-modelo-base-sin-rls.sql`

Orden recomendado:

1. Pegar el SQL completo en Supabase SQL Editor.
2. Confirmar visualmente que no contiene `enable row level security`.
3. Confirmar visualmente que no contiene `create policy`.
4. Confirmar visualmente que no contiene `drop table`.
5. Ejecutar solo si los puntos anteriores estan OK.
6. Validar que existan tablas:
   - `empresas`
   - `obras`
   - `profiles`
   - `usuario_asignaciones`
   - `hallazgos_central`
7. Validar columnas nuevas en `hallazgos_central`:
   - `empresa_id`
   - `obra_id`
   - `reportante_user_id`
   - `supervisor_user_id`
   - `responsable_cierre_user_id`
   - `mandante_id`
   - `contratista_id`
8. Validar indices principales:
   - `hallazgos_central_empresa_id_idx`
   - `hallazgos_central_obra_id_idx`
   - `hallazgos_central_reportante_user_id_idx`
   - `usuario_asignaciones_user_id_idx`
   - `usuario_asignaciones_empresa_id_idx`
   - `usuario_asignaciones_obra_id_idx`

## Antes de ejecutar backfill

- Revisar resultados de inspeccion del archivo backfill.
- Confirmar empresas detectadas.
- Confirmar obras detectadas.
- Corregir manualmente nombres dudosos antes de poblar UUIDs.
- Revisar homonimos y variantes por mayusculas/minusculas/espacios.
- Confirmar que se mantendran textos historicos.
- No ejecutar backfill si hay empresas/obras ambiguas.

## Ejecucion backfill

Archivo:

`docs/supabase/final-2b-backfill-uuid-propuesta.sql`

Orden recomendado:

1. Ejecutar solo PASO 1: inspeccion.
2. Revisar resultados con calma.
3. Si el inventario esta correcto, ejecutar PASO 2: creacion controlada.
4. Validar conteos de `empresas` y `obras`.
5. Ejecutar PASO 3: backfill de UUIDs.
6. Ejecutar PASO 4: validaciones.
7. No ejecutar PASO 5 salvo autorizacion explicita de rollback logico.

## Despues de ejecutar modelo base

- Probar `/login`.
- Probar login admin hacia `/panel`.
- Probar login supervisor hacia `/evaluar-v2`.
- Probar reporte movil online con una foto.
- Probar reporte movil offline con una foto.
- Probar sincronizacion posterior.
- Confirmar que `public.hallazgos_central` sigue recibiendo datos.
- Confirmar que las evidencias siguen subiendo a `hallazgos-evidencias`.
- Confirmar que el panel muestra evidencias.
- Confirmar que informe empresa/obra muestra evidencias.
- Confirmar que mapa GPS carga.
- Confirmar que KPI gerencial carga.
- Confirmar que alarma critica preventiva carga sin cambiar alcance.
- Confirmar que no se activo RLS.
- Confirmar que no se crearon policies nuevas.
- Confirmar que no se modifico Storage.

## Validaciones SQL posteriores sugeridas

```sql
select count(*) as hallazgos from public.hallazgos_central;
select count(*) as empresas from public.empresas;
select count(*) as obras from public.obras;
select count(*) as profiles from public.profiles;
select count(*) as asignaciones from public.usuario_asignaciones;
```

```sql
select
  count(*) filter (where empresa_id is null) as sin_empresa_id,
  count(*) filter (where obra_id is null) as sin_obra_id
from public.hallazgos_central;
```

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'empresas',
    'obras',
    'profiles',
    'usuario_asignaciones',
    'hallazgos_central'
  )
order by tablename;
```

## Criterio para detenerse

Detener la ejecucion si ocurre cualquiera de estos casos:

- Aparece un error de foreign key inesperado.
- Hay empresas homonimas que podrian mezclarse.
- El backfill deja muchos hallazgos sin `empresa_id` u `obra_id`.
- El panel deja de cargar.
- Las evidencias dejan de visualizarse.
- Supabase indica que RLS esta activo antes de lo esperado.
- Alguien propone ejecutar policies o Storage en esta fase.

## Siguiente fase sugerida

FASE FINAL-2C:

- Adaptar codigo para escribir `empresa_id`, `obra_id`,
  `supervisor_user_id` y `reportante_user_id` en reportes nuevos.
- Mantener compatibilidad con textos historicos.
- No activar RLS hasta validar escritura UUID end-to-end.

