# Plan demo controlada

Estado: propuesta. No desplegar ni crear usuarios reales desde este bloque.

## Objetivo

Mostrar Plataforma Hallazgos a una empresa sin exponer datos reales ni mezclar
clientes.

## Datos demo

- Empresa demo: `Criterio Estrategico Demo`
- Obra demo: `Proyecto Demo Seguridad`
- Bucket: usar `hallazgos-evidencias` con paths bajo empresa/obra demo.
- Hallazgos: dataset demo aislado por `empresa_id` y `obra_id`.

## Usuarios demo sugeridos

- Supervisor: `supervisor.demo@criterioestrategico.cl`
- Admin: `admin.demo@criterioestrategico.cl`
- Auditor: `auditor.demo@criterioestrategico.cl`

## Rutas futuras

- App movil: `https://hallazgos.criterioestrategico.cl/evaluar-v2`
- Panel PC: `https://hallazgos.criterioestrategico.cl/panel`

## Flujo de prueba

1. Login supervisor demo.
2. Crear hallazgo con GPS y 3 fotos.
3. Confirmar insert en `public.hallazgos_central`.
4. Confirmar archivos en `hallazgos-evidencias`.
5. Login admin demo.
6. Revisar panel, Radar, Mapa GPS, KPI y seguimiento.
7. Confirmar que usuario auditor solo lee.
8. Confirmar que usuarios demo no ven datos reales.

## Reglas de seguridad

- No usar policy anon temporal en demo.
- Usar Supabase Auth.
- Usar RLS por asignacion empresa/obra.
- Bucket privado.
- Evidencias mediante signed URLs o select controlado.
- No compartir service role key.
- No subir `.env.local`.

## Rollback

- Desactivar bandera local si falla la demo.
- Desactivar usuarios demo.
- Mantener dataset demo separado.
- No borrar hallazgos reales.

