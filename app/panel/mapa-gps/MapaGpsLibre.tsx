"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
  CeldaMapaCalorHallazgo,
  PuntoMapaGpsHallazgo,
} from "../../analytics/mapaGpsHallazgos";

type ModoMapaLibre = "puntos" | "calor" | "zonas";
type TipoVistaMapaLibre = "estandar" | "contraste";

type MapaGpsLibreProps = {
  puntos: PuntoMapaGpsHallazgo[];
  zonas: CeldaMapaCalorHallazgo[];
  modo: ModoMapaLibre;
  tipoVista: TipoVistaMapaLibre;
  zoomControlado: number;
  pantallaCompleta: boolean;
  temaClaro: boolean;
  onSeleccionarPunto: (punto: PuntoMapaGpsHallazgo) => void;
  onSeleccionarZona: (zona: CeldaMapaCalorHallazgo) => void;
};

const MAPA_ESTANDAR = "https://tiles.openfreemap.org/styles/liberty";
const MAPA_CONTRASTE = "https://tiles.openfreemap.org/styles/dark";
const CENTRO_CHILE: [number, number] = [-71.25, -29.95];

function colorCriticidad(criticidad: PuntoMapaGpsHallazgo["criticidad"]) {
  if (criticidad === "CRITICO") return "#ef4444";
  if (criticidad === "ALTO") return "#f97316";
  if (criticidad === "MEDIO") return "#facc15";
  return "#22c55e";
}

function pesoCriticidad(criticidad: PuntoMapaGpsHallazgo["criticidad"]) {
  if (criticidad === "CRITICO") return 1;
  if (criticidad === "ALTO") return 0.8;
  if (criticidad === "MEDIO") return 0.55;
  return 0.35;
}

function coleccionPuntos(puntos: PuntoMapaGpsHallazgo[]) {
  return {
    type: "FeatureCollection" as const,
    features: puntos.map((punto) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [punto.longitud, punto.latitud],
      },
      properties: {
        codigo: punto.codigo,
        color: colorCriticidad(punto.criticidad),
        peso: pesoCriticidad(punto.criticidad),
        criticidad: punto.criticidad,
      },
    })),
  };
}

function coleccionZonas(zonas: CeldaMapaCalorHallazgo[]) {
  return {
    type: "FeatureCollection" as const,
    features: zonas.map((zona) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [zona.longitudPromedio, zona.latitudPromedio],
      },
      properties: {
        clave: zona.clave,
        color: colorCriticidad(zona.criticidadMaxima),
        total: zona.total,
      },
    })),
  };
}

function asegurarCapas(
  mapa: maplibregl.Map,
  puntos: PuntoMapaGpsHallazgo[],
  zonas: CeldaMapaCalorHallazgo[],
  modo: ModoMapaLibre
) {
  const datosPuntos = coleccionPuntos(puntos);
  const datosZonas = coleccionZonas(zonas);
  const fuentePuntos = mapa.getSource("ce-hallazgos") as
    | maplibregl.GeoJSONSource
    | undefined;
  const fuenteZonas = mapa.getSource("ce-zonas") as
    | maplibregl.GeoJSONSource
    | undefined;

  if (fuentePuntos) {
    fuentePuntos.setData(datosPuntos);
  } else {
    mapa.addSource("ce-hallazgos", {
      type: "geojson",
      data: datosPuntos,
    });
  }

  if (fuenteZonas) {
    fuenteZonas.setData(datosZonas);
  } else {
    mapa.addSource("ce-zonas", {
      type: "geojson",
      data: datosZonas,
    });
  }

  if (!mapa.getLayer("ce-calor")) {
    mapa.addLayer({
      id: "ce-calor",
      type: "heatmap",
      source: "ce-hallazgos",
      maxzoom: 18,
      paint: {
        "heatmap-weight": ["get", "peso"],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 3, 0.9, 15, 2.4],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 3, 18, 15, 52],
        "heatmap-opacity": 0.78,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(56,189,248,0)",
          0.22,
          "rgba(56,189,248,0.55)",
          0.48,
          "rgba(250,204,21,0.66)",
          0.72,
          "rgba(249,115,22,0.78)",
          1,
          "rgba(239,68,68,0.94)",
        ],
      },
    });
  }

  if (!mapa.getLayer("ce-zonas-circulos")) {
    mapa.addLayer({
      id: "ce-zonas-circulos",
      type: "circle",
      source: "ce-zonas",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["get", "total"], 1, 24, 10, 62],
        "circle-color": ["get", "color"],
        "circle-opacity": 0.28,
        "circle-stroke-color": ["get", "color"],
        "circle-stroke-opacity": 0.82,
        "circle-stroke-width": 2,
        "circle-blur": 0.35,
      },
    });
  }

  if (!mapa.getLayer("ce-puntos")) {
    mapa.addLayer({
      id: "ce-puntos",
      type: "circle",
      source: "ce-hallazgos",
      paint: {
        "circle-radius": [
          "match",
          ["get", "criticidad"],
          "CRITICO",
          9,
          "ALTO",
          8,
          7,
        ],
        "circle-color": ["get", "color"],
        "circle-opacity": 0.96,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });
  }

  mapa.setLayoutProperty(
    "ce-calor",
    "visibility",
    modo === "calor" ? "visible" : "none"
  );
  mapa.setLayoutProperty(
    "ce-zonas-circulos",
    "visibility",
    modo === "zonas" ? "visible" : "none"
  );
  mapa.setLayoutProperty("ce-puntos", "visibility", "visible");
}

