# Integracion real Mobile V2, Supabase y Panel PC

Estado: diagnostico y preparacion documental. No ejecutar migraciones, no crear
tablas reales, no activar Storage y no activar escritura remota sin un bloque de
implementacion dedicado.

## Estado actual

- La app movil V2 guarda el reporte en `localStorage` y mantiene la experiencia
  local como fuente principal.
- `app/evaluar-v2/informe-final/page.tsx` llama de forma opcional a
  `intentarGuardarReporteV2EnRepositorioCentral`, pero el repositorio central
  responde como desactivado y no escribe datos reales.
- `app/repositories/hallazgosCentralRepository.ts` esta preparado como contrato,
  con lecturas vacias y escrituras bloqueadas para evitar efectos laterales.
- El panel PC lee mediante `app/panel/sources/hallazgosPanelSource.ts` con orden
  seguro: repositorio central, historial local V2 y `mockdata`.
- `lib/supabaseClient.ts` crea cliente solo si existen URL y anon key, pero la
  dependencia debe estar instalada en `node_modules` antes de compilar.
- `.env.local` contiene URL de Supabase; no se revisan ni se imprimen secretos.

## Ruta objetivo

1. App movil V2 genera el reporte.
2. Se conserva guardado local como respaldo.
3. Si Supabase esta configurado, disponible y habilitado por bandera explicita,
   se intenta sincronizar contra la base central.
4. Las fotos se suben a Storage, no se guardan como Base64 en tabla central.
5. La tabla central guarda `storagePath`, URL firmada o metadatos de evidencia.
6. El codigo visible se genera o reserva centralmente para evitar duplicados.
7. El panel PC lee desde Supabase con fallback seguro a local V2 y `mockdata`.
8. Radar Preventivo, Mapa GPS y KPI Gerencial consumen la misma fuente central.
9. Si falla Supabase, app y panel siguen operando con datos locales/mock.

## Storage de evidencias

- Bucket sugerido: `hallazgos-evidencias`.
- Path sugerido:
  `empresa/{empresaId}/obra/{obraId}/hallazgo/{codigo}/{evidenciaId}.jpg`.
- No persistir `dataUrl`/Base64 en `hallazgos_central.evidencias`.
- Asociar cada evidencia por `hallazgo.id`, `codigo`, `storagePath`, MIME type,
  tamano, fecha de carga y origen.
- Mantener respaldo local temporal cuando falle la subida.
- Definir expiracion o URL firmada si hay evidencia sensible.

## RLS y policies futuras

- Activar RLS solo despues de validar roles, empresas y obras.
- Separar lectura por empresa, obra, rol y mandante/contratista.
- Permitir escritura solo a usuarios autorizados o a un endpoint server-side.
- Evitar que la anon key pueda leer datos multiempresa sin filtros/policies.
- Registrar auditoria de usuario, dispositivo, version de app y timestamp.

## Codigos unicos

Riesgo actual: V2 genera codigos con correlativo local desde el historial del
dispositivo. Dos dispositivos pueden crear el mismo correlativo.

Opciones futuras:

- RPC transaccional `reservar_codigo_hallazgo(empresa, obra, origen)`.
- Secuencia por empresa/obra/proyecto.
- Columna `codigo` unique y reintento automatico si hay conflicto.
- Mantener `codigo_local` para trazabilidad cuando el codigo central cambie.

## Fallback y sincronizacion

- `LOCAL`: reporte solo en dispositivo.
- `PENDIENTE_SYNC`: listo para reintentar.
- `SINCRONIZADO`: confirmado por Supabase.
- `ERROR_SYNC`: fallo no destructivo, usuario no pierde el reporte.

El panel debe marcar el origen de cada fila para evitar duplicados cuando un
reporte exista en local y en Supabase.

## Brechas antes de activar

- Confirmar instalacion efectiva de `@supabase/supabase-js`.
- Definir bandera explicita de activacion, por ejemplo
  `NEXT_PUBLIC_CE_SUPABASE_READ_ENABLED` y una ruta server-side para escritura.
- Implementar repositorio real con consultas tipadas y manejo de errores.
- Implementar subida a Storage antes del insert central.
- Definir schema final, RLS, policies e indices en entorno controlado.
- Agregar pruebas de adaptadores, fallback y duplicados.
- Validar flujo end-to-end con dos dispositivos generando reportes simultaneos.

## Advertencia

Este documento no autoriza ejecutar SQL ni conectar produccion. La activacion
real debe hacerse en un bloque separado con backup, entorno de prueba, RLS
validado y plan de rollback.
