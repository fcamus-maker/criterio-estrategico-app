# Checklist prueba controlada

Estado: checklist para demo online pequena. No reemplaza RLS/policies de
produccion.

## Antes de probar

- [ ] Deploy online disponible.
- [ ] Variables Supabase configuradas en hosting.
- [ ] `/login` responde OK.
- [ ] `/evaluar-v2` responde OK.
- [ ] `/panel` responde OK.
- [ ] Usuario demo probado.
- [ ] Insert Supabase probado.
- [ ] Storage probado.
- [ ] Si se requiere ver miniaturas en panel, policy temporal demo de lectura
      Storage revisada y ejecutada manualmente por responsable autorizado.
- [ ] RLS definitivo pendiente y riesgo entendido.
- [ ] Testers conocen que es demo controlada.

## Prueba celular

- [ ] Abrir link en Safari iPhone.
- [ ] Agregar a pantalla de inicio.
- [ ] Crear reporte con 1 foto.
- [ ] Crear reporte con 3 fotos.
- [ ] Confirmar mensaje final.
- [ ] Revisar `public.hallazgos_central`.
- [ ] Revisar bucket `hallazgos-evidencias`.
- [ ] Confirmar que las evidencias se ven en panel o, si no hay permisos de
      lectura, que aparece mensaje claro de evidencia registrada en Storage.
- [ ] Revisar panel PC.

## Prueba PC

- [ ] Abrir `/panel`.
- [ ] Ver hallazgos nuevos.
- [ ] Revisar KPI.
- [ ] Revisar Mapa GPS.
- [ ] Revisar seguimiento.
- [ ] Revisar filtros.

## Criterios de exito

- Reporte aparece en panel.
- Fotos aparecen en Storage.
- Metadata aparece en `hallazgos_central`.
- Panel/informe muestra miniatura de evidencia o estado claro de permiso
  pendiente.
- No se cae la app.
- No se pierde el reporte.
- Mensajes de error son claros.
- Panel actualiza datos.

## Criterios de detencion

- Error de credenciales.
- Error Storage.
- Error insert Supabase.
- Pantalla blanca.
- Datos duplicados masivos.
- Panel no carga.
- Evidencias no suben.
- Evidencias suben pero panel no muestra ni miniatura ni mensaje de metadata.
- Usuarios externos ven datos no esperados.

## Nota sobre policy temporal de lectura Storage

Archivo de referencia:

- `docs/supabase/storage-select-policy-demo-propuesta.sql`

Uso:

- Solo demo controlada.
- No produccion.
- No hacer publico el bucket.
- No usar `service_role` en frontend.
- Reemplazar por Auth/RLS definitivo antes de clientes reales.
