# Como probar la app movil de hallazgos CE

Estado: instrucciones para demo interna controlada. No usar para operacion
productiva real.

## Link unico de entrada

Usar siempre:

- `https://criterio-estrategico-app.vercel.app/login`

El sistema redirige segun el rol del usuario:

- Supervisor reportante -> app movil `/evaluar-v2`.
- Administrador, prevencionista o auditor -> panel PC `/panel`.

Usuarios demo disponibles, sin versionar contrasenas:

- `admin.ce.demo@criterioestrategico.cl`
- `admin.cliente.demo@criterioestrategico.cl`
- `supervisor.demo@criterioestrategico.cl`
- `auditor.demo@criterioestrategico.cl`

## Usuario celular

1. Abrir el link unico `/login`.
2. Entrar con el usuario demo entregado por privado.
3. Presionar `Reportar Hallazgo`.
4. Completar area y descripcion.
5. Cargar hasta 3 fotografias de prueba.
6. Capturar GPS o usar ubicacion simulada si corresponde a la prueba.
7. Validar resultado.
8. Revisar informe final.
9. Presionar `Guardar y enviar`.
10. Confirmar mensaje de sincronizacion.
11. Avisar si aparece error, pantalla blanca o carga lenta.

## Instalar en iPhone como PWA

1. Abrir el link en Safari.
2. Presionar Compartir.
3. Seleccionar `Agregar a pantalla de inicio`.
4. Confirmar nombre `Hallazgos CE`.
5. Abrir desde el icono creado.

## Usuario PC

1. Abrir el link unico `/login`.
2. Entrar con usuario administrador, prevencionista o auditor entregado por
   privado.
3. Revisar reportes recientes.
4. Probar filtros.
5. Abrir Mapa GPS.
6. Abrir KPI Gerencial.
7. Revisar seguimiento de cierre.
8. Confirmar que aparecen los hallazgos creados desde celular.

## Advertencias

- Usar solo datos de prueba.
- No subir datos personales sensibles.
- No subir imagenes personales sensibles.
- No usar para operacion legal real todavia.
- No compartir contrasenas en chats o capturas.
- Login requerido para demo controlada, pero RLS definitivo aun esta pendiente.
- Policy Storage temporal sigue siendo no produccion.
- Reportar fallas con fecha, hora, ruta y descripcion breve.
