"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CeldaMapaCalorHallazgo,
  PuntoMapaGpsHallazgo,
} from "../../analytics/mapaGpsHallazgos";

type ModoMapaGoogle = "puntos" | "calor" | "zonas";
type TipoVistaMapaGoogle = "estandar" | "satelital";

type MapaGpsGoogleProps = {
  apiKey: string;
  puntos: PuntoMapaGpsHallazgo[];
  zonas: CeldaMapaCalorHallazgo[];
  modo: ModoMapaGoogle;
  tipoVista: TipoVistaMapaGoogle;
  zoomControlado: number;
  pantallaCompleta: boolean;
  temaClaro: boolean;
  onSeleccionarPunto: (punto: PuntoMapaGpsHallazgo) => void;
  onSeleccionarZona: (zona: CeldaMapaCalorHallazgo) => void;
};

type GoogleListener = { remove?: () => void };
type GoogleMarker = { setMap: (map: GoogleMap | null) => void; addListener: (event: string, callback: () => void) => GoogleListener };
type GoogleCircle = { setMap: (map: GoogleMap | null) => void; addListener: (event: string, callback: () => void) => GoogleListener };
type GoogleBounds = { extend: (position: { lat: number; lng: number }) => void };
type GoogleMap = {
  setMapTypeId: (type: string) => void;
  setCenter: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: GoogleBounds, padding?: number) => void;
};
type GoogleMapsApi = {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => GoogleMap;
  Marker: new (options: Record<string, unknown>) => GoogleMarker;
  Circle: new (options: Record<string, unknown>) => GoogleCircle;
  LatLngBounds: new () => GoogleBounds;
  SymbolPath: { CIRCLE: unknown };
  event: { trigger: (instance: GoogleMap, event: string) => void };
};

declare global {
  interface Window {
    google?: { maps?: GoogleMapsApi };
    __ceGoogleMapsReady?: () => void;
  }
}

const SCRIPT_ID = "ce-google-maps-js-api";
const CENTRO_CHILE = { lat: -30.5595, lng: -71.1791 };

function colorCriticidad(criticidad: PuntoMapaGpsHallazgo["criticidad"]) {
  if (criticidad === "CRITICO") return "#dc2626";
  if (criticidad === "ALTO") return "#ea580c";
  if (criticidad === "MEDIO") return "#ca8a04";
  return "#16a34a";
}

function escalaMarcador(criticidad: PuntoMapaGpsHallazgo["criticidad"]) {
  if (criticidad === "CRITICO") return 11;
  if (criticidad === "ALTO") return 10;
  if (criticidad === "MEDIO") return 9;
  return 8;
}

