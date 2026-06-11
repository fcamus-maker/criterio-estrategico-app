# FASE MOTOR-2 - Diseno tecnico implementable del motor V2

Documento de diseno. No modifica codigo funcional.

## 1. Base oficial

Este diseno toma como base oficial:

- `docs/algoritmo/diagnostico-motor-evaluacion-v2.md`
- `docs/algoritmo/matriz-legal-base-v2.md`

Problema central detectado en MOTOR-1:

- El motor actual suma puntajes lineales.
- Un hallazgo menor puede llegar a `CRITICO` por acumulacion de respuestas genericas.
- No existe requisito obligatorio de senal roja real para `CRITICO`.
- No se separan seguridad, salud ocupacional, ambiente y legal/documental.
- No existen topes por tipo menor ni deteccion robusta de incoherencias.

Objetivo V2:

- Clasificar primero el hallazgo.
- Definir criticidad base por tipo.
- Elevar solo con senales reales.
- Limitar hallazgos menores.
- Separar ambitos tecnicos.
- Explicar la decision.
- Marcar revision manual ante incoherencias.

## 2. Funcion principal propuesta

Nombre propuesto:

```ts
evaluarHallazgoV2(input)
```

Ubicacion sugerida para MOTOR-3:

```txt
app/evaluar-v2/evaluacion/evaluacionMotorV2.ts
```

El motor debe ser puro y testeable:

- No consulta Supabase.
- No lee Storage.
- No depende de componentes React.
- No modifica localStorage/IndexedDB.
- Recibe un input completo.
- Retorna un output auditable.

## 3. Tipos conceptuales

```ts
type NivelCriticidad = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

type AmbitoHallazgo =
  | "seguridad_laboral"
  | "salud_ocupacional"
  | "medio_ambiente"
  | "legal_documental"
  | "emergencia"
  | "calidad_operacional"
  | "mixto"
  | "otro";

type TipoEvento =
  | "condicion_subestandar"
  | "acto_inseguro"
  | "incidente"
  | "casi_accidente"
  | "aspecto_ambiental"
  | "impacto_ambiental"
  | "desviacion_legal_documental"
  | "riesgo_operacional";
```

## 4. Input esperado

```ts
interface EvaluarHallazgoV2Input {
  tipoHallazgo?: string;
  descripcion: string;
  area?: string;
  actividad?: string;
  empresa?: string;
  obra?: string;
  dimensionPrincipal?: AmbitoHallazgo | "no_definida";

  respuestas: Record<string, unknown>;

  evidencia?: {
    fotosCantidad?: number;
    tieneGps?: boolean;
    comentarioEvidencia?: string;
  };

  datosSeguridad?: {
    hayPersonasExpuestas?: boolean;
    tipoExposicion?: "sin_exposicion" | "potencial" | "directa";
    consecuenciaProbable?: "leve" | "moderada" | "grave" | "fatal";
    probabilidad?: "baja" | "media" | "alta";
    energiaPeligrosa?: boolean;
    trabajoAltura?: boolean;
    maquinariaSinResguardo?: boolean;
    cargaSuspendida?: boolean;
    viaEvacuacionBloqueada?: boolean;
    requiereSuspension?: boolean;
    controlesSuficientes?: boolean;
  };

  datosSaludOcupacional?: {
    agente?: "ruido" | "polvo" | "quimico" | "calor" | "frio" | "radiacion" | "biologico" | "otro";
    exposicion?: "sin_exposicion" | "ocasional" | "frecuente" | "permanente";
    controlesHigienicos?: "suficientes" | "parciales" | "inexistentes";
    medicionDisponible?: boolean;
    sintomasOExposicionSevera?: boolean;
  };

  datosAmbientales?: {
    aspectoAmbiental?: boolean;
    impactoAmbientalReal?: boolean;
    riesgoImpactoAmbiental?: boolean;
    medioAfectado?: Array<"suelo" | "agua" | "aire" | "flora_fauna" | "comunidad" | "alcantarillado">;
    derrameOFuga?: boolean;
    sustanciaPeligrosa?: boolean;
    residuoPeligroso?: boolean;
    contenido?: boolean;
    requiereContencionAmbiental?: boolean;
    requiereNotificacion?: boolean;
    rcaPermisoCompromiso?: boolean;
  };

  datosLegalesDocumentales?: {
    documentoFaltante?: boolean;
    documentoVencido?: boolean;
    permisoFaltante?: boolean;
    procedimientoFaltante?: boolean;
    astPtsPtpFaltante?: boolean;
    capacitacionFaltante?: boolean;
    faltaHabilitaActividadRiesgosa?: boolean;
    materiaLegalProbable?: Array<"seguridad" | "salud" | "ambiente" | "laboral" | "operacional">;
  };
}
```

## 5. Output esperado

