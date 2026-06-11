# Motor V2 de evaluacion preventiva

Este directorio contiene el primer nucleo aislado del motor V2.

## Estado

- Aislado.
- No conectado al flujo real de `/evaluar-v2`.
- No reemplaza el algoritmo actual.
- No consulta Supabase.
- No toca Storage.
- No modifica reportes.
- No modifica pantallas.

## Archivos

- `types.ts`: contratos de entrada, salida, criticidad, ambitos, normativa y casos.
- `matrizCriticidadV2.ts`: reglas base, topes y utilidades de criticidad.
- `matrizLegalV2.ts`: normativa probable editable, sin articulos inventados.
- `evaluacionMotorV2.ts`: funcion pura `evaluarHallazgoV2(input)`.
- `casosPruebaMotorV2.ts`: casos aislados y helper `ejecutarCasosPruebaMotorV2()`.

## Regla principal

`CRITICO` solo puede activarse si existe al menos una senal critica real.

Ejemplos de senales criticas:

- trabajo en altura sin proteccion;
- energia peligrosa expuesta;
- carga suspendida con exposicion;
- maquinaria sin resguardo con exposicion;
- bloqueo real de via de evacuacion;
- fuego, explosion o atmosfera peligrosa;
- derrame no contenido hacia suelo, agua o alcantarillado;
- sustancia peligrosa liberada;
- documento faltante que habilita actividad critica en ejecucion.

## Topes principales

- Hallazgo menor sin exposicion directa: maximo `MEDIO`.
- Objeto inofensivo sin obstruccion critica: `BAJO` o `MEDIO`.
- Documento faltante sin actividad peligrosa: maximo `MEDIO`.
- Derrame contenido: maximo `MEDIO` salvo otra senal critica real.
- No hay `CRITICO` por suma de respuestas genericas.

## Uso conceptual

```ts
import { evaluarHallazgoV2 } from "./evaluacionMotorV2";

const resultado = evaluarHallazgoV2(input);
```

Para pruebas aisladas:

```ts
import { ejecutarCasosPruebaMotorV2 } from "./casosPruebaMotorV2";

const resultados = ejecutarCasosPruebaMotorV2();
```

Este helper retorna:

- nombre del caso;
- criticidad esperada;
- criticidad obtenida;
- aprobado;
- observacion.

## Proxima fase MOTOR-3B

- Conectar el motor en `/evaluar-v2` de forma controlada.
- Mantener el motor actual como fallback.
- Comparar salida V1 vs V2 antes de reemplazar produccion.
- Validar con reportes online/offline de prueba.

