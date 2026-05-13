# Rollback y fallback Supabase

## Retorno inmediato a modo seguro

1. Cambiar en `.env.local`:

```txt
NEXT_PUBLIC_CE_SUPABASE_ENABLED=false
```

2. Reiniciar `next dev` o despliegue.
3. Confirmar que app movil V2 carga y conserva guardado local.
4. Confirmar que panel usa fallback local V2/mock.
5. No borrar datos Supabase sin respaldo y revision.

## Diagnostico si falla activacion

- Revisar consola del navegador sin exponer claves.
- Revisar logs Supabase de Auth, Database y Storage.
- Confirmar que tabla `hallazgos_central` existe.
- Confirmar que bucket `hallazgos-evidencias` existe.
- Confirmar RLS/policies con usuario real de prueba.
- Confirmar que `NEXT_PUBLIC_CE_SUPABASE_ENABLED` sea exactamente `true` solo
  durante prueba.
- Confirmar que no se esta guardando Base64 en JSONB.

## Duplicados y codigos

- Si existe un reporte local y uno central con mismo `codigo`, el panel debe
  evitar duplicados por codigo.
- Si dos dispositivos generaron mismo codigo local, conservar `codigo_local` y
  asignar codigo central unico.
- No editar manualmente codigos sin bitacora.

## Seguridad

- No publicar service role key.
- No hacer bucket publico sin decision formal.
- No desactivar RLS en produccion.
- No eliminar fallback local/mock.
- No commitear `.env.local`.
