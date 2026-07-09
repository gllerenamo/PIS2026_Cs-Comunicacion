import { BASE_URL } from "./apiClient";
import type { Archivo } from "../types";

const TOKEN_KEY = "ssp.token";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const archivoService = {
  /** GET /api/v1/aulas/{id}/archivos — lista archivos del aula. */
  async list(aulaId: string): Promise<Archivo[]> {
    const res = await fetch(`${BASE_URL}/api/v1/aulas/${aulaId}/archivos`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("No se pudieron cargar los archivos.");
    return res.json() as Promise<Archivo[]>;
  },

  /** POST /api/v1/aulas/{id}/archivos — sube un archivo (multipart). */
  async upload(aulaId: string, file: File): Promise<Archivo> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/api/v1/aulas/${aulaId}/archivos`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) {
      let msg = "Error al subir el archivo.";
      try {
        const d = (await res.json()) as { detail?: string };
        if (d.detail) msg = d.detail;
      } catch {
        /* sin cuerpo JSON */
      }
      throw new Error(msg);
    }
    return res.json() as Promise<Archivo>;
  },

  /** GET .../descargar — descarga el archivo y dispara el guardado en el navegador. */
  async download(aulaId: string, archivoId: string, nombreOriginal: string): Promise<void> {
    const res = await fetch(
      `${BASE_URL}/api/v1/aulas/${aulaId}/archivos/${archivoId}/descargar`,
      { headers: authHeaders() }
    );
    if (!res.ok) throw new Error("Error al descargar el archivo.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