```ts
interface EvaluarHallazgoV2Output {
  ambitoPrincipal: AmbitoHallazgo;
  ambitosSecundarios: AmbitoHallazgo[];
  tipoEvento: TipoEvento;

  criticidadBase: NivelCriticidad;
  criticidadFinal: NivelCriticidad;

  senalesCriticas: string[];
  factoresElevadores: string[];
  factoresLimitantes: string[];
  inconsistencias: string[];

  requiereRevisionManual: boolean;
  medidaInmediata: string;
  plazoSugerido: string;
  requiereSuspension: boolean;
  requiereContencionAmbiental: boolean;

  normativaProbable: NormaProbable[];

  justificacionTecnica: string;
  resumenEjecutivo: string;
}

interface NormaProbable {
  norma: string;
  materia: string;
  articuloEstado: "validado" | "pendiente_validacion" | "no_mostrar_usuario_final";
  textoSeguro: string;
  requiereRevisionLegal: boolean;
}
```

## 6. Arquitectura por modulos

### 6.1 Normalizador de input

Responsabilidad:

- Limpiar textos.
- Convertir respuestas antiguas/nuevas a un formato comun.
- Evitar que palabras sueltas definan criticidad por si solas.
- Marcar datos faltantes relevantes.

Salida:

- `inputNormalizado`
- `datosFaltantes`

### 6.2 Clasificador de ambito

Responsabilidad:

- Determinar `ambitoPrincipal`.
- Determinar `ambitosSecundarios`.
- Usar respuestas explicitas como prioridad sobre palabras clave.

Orden recomendado:

1. Dimension seleccionada por usuario.
2. Respuestas por modulo.
3. Tipo de evento.
4. Texto como apoyo, no como autoridad unica.

### 6.3 Clasificador de tipo de evento

Responsabilidad:

- Clasificar el hallazgo como condicion, acto, incidente, casi accidente, aspecto ambiental, impacto ambiental o desviacion documental.

Regla clave:

- Aspecto ambiental no equivale automaticamente a impacto ambiental.
- Documento faltante no equivale automaticamente a riesgo critico.

### 6.4 Criticidad base

Responsabilidad:

- Asignar `criticidadBase` segun tipo de hallazgo.
- Definir tope inicial.

Ejemplo:

| Tipo | Base | Tope inicial |
| --- | --- | --- |
| Orden y aseo menor | BAJO | MEDIO |
| Objeto inofensivo sin transito | BAJO | MEDIO |
| Via de evacuacion bloqueada | ALTO | CRITICO |
| Energia peligrosa no controlada | CRITICO | CRITICO |
| Derrame menor contenido | MEDIO | MEDIO |
| Derrame no contenido hacia suelo/agua | ALTO | CRITICO |
| Documento faltante administrativo | BAJO | MEDIO |
| Documento faltante en actividad critica | ALTO | CRITICO |

### 6.5 Modulo de exposicion

Responsabilidad:

- Identificar exposicion humana, ambiental, comunitaria y operacional.
- Elevar solo si la exposicion es creible y conectada al evento.

Reglas:

- Sin exposicion directa, un hallazgo menor no debe superar `MEDIO`.
- Exposicion directa a energia peligrosa puede activar senal critica.
- Exposicion ambiental no contenida puede activar senal critica ambiental.

### 6.6 Modulo de consecuencia

Responsabilidad:

- Determinar consecuencia razonablemente probable.
- Evitar que una consecuencia teorica extrema eleve casos menores sin mecanismo real.

Regla:

- Consecuencia grave/fatal necesita mecanismo de dano creible.

### 6.7 Modulo ambiental

Responsabilidad:

- Separar aspecto ambiental, riesgo de impacto e impacto real.
- Determinar contencion.
- Determinar medio afectado.
- Determinar necesidad de contencion/notificacion/escalamiento.

Salida:

- `requiereContencionAmbiental`
- senales ambientales
- normativa ambiental probable

### 6.8 Modulo legal/documental

Responsabilidad:

- Diferenciar falta documental administrativa de falta que habilita actividad riesgosa.
- Asociar norma probable sin citar articulos no validados.
- Marcar revision legal cuando corresponda.

Regla:

- Una falta documental sin actividad riesgosa inmediata tiene tope `MEDIO`.

### 6.9 Detector de senales criticas

Responsabilidad:

- Crear lista `senalesCriticas`.
- `CRITICO` solo puede existir si hay al menos una senal critica real.

Senales fuertes iniciales:

- Trabajo en altura sin proteccion.
- Energia peligrosa no controlada.
- Cable energizado expuesto.
- Maquinaria sin resguardo con exposicion directa.
- Carga suspendida con personas expuestas.
- Via de evacuacion bloqueada de forma efectiva.
- Incendio/explosion/atmosfera peligrosa.
- Derrame no contenido hacia suelo, agua o alcantarillado.
- Sustancia peligrosa liberada con exposicion.
- Residuo peligroso mal gestionado con exposicion o liberacion.
- Incumplimiento grave de permiso/RCA con impacto significativo.
- Documento faltante que habilita actividad critica en ejecucion.

### 6.10 Aplicador de topes

Responsabilidad:

- Aplicar limites por tipo menor.
- Bloquear `CRITICO` por suma sin senal roja.
- Registrar `factoresLimitantes`.