function cargarGoogleMaps(apiKey: string) {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);

  return new Promise<GoogleMapsApi>((resolve, reject) => {
    const listo = () => {
      const maps = window.google?.maps;
      if (maps?.Map) resolve(maps);
      else reject(new Error("Google Maps no se inicializó correctamente."));
    };
    const existente = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existente) {
      existente.addEventListener("load", listo, { once: true });
      existente.addEventListener("error", () => reject(new Error("No se pudo cargar Google Maps.")), { once: true });
      return;
    }

    window.__ceGoogleMapsReady = listo;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&language=es&region=CL&callback=__ceGoogleMapsReady`;
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
    document.head.appendChild(script);
  });
}

export default function MapaGpsGoogle({
  apiKey,
  puntos,
  zonas,
  modo,
  tipoVista,
  zoomControlado,
  pantallaCompleta,
  temaClaro,
  onSeleccionarPunto,
  onSeleccionarZona,
}: MapaGpsGoogleProps) {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const mapaRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const circulosRef = useRef<GoogleCircle[]>([]);
  const apiRef = useRef<GoogleMapsApi | null>(null);
  const zoomAnteriorRef = useRef(zoomControlado);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");

  useEffect(() => {
    let activo = true;
    void cargarGoogleMaps(apiKey)
      .then((maps) => {
        if (!activo || !contenedorRef.current) return;
        apiRef.current = maps;
        mapaRef.current = new maps.Map(contenedorRef.current, {
          center: CENTRO_CHILE,
          zoom: 5,
          mapTypeId: "hybrid",
          mapTypeControl: true,
          mapTypeControlOptions: { style: 1 },
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
          clickableIcons: false,
        });
        setEstado("listo");
      })
      .catch(() => {
        if (activo) setEstado("error");
      });

    return () => {
      activo = false;
      markersRef.current.forEach((marker) => marker.setMap(null));
      circulosRef.current.forEach((circulo) => circulo.setMap(null));
      markersRef.current = [];
      circulosRef.current = [];
      mapaRef.current = null;
    };
  }, [apiKey]);

  useEffect(() => {
    const maps = apiRef.current;
    const mapa = mapaRef.current;
    if (!maps || !mapa || estado !== "listo") return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    circulosRef.current.forEach((circulo) => circulo.setMap(null));
    markersRef.current = [];
    circulosRef.current = [];
    mapa.setMapTypeId(tipoVista === "satelital" ? "hybrid" : "roadmap");

    if (modo !== "puntos") {
      zonas.forEach((zona) => {
        const color = colorCriticidad(zona.criticidadMaxima);
        const circulo = new maps.Circle({
          map: mapa,
          center: { lat: zona.latitudPromedio, lng: zona.longitudPromedio },
          radius: Math.min(380, 58 + zona.total * 46 + zona.criticosAltos * 26),
          fillColor: color,
          fillOpacity: modo === "calor" ? 0.25 : 0.16,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: modo === "calor" ? 2.5 : 2,
          clickable: true,
        });
        circulo.addListener("click", () => onSeleccionarZona(zona));
        circulosRef.current.push(circulo);
      });
    }

    const limites = new maps.LatLngBounds();
    puntos.forEach((punto) => {
      const posicion = { lat: punto.latitud, lng: punto.longitud };
      limites.extend(posicion);
      const marker = new maps.Marker({
        map: mapa,
        position: posicion,
        title: `${punto.codigo} · ${punto.criticidad}`,
        zIndex: punto.criticidad === "CRITICO" ? 4 : punto.criticidad === "ALTO" ? 3 : 2,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: colorCriticidad(punto.criticidad),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeOpacity: 1,
          strokeWeight: 3,
          scale: escalaMarcador(punto.criticidad),
        },
      });
      marker.addListener("click", () => onSeleccionarPunto(punto));
      markersRef.current.push(marker);
    });

    if (puntos.length === 1) {
      mapa.setCenter({ lat: puntos[0].latitud, lng: puntos[0].longitud });
      mapa.setZoom(18);
    } else if (puntos.length > 1) {
      mapa.fitBounds(limites, 72);
    } else {
      mapa.setCenter(CENTRO_CHILE);
      mapa.setZoom(5);
    }
  }, [estado, puntos, zonas, modo, tipoVista, onSeleccionarPunto, onSeleccionarZona]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || estado !== "listo") return;
    const diferencia = zoomControlado - zoomAnteriorRef.current;
    zoomAnteriorRef.current = zoomControlado;
    if (!diferencia) return;
    mapa.setZoom(Math.max(4, Math.min(20, 15 + diferencia * 2)));
  }, [zoomControlado, estado]);

  useEffect(() => {
    const mapa = mapaRef.current;
    const maps = apiRef.current;
    if (!mapa || !maps || estado !== "listo") return;
    const frame = requestAnimationFrame(() => maps.event.trigger(mapa, "resize"));
    const timer = window.setTimeout(() => maps.event.trigger(mapa, "resize"), 180);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pantallaCompleta, estado]);

  return (
    <>
      <div ref={contenedorRef} aria-label="Mapa satelital con coordenadas GPS reales" style={{ position: "absolute", inset: 0 }} />
      {estado !== "listo" && (
        <div role="status" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: "24px", textAlign: "center", color: temaClaro ? "#1e3a8a" : "#dbeafe", background: temaClaro ? "rgba(255,255,255,0.86)" : "rgba(2,6,23,0.72)", fontSize: "13px", fontWeight: 850 }}>
          {estado === "cargando" ? "Cargando cartografía satelital…" : "Google Maps no pudo iniciar. Revise la clave, la API habilitada y la restricción del dominio."}
        </div>
      )}
    </>
  );
}
