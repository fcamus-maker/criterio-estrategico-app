# Plan demo controlada

Estado: propuesta para demo controlada. No usar como produccion final.

## Objetivo

Mostrar Plataforma Hallazgos a una empresa sin exponer datos reales ni mezclar
clientes.

Advertencia obligatoria:

> Demo controlada interna. No usar para operacion productiva real hasta activar
> RLS/policies definitivas, control de usuarios por empresa/obra y revision de
> seguridad.

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

- Login: `https://hallazgos.criterioestrategico.cl/login`
- App movil: `https://hallazgos.criterioestrategico.cl/evaluar-v2`
- Panel PC: `https://hallazgos.criterioestrategico.cl/panel`
- Mapa GPS: `https://hallazgos.criterioestrategico.cl/panel/mapa-gps`
- KPI Gerencial: `https://hallazgos.criterioestrategico.cl/panel/kpi-gerencial`

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

- Maximo inicial recomendado: 5 a 10 usuarios conocidos.
- Usar solo empresa/obra demo.
- Usar solo hallazgos ficticios o de prueba.
- No usar datos reales sensibles.
- No usar clientes reales sin autorizacion expresa.
- La policy anon temporal de Storage es solo desarrollo; no es produccion.
- Usar Supabase Auth para pruebas de login.
- RLS por asignacion empresa/obra queda pendiente antes de cliente real.
- Bucket privado.
- Evidencias mediante signed URLs o select controlado.
- No compartir service role key.
- No subir `.env.local`.
- No exigir login en app/panel hasta validar usuarios demo y fallback.

## Instrucciones iPhone

1. Abrir link de `/evaluar-v2` en Safari.
2. Probar creacion de reporte con 1 foto.
3. Probar creacion de reporte con 3 fotos.
4. Confirmar mensaje de sincronizacion.
5. Compartir -> Agregar a pantalla de inicio.
6. Abrir desde icono `Hallazgos CE`.

## Instrucciones PC

1. Abrir `/panel`.
2. Revisar ultimos reportes.
3. Abrir `/panel/mapa-gps`.
4. Abrir `/panel/kpi-gerencial`.
5. Revisar seguimiento de cierre.

## Que registrar

- Fecha y hora de prueba.
- Usuario demo utilizado.
- Dispositivo y navegador.
- Codigo del hallazgo.
- Cantidad de fotos.
- Mensaje final mostrado.
- Error si aparece.

## Criterios de exito

- El reporte se guarda en `public.hallazgos_central`.
- Las evidencias suben a `hallazgos-evidencias`.
- El panel muestra el hallazgo.
- Mapa y KPI siguen cargando.
- La app instalada desde iPhone abre correctamente.

## Rollback

- Desactivar bandera local si falla la demo.
- Desactivar usuarios demo.
- Mantener dataset demo separado.
- No borrar hallazgos reales.
