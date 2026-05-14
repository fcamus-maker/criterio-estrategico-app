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

- Super admin CE: `admin.ce.demo@criterioestrategico.cl`
- Admin cliente: `admin.cliente.demo@criterioestrategico.cl`
- Supervisor: `supervisor.demo@criterioestrategico.cl`
- Admin: `admin.demo@criterioestrategico.cl`
- Auditor: `auditor.demo@criterioestrategico.cl`

## Rutas futuras

- App movil: `https://hallazgos.criterioestrategico.cl/evaluar-v2`
- Panel PC: `https://hallazgos.criterioestrategico.cl/panel`

## Flujo de prueba

1. Ejecutar SQL base revisado de Auth/perfiles en entorno de prueba.
2. Crear usuarios demo en Supabase Auth.
3. Copiar User UID de cada usuario Auth.
4. Reemplazar UUIDs en `docs/supabase/auth-demo-seed-propuesta.sql`.
5. Ejecutar seed demo manual.
6. Probar `/login` con supervisor demo.
7. Crear hallazgo con GPS y 3 fotos.
8. Confirmar insert en `public.hallazgos_central`.
9. Confirmar archivos en `hallazgos-evidencias`.
10. Probar `/login` con admin cliente demo.
11. Revisar panel, Radar, Mapa GPS, KPI y seguimiento.
12. Confirmar que usuario auditor solo lee cuando RLS exista.
13. Confirmar que usuarios demo no ven datos reales antes de entregar demo.

## Reglas de seguridad

- No usar policy anon temporal en demo.
- Usar Supabase Auth.
- Usar RLS por asignacion empresa/obra.
- Bucket privado.
- Evidencias mediante signed URLs o select controlado.
- No compartir service role key.
- No subir `.env.local`.
- No exigir login en app/panel hasta validar usuarios demo y fallback.

## Rollback

- Desactivar bandera local si falla la demo.
- Desactivar usuarios demo.
- Mantener dataset demo separado.
- No borrar hallazgos reales.
