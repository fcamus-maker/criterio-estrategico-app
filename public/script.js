/* ===== VALIDACION PUBLICA CERTIFICADOS CE ===== */

const validationResult = document.querySelector("[data-validation-result]");

const certificadosPublicosCE = {
  "CEA-LYNX-2026-001": {
    codigo: "CEA-LYNX-2026-001",
    empresa: "Sociedad de Servicios Lynx Plagas Ltda.",
    rut: "76.781.605-7",
    servicio: "Plan CE Activo",
    fecha_activacion: "01 de junio de 2026",
    estado: "vigente",
    ultima_vigencia_registrada: "Servicio vigente",
    fecha_ultima_actualizacion: "01 de junio de 2026",
  },
};

if (validationResult) {
  const params = new URLSearchParams(window.location.search);
  const codigo = (params.get("codigo") || "").trim().toUpperCase();
  const certificado = certificadosPublicosCE[codigo];
  const statusDot = document.querySelector("[data-validation-status-dot]");
  const statusLabel = document.querySelector("[data-validation-status-label]");
  const codeElement = document.querySelector("[data-validation-code]");
  const details = document.querySelector("[data-validation-details]");
  const message = document.querySelector("[data-validation-message]");

  if (codeElement) {
    codeElement.textContent = codigo || "Sin código informado";
  }

  if (certificado && details) {
    const vigente = certificado.estado === "vigente";

    details.hidden = false;

    document.querySelectorAll("[data-cert-field]").forEach((field) => {
      const key = field.dataset.certField;
      const value = certificado[key] || "";

      field.textContent = key === "estado" ? (vigente ? "Vigente" : "No vigente") : value;

      if (key === "estado") {
        field.classList.toggle("is-valid", vigente);
        field.classList.toggle("is-invalid", !vigente);
      }
    });

    if (statusDot) {
      statusDot.classList.toggle("is-valid", vigente);
      statusDot.classList.toggle("is-invalid", !vigente);
    }

    if (statusLabel) {
      statusLabel.textContent = vigente ? "Certificado vigente" : "Certificado no vigente";
    }

    if (message) {
      message.classList.toggle("is-valid", vigente);
      message.classList.toggle("is-invalid", !vigente);
      message.textContent = vigente
        ? "Este certificado se encuentra vigente y asociado a un servicio activo con Criterio Estratégico."
        : `Este certificado registra una activación anterior del servicio. Actualmente el servicio no se encuentra vigente. Última vigencia registrada: ${certificado.ultima_vigencia_registrada}.`;
    }
  } else {
    if (statusDot) {
      statusDot.classList.add("is-invalid");
    }

    if (statusLabel) {
      statusLabel.textContent = "Código no encontrado";
    }

    if (message) {
      message.classList.add("is-invalid");
      message.textContent = "Código no encontrado o no vigente en los registros públicos de validación CE.";
    }
  }
}
