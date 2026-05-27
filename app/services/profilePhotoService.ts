import { obtenerSupabaseCliente } from "@/lib/supabaseClient";
import { obtenerAuthProfileActual } from "./authProfileService";

const BUCKET_FOTOS_PERFIL = "perfiles-usuarios";
const FOTO_PERFIL_MAX_PX = 512;
const FOTO_PERFIL_QUALITY = 0.72;
const FOTO_PERFIL_OBJETIVO_BYTES = 300 * 1024;

export type FotoPerfilComprimida = {
  dataUrl: string;
  blob: Blob;
  nombre: string;
  tipo: "image/jpeg";
  tamanoBytes: number;
};

export type AjusteFotoPerfil = {
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
};

export type ResultadoFotoPerfil =
  | { ok: true; fotoUrl: string; storagePath?: string; origen?: "storage" | "profile_inline" }
  | { ok: false; error: string };

function sanitizarError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 220);
  return String(error || "Error desconocido").slice(0, 220);
}

function nombreBase(nombreOriginal: string | undefined) {
  return String(nombreOriginal || "perfil")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
}

function dataUrlABlob(dataUrl: string) {
  return fetch(dataUrl).then((respuesta) => respuesta.blob());
}

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor));
}

async function exportarAvatarJPEG(
  canvas: HTMLCanvasElement,
  calidad: number
) {
  const dataUrl = canvas.toDataURL("image/jpeg", calidad);
  const blob = await dataUrlABlob(dataUrl);
  return { dataUrl, blob };
}

function errorBucketNoEncontrado(error: unknown) {
  const mensaje = sanitizarError(error).toLowerCase();
  return mensaje.includes("bucket not found") || mensaje.includes("bucket not_found");
}

async function actualizarFotoUrlPerfilActual(
  cliente: NonNullable<Awaited<ReturnType<typeof obtenerSupabaseCliente>>>,
  userId: string,
  fotoUrl: string | null
) {
  return cliente
    .from("profiles")
    .update({ foto_url: fotoUrl })
    .eq("id", userId);
}

export function comprimirFotoPerfilUsuario(
  file: File,
  ajuste: AjusteFotoPerfil = {}
): Promise<FotoPerfilComprimida> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo seleccionado no es una imagen."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("No se pudo leer la fotografia de perfil."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () =>
        reject(new Error("No se pudo procesar la fotografia de perfil."));

      image.onload = async () => {
        try {
          const zoom = limitar(Number(ajuste.zoom || 1), 1, 2.5);
          const ladoBase = Math.min(image.width, image.height);
          const ladoFuente = Math.max(1, ladoBase / zoom);
          const ladoDestino = Math.max(1, Math.min(FOTO_PERFIL_MAX_PX, ladoFuente));
          const maxOrigenX = Math.max(0, image.width - ladoFuente);
          const maxOrigenY = Math.max(0, image.height - ladoFuente);
          const centroX = maxOrigenX / 2;
          const centroY = maxOrigenY / 2;
          const origenX = limitar(
            centroX + (maxOrigenX / 2) * limitar(Number(ajuste.offsetX || 0), -1, 1),
            0,
            maxOrigenX
          );
          const origenY = limitar(
            centroY + (maxOrigenY / 2) * limitar(Number(ajuste.offsetY || 0), -1, 1),
            0,
            maxOrigenY
          );
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("No se pudo preparar la compresion de perfil."));
            return;
          }

          canvas.width = ladoDestino;
          canvas.height = ladoDestino;
          context.drawImage(
            image,
            origenX,
            origenY,
            ladoFuente,
            ladoFuente,
            0,
            0,
            ladoDestino,
            ladoDestino
          );

          let calidad = FOTO_PERFIL_QUALITY;
          let avatar = await exportarAvatarJPEG(canvas, calidad);

          while (avatar.blob.size > FOTO_PERFIL_OBJETIVO_BYTES && calidad > 0.6) {
            calidad = Math.max(0.6, calidad - 0.04);
            avatar = await exportarAvatarJPEG(canvas, calidad);
          }

          resolve({
            dataUrl: avatar.dataUrl,
            blob: avatar.blob,
            nombre: `${nombreBase(file.name) || "perfil"}.jpg`,
            tipo: "image/jpeg",
            tamanoBytes: avatar.blob.size,
          });
        } catch (error) {
          reject(error);
        }
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });
}