### 6.11 Detector de incoherencias

Responsabilidad:

- Detectar contradicciones entre tipo, descripcion, respuestas y evidencia.

Ejemplos:

- Tipo "orden y aseo menor" con consecuencia fatal marcada.
- Descripcion "maleta abierta sin transito" con "requiere suspension inmediata".
- "Derrame contenido" y "llega a alcantarillado" simultaneamente.
- "Sin exposicion" y "personas directamente expuestas" simultaneamente.

Accion:

- Marcar `requiereRevisionManual = true`.
- Limitar criticidad si no existe senal roja verificable.

### 6.12 Generador de recomendacion

Responsabilidad:

- Definir medida inmediata.
- Definir plazo sugerido.
- Definir suspension/contencion.
- Generar resumen ejecutivo.

## 7. Flujo de decision propuesto

```txt
normalizar input
  -> clasificar ambito principal/secundario
  -> clasificar tipo de evento
  -> asignar criticidad base y tope inicial
  -> evaluar exposicion
  -> evaluar consecuencia razonable
  -> evaluar ambiente
  -> evaluar legal/documental
  -> detectar senales criticas
  -> elevar criticidad por factores reales
  -> aplicar topes y bloqueos
  -> detectar incoherencias
  -> asociar normativa probable
  -> generar recomendacion y resumen ejecutivo
```

Pseudocodigo:

```ts
function evaluarHallazgoV2(input: EvaluarHallazgoV2Input): EvaluarHallazgoV2Output {
  const normalizado = normalizarInput(input);
  const ambitos = clasificarAmbitos(normalizado);
  const tipoEvento = clasificarTipoEvento(normalizado, ambitos);
  const base = calcularCriticidadBase(tipoEvento, normalizado);
  const exposicion = evaluarExposicion(normalizado);
  const consecuencia = evaluarConsecuencia(normalizado, exposicion);
  const ambiente = evaluarModuloAmbiental(normalizado);
  const legal = evaluarModuloLegal(normalizado);
  const senalesCriticas = detectarSenalesCriticas(normalizado, exposicion, ambiente, legal);
  const elevacion = aplicarElevadores(base, exposicion, consecuencia, ambiente, legal, senalesCriticas);
  const limitada = aplicarTopes(elevacion, base, senalesCriticas, normalizado);
  const coherencia = detectarIncoherencias(normalizado, limitada, senalesCriticas);
  const normativa = sugerirNormativaProbable(ambitos, tipoEvento, ambiente, legal);

  return generarResultado({
    normalizado,
    ambitos,
    tipoEvento,
    base,
    criticidadFinal: coherencia.criticidadFinal,
    senalesCriticas,
    factoresElevadores: elevacion.factores,
    factoresLimitantes: limitada.factores,
    inconsistencias: coherencia.inconsistencias,
    normativa,
  });
}
```

## 8. Reglas no negociables

- `CRITICO` requiere senal roja real.
- La descripcion libre no puede elevar a `CRITICO` por si sola.
- Una suma de respuestas no puede saltarse los topes.
- Todo hallazgo menor sin exposicion directa queda limitado.
- Todo documento faltante sin actividad riesgosa inmediata queda limitado.
- Todo articulo legal no validado queda oculto o marcado como pendiente.
- Toda incoherencia relevante marca revision manual.

## 9. Compatibilidad con app actual

MOTOR-3 debe mantener:

- Motor antiguo como fallback temporal.
- Campos actuales de reporte.
- Textos empresa/obra/siglas.
- Evidencias.
- GPS.
- Offline.
- Sincronizacion posterior.
- Panel/informes/alarma sin cambios obligatorios en esta fase.

## 10. Plan MOTOR-3

### MOTOR-3A

- Crear helper `evaluacionMotorV2.ts`.
- Mantener motor antiguo como fallback.
- No romper flujo actual.
- Agregar tests unitarios con casos MOTOR-2.

### MOTOR-3B

- Reemplazar calculo de criticidad en `/evaluar-v2`.
- Mantener compatibilidad con preguntas antiguas si hay reportes locales pendientes.

### MOTOR-3C

- Adaptar resultado automatico e informe final.
- Mostrar justificacion tecnica, factores elevadores y factores limitantes.

### MOTOR-3D

- Integrar matriz legal operativa.
- No mostrar articulos no validados al usuario final.

### MOTOR-3E

- Probar con casos definidos en `casos-prueba-motor-v2.md`.
- Validar que casos menores no lleguen a `CRITICO`.

### MOTOR-3F

- Activar en app.
- Validar con reportes reales de prueba online/offline.
- Comparar salida V1 vs V2 antes de dejar V2 como motor principal.

## 11. Riesgos pendientes

- RLS y permisos no forman parte del motor, pero afectan que datos ve cada usuario.
- Matriz legal requiere validacion juridica antes de citar articulos.
- Si el usuario responde mal intencionalmente, el motor debe marcar incoherencia, no asumir verdad absoluta.
- La evidencia fotografica aun no se analiza semanticamente, por lo que no debe definir criticidad automatica.

