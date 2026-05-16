# Despliegue demo online controlado

Estado: preparacion. No desplegar como produccion final sin RLS/policies
definitivas, usuarios por empresa/obra y revision de seguridad.

## Objetivo

Publicar una demo controlada para 5 a 10 usuarios conocidos, con link celular,
link PC y login de prueba, sin abrir la plataforma como producto final.

## Variables necesarias

Configurar en el hosting, nunca en archivos versionados:

```txt
NEXT_PUBLIC_SUPABASE_URL=project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-public-key
NEXT_PUBLIC_CE_SUPABASE_ENABLED=true
```

Reglas:

- La URL de Supabase debe ser la URL base `https://...supabase.co`, sin
  `/rest/v1/`.
- No usar `service_role` en frontend.
- No subir `.env.local`.
- No pegar secretos en issues, chats, docs ni capturas.

## Rutas de prueba

- `/login`
- `/evaluar-v2`
- `/panel`
- `/panel/mapa-gps`
- `/panel/kpi-gerencial`

## Local vs online

- `localhost` sirve solo en la maquina local.
- Una IP local como `192.168.x.x` sirve solo dentro de la misma red.
- Una URL de hosting online sirve para testers externos controlados.

## Pasos generales en Vercel o equivalente

1. Conectar repositorio GitHub.
2. Seleccionar rama `feature/panel-ejecutivo-v1` o una rama demo dedicada.
3. Configurar variables de entorno del hosting.
4. Crear deploy preview.
5. Probar `/login`.
6. Probar `/evaluar-v2`.
7. Crear hallazgo demo con 1 foto.
8. Crear hallazgo demo con 3 fotos.
9. Confirmar insert en `public.hallazgos_central`.
10. Confirmar subida a `hallazgos-evidencias`.
11. Probar `/panel`, Mapa GPS y KPI.
12. Probar instalacion PWA en iPhone.

## Evidencias en panel durante demo

El panel genera visualizacion de evidencias mediante URLs firmadas de Storage.
El bucket `hallazgos-evidencias` debe mantenerse privado.

Si el panel muestra metadata como "evidencia registrada en Storage" pero no
puede renderizar miniaturas, revisar la propuesta temporal:

- `docs/supabase/storage-select-policy-demo-propuesta.sql`

Advertencias:

- TEMPORAL DEMO / NO PRODUCCION.
- No hacer publico el bucket.
- No usar `service_role` en frontend.
- No subir datos sensibles reales.
- Reemplazar por policy definitiva con Auth + empresa/obra antes de uso con
  clientes reales.

## Links objetivo

Subdominio ideal:

- `https://hallazgos.criterioestrategico.cl/login`
- `https://hallazgos.criterioestrategico.cl/evaluar-v2`
- `https://hallazgos.criterioestrategico.cl/panel`

Si no hay dominio aun, usar la URL temporal del hosting:

- `/login`
- `/evaluar-v2`
- `/panel`

## DNS futuro

- Crear subdominio `hallazgos.criterioestrategico.cl`.
- Apuntar CNAME o registro recomendado por el hosting.
- Validar HTTPS.
- Probar rutas antes de compartir con testers.

## Rollback

- Desactivar deploy preview o proteger URL.
- Volver `NEXT_PUBLIC_CE_SUPABASE_ENABLED=false` en entorno afectado si falla
  Supabase.
- Desactivar usuarios demo en Supabase Auth si se comparte mal un acceso.
- No borrar hallazgos reales sin respaldo.

## No hacer en demo controlada

- No usar datos sensibles reales.
- No abrir enlace en grupos masivos.
- No entregar como produccion final.
- No activar RLS definitivo sin prueba separada.
- No eliminar policy temporal Storage hasta tener reemplazo probado.
- No mantener policy temporal de lectura Storage en produccion final.
