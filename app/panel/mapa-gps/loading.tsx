export default function MapaGpsLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "clamp(16px, 1.45vw, 30px)",
        background:
          "radial-gradient(circle at 18% 10%, rgba(59,130,246,0.24), transparent 30%), radial-gradient(circle at 78% 0%, rgba(239,68,68,0.18), transparent 26%), linear-gradient(135deg, #07111f 0%, #0f1e36 45%, #172554 100%)",
        color: "#f8fafc",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <section
        style={{
          minHeight: "calc(100vh - 60px)",
          borderRadius: "28px",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.74)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: "28px",
        }}
      >
        <div style={{ display: "grid", gap: "10px" }}>
          <div style={{ color: "#7dd3fc", fontSize: "12px", fontWeight: 950, letterSpacing: "0.9px", textTransform: "uppercase" }}>
            Mapa GPS
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.05 }}>
            Preparando vista territorial
          </h1>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", fontWeight: 700 }}>
            Cargando controles, puntos y filtros del mapa.
          </p>
        </div>
      </section>
    </main>
  );
}
