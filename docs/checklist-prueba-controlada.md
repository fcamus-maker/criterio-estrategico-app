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
- Usuarios externos ven datos no esperados.