function encuadrarPuntos(mapa: maplibregl.Map, puntos: PuntoMapaGpsHallazgo[]) {
  if (puntos.length === 0) {
    mapa.easeTo({ center: CENTRO_CHILE, zoom: 4.2, duration: 450 });
    return;
  }

  if (puntos.length === 1) {
    mapa.easeTo({
      center: [puntos[0].longitud, puntos[0].latitud],
      zoom: 15,
      duration: 550,
    });
    return;
  }

  const limites = new maplibregl.LngLatBounds();
  puntos.forEach((punto) => limites.extend([punto.longitud, punto.latitud]));
  mapa.fitBounds(limites, {
    padding: 72,
    maxZoom: 16,
    duration: 600,
  });
}

export default function MapaGpsLibre({
  puntos,
  zonas,
  modo,
  tipoVista,
  zoomControlado,
  pantallaCompleta,
  temaClaro,
  onSeleccionarPunto,
  onSeleccionarZona,
}: MapaGpsLibreProps) {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const mapaRef = useRef<maplibregl.Map | null>(null);
  const puntosRef = useRef(puntos);
  const zonasRef = useRef(zonas);
  const modoRef = useRef(modo);
  const onPuntoRef = useRef(onSeleccionarPunto);
  const onZonaRef = useRef(onSeleccionarZona);
  const zoomAnteriorRef = useRef(zoomControlado);
  const [errorMapa, setErrorMapa] = useState("");

  useEffect(() => {
    puntosRef.current = puntos;
    zonasRef.current = zonas;
    modoRef.current = modo;
    onPuntoRef.current = onSeleccionarPunto;
    onZonaRef.current = onSeleccionarZona;
  }, [puntos, zonas, modo, onSeleccionarPunto, onSeleccionarZona]);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const mapa = new maplibregl.Map({
      container: contenedor,
      style: tipoVista === "contraste" ? MAPA_CONTRASTE : MAPA_ESTANDAR,
      center: CENTRO_CHILE,
      zoom: 4.2,
      minZoom: 2,
      maxZoom: 19,
      attributionControl: { compact: true },
      cooperativeGestures: false,
    });
    mapaRef.current = mapa;
    mapa.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    mapa.on("load", () => {
      setErrorMapa("");
      asegurarCapas(
        mapa,
        puntosRef.current,
        zonasRef.current,
        modoRef.current
      );
      encuadrarPuntos(mapa, puntosRef.current);

      mapa.on("click", "ce-puntos", (evento) => {
        const codigo = evento.features?.[0]?.properties?.codigo;
        const punto = puntosRef.current.find((item) => item.codigo === codigo);
        if (punto) onPuntoRef.current(punto);
      });
      mapa.on("click", "ce-zonas-circulos", (evento) => {
        const clave = evento.features?.[0]?.properties?.clave;
        const zona = zonasRef.current.find((item) => item.clave === clave);
        if (zona) onZonaRef.current(zona);
      });
      ["ce-puntos", "ce-zonas-circulos"].forEach((capa) => {
        mapa.on("mouseenter", capa, () => {
          mapa.getCanvas().style.cursor = "pointer";
        });
        mapa.on("mouseleave", capa, () => {
          mapa.getCanvas().style.cursor = "";
        });
      });
    });
    mapa.on("error", (evento) => {
      console.warn("No se pudo cargar el mapa base libre.", evento.error);
      if (!mapa.isStyleLoaded()) {
        setErrorMapa("No se pudo cargar temporalmente el mapa base.");
      }
    });

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, [tipoVista]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa?.isStyleLoaded()) return;
    asegurarCapas(mapa, puntos, zonas, modo);
    encuadrarPuntos(mapa, puntos);
  }, [puntos, zonas, modo]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const diferencia = zoomControlado - zoomAnteriorRef.current;
    zoomAnteriorRef.current = zoomControlado;
    if (Math.abs(diferencia) < 0.01) return;
    mapa.easeTo({ zoom: mapa.getZoom() + diferencia * 4, duration: 240 });
  }, [zoomControlado]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const frame = window.requestAnimationFrame(() => mapa.resize());
    const timer = window.setTimeout(() => mapa.resize(), 180);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pantallaCompleta]);

  return (
    <>
      <div
        ref={contenedorRef}
        aria-label="Mapa interactivo con coordenadas reales de hallazgos"
        style={{ position: "absolute", inset: 0 }}
      />
      {errorMapa && (
        <div
          role="status"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            zIndex: 8,
            transform: "translate(-50%, -50%)",
            maxWidth: "360px",
            borderRadius: "18px",
            padding: "14px 16px",
            textAlign: "center",
            color: temaClaro ? "#991b1b" : "#fecaca",
            background: temaClaro
              ? "rgba(255,255,255,0.94)"
              : "rgba(15,23,42,0.92)",
            border: "1px solid rgba(248,113,113,0.42)",
            boxShadow: "0 18px 48px rgba(15,23,42,0.28)",
            fontSize: "13px",
            fontWeight: 850,
          }}
        >
          {errorMapa}
        </div>
      )}
    </>
  );
}