export async function subirFotoPerfilUsuarioActual(
  foto: FotoPerfilComprimida
): Promise<ResultadoFotoPerfil> {
  const auth = await obtenerAuthProfileActual();
  const cliente = await obtenerSupabaseCliente();

  if (!cliente) {
    return { ok: false, error: "Supabase no esta disponible para guardar perfil." };
  }

  if (!auth.autenticado || !auth.usuario || !auth.perfil) {
    return {
      ok: false,
      error: auth.error || "Debes iniciar sesion para guardar la foto de perfil.",
    };
  }

  const extension = foto.tipo === "image/jpeg" ? "jpg" : "jpg";
  const storagePath = `usuarios/${auth.usuario.id}/perfil-${Date.now()}.${extension}`;

  try {
    const { error: uploadError } = await cliente.storage
      .from(BUCKET_FOTOS_PERFIL)
      .upload(storagePath, foto.blob, {
        contentType: foto.tipo,
        upsert: false,
      });

    if (uploadError) {
      if (errorBucketNoEncontrado(uploadError)) {
        const { error: inlineUpdateError } = await actualizarFotoUrlPerfilActual(
          cliente,
          auth.usuario.id,
          foto.dataUrl
        );

        if (inlineUpdateError) {
          return {
            ok: false,
            error: `No existe el bucket ${BUCKET_FOTOS_PERFIL} y tampoco se pudo asociar la foto al perfil: ${sanitizarError(inlineUpdateError)}`,
          };
        }

        return {
          ok: true,
          fotoUrl: foto.dataUrl,
          origen: "profile_inline",
        };
      }

      return {
        ok: false,
        error: `No se pudo subir la foto de perfil: ${sanitizarError(uploadError)}`,
      };
    }

    const { data } = cliente.storage
      .from(BUCKET_FOTOS_PERFIL)
      .getPublicUrl(storagePath);
    const fotoUrl = data.publicUrl;

    if (!fotoUrl) {
      return {
        ok: false,
        error: "La foto subio, pero no se obtuvo una URL recuperable.",
      };
    }

    const { error: updateError } = await actualizarFotoUrlPerfilActual(
      cliente,
      auth.usuario.id,
      fotoUrl
    );

    if (updateError) {
      return {
        ok: false,
        error: `La foto subio, pero no se pudo asociar al perfil: ${sanitizarError(updateError)}`,
      };
    }

    return { ok: true, fotoUrl, storagePath, origen: "storage" };
  } catch (error) {
    return {
      ok: false,
      error: `No se pudo guardar la foto de perfil: ${sanitizarError(error)}`,
    };
  }
}

export async function quitarFotoPerfilUsuarioActual(): Promise<ResultadoFotoPerfil> {
  const auth = await obtenerAuthProfileActual();
  const cliente = await obtenerSupabaseCliente();

  if (!cliente) {
    return { ok: false, error: "Supabase no esta disponible para guardar perfil." };
  }

  if (!auth.autenticado || !auth.usuario) {
    return {
      ok: false,
      error: auth.error || "Debes iniciar sesion para quitar la foto de perfil.",
    };
  }

  try {
    const { error } = await actualizarFotoUrlPerfilActual(
      cliente,
      auth.usuario.id,
      null
    );

    if (error) {
      return {
        ok: false,
        error: `No se pudo quitar la foto del perfil: ${sanitizarError(error)}`,
      };
    }

    return { ok: true, fotoUrl: "" };
  } catch (error) {
    return {
      ok: false,
      error: `No se pudo quitar la foto del perfil: ${sanitizarError(error)}`,
    };
  }
}
