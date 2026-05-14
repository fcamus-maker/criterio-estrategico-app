# Matriz de usuarios, roles y permisos

Estado: propuesta tecnica. No ejecutar policies sin Supabase Auth, perfiles y
asignaciones reales.

## Roles base

| Rol | Alcance | Lectura | Creacion | Actualizacion | Exportacion | Storage |
| --- | --- | --- | --- | --- | --- | --- |
| `super_admin_ce` | Global CE | Todo | Empresas, obras, usuarios, hallazgos | Todo | Todo | Todo por policy |
| `admin_cliente` | Empresa/mandante asignado | Empresa/obras asignadas | Usuarios internos y configuracion limitada | Seguimiento, responsables, estados | Si | Evidencias de su alcance |
| `admin_mandante` | Mandante asignado | Obras asociadas | Limitado | Seguimiento y observaciones | Si | Evidencias de obras asignadas |
| `prevencionista_cliente` | Empresa/obra | Hallazgos de su alcance | Hallazgos y gestion preventiva | Criticidad, seguimiento, cierre operativo | Si, segun permiso | Evidencias de su alcance |
| `supervisor_reportante` | App movil | Propios o de su obra | Hallazgos, fotos, GPS | Propios antes de cierre, si aplica | No por defecto | Subida de evidencias |
| `responsable_cierre` | Asignados | Hallazgos asignados | Evidencias de cierre | Estado de correccion | No por defecto | Evidencias de cierre asignadas |
| `visualizador_auditor` | Empresa/obra asignada | Solo lectura | No | No | Si se autoriza | Solo lectura via signed URL |

## Reglas de negocio

- Nadie debe borrar hallazgos en produccion desde app o panel normal.
- Borrado logico solo para `super_admin_ce`, con bitacora.
- Exportaciones deben respetar el mismo filtro RLS.
- `supervisor_reportante` no debe ver panel ejecutivo salvo permiso explicito.
- `responsable_cierre` no debe ver datos de otras empresas/obras.
- `visualizador_auditor` no debe crear ni actualizar registros.

## Matriz resumida por modulo

| Modulo | super_admin_ce | admin_cliente/admin_mandante | prevencionista_cliente | supervisor_reportante | responsable_cierre | visualizador_auditor |
| --- | --- | --- | --- | --- | --- | --- |
| App movil V2 | Si | Opcional | Opcional | Si | Opcional cierre | No |
| Panel ejecutivo | Si | Si alcance | Si alcance | No default | Solo asignados | Solo lectura |
| Radar Preventivo | Si | Si alcance | Si alcance | No default | No default | Solo lectura |
| Mapa GPS | Si | Si alcance | Si alcance | No default | No default | Solo lectura |
| KPI Gerencial | Si | Si alcance | Si alcance | No default | No default | Solo lectura |
| Seguimiento cierre | Si | Si alcance | Si alcance | No default | Asignados | Solo lectura |
| Evidencias Storage | Si | Si alcance | Si alcance | Subir propias | Subir cierre | Ver con autorizacion |

## Reglas para RLS

- El alcance real se calcula desde `public.usuario_empresa_obra`.
- `super_admin_ce` puede leer todo.
- Roles de cliente/mandante/prevencionista leen por empresa/obra asignada.
- Supervisor inserta solo para empresa/obra asignada.
- Responsable actualiza solo hallazgos donde `responsable_cierre_id = auth.uid()`
  o exista asignacion especifica.
- Auditor solo select.

