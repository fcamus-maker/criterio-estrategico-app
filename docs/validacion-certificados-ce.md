# Validacion publica de certificados CE

## Objetivo

Crear un modulo publico para validar certificados de activacion del Plan CE Activo mediante un codigo unico visible en el certificado o en su QR.

La validacion confirma solamente el estado de vigencia del servicio contratado con Criterio Estrategico. No certifica cumplimiento legal integral de la empresa.

## URL para QR

El QR del certificado debe apuntar a la URL publica real de validacion con el parametro `codigo`.

Ejemplo local:

```text
validar.html?codigo=CEA-LYNX-2026-001
```

Ejemplo futuro en dominio publico:

```text
https://criterioestrategico.cl/validar.html?codigo=CEA-LYNX-2026-001
```

## QR oficial generado

Los archivos QR oficiales apuntan solo a la URL publica final, no a localhost:

```text
assets/qr-certificado-cea-lynx-2026-001.png
assets/qr-certificado-cea-lynx-2026-001.svg
```

## Datos que muestra

- Codigo de certificado.
- Empresa asociada.
- RUT empresa.
- Servicio contratado.
- Estado del servicio: vigente o no vigente.
- Fecha de activacion.
- Ultima vigencia registrada.
- Fecha de ultima actualizacion.
- Nota legal breve.

## Datos que no muestra

- Documentos privados.
- Contratos privados.
- Pagos reales.
- Valores comerciales.
- Archivos internos.
- Enlaces privados.
- Descargas de documentos.
- Datos del Portal Clientes CE que requieran login.

## Registro demo inicial

```text
codigo: CEA-LYNX-2026-001
empresa: Sociedad de Servicios Lynx Plagas Ltda.
rut: 76.781.605-7
servicio: Plan CE Activo
fecha_activacion: 01 de junio de 2026
estado: vigente
ultima_vigencia_registrada: Servicio vigente
fecha_ultima_actualizacion: 01 de junio de 2026
```

## Actualizacion futura

En esta primera version, la validacion usa un listado local demo/controlado en el front-end.

En una etapa posterior, el estado vigente/no vigente debe obtenerse desde una tabla publica segura de Supabase dedicada exclusivamente a validacion de certificados. Esa tabla debe exponer solo datos minimos de validacion publica y nunca documentos privados, contratos, pagos ni rutas de Storage.

## Consideraciones de seguridad

- No usar la base privada del Portal Clientes CE para esta pagina publica.
- No exponer documentos ni rutas privadas.
- No usar `service_role` en frontend.
- No permitir descargas desde el modulo publico.
- No conectar Storage desde esta pagina.
