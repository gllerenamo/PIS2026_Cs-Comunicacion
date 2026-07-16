import { http } from "./apiClient";
import type {
  Anuncio,
  Contacto,
  ForoHilo,
  ForoMensaje,
  MensajeDirecto,
} from "../types";

/** Anuncios (HU-36), foros (HU-37) y mensajería directa (HU-38) del aula. */
export const comunicacionService = {
  /* ── Anuncios ────────────────────────────────────────────────────────── */

  async listAnuncios(aulaId: string): Promise<Anuncio[]> {
    return http<Anuncio[]>(`/api/v1/aulas/${aulaId}/anuncios`);
  },

  async crearAnuncio(
    aulaId: string,
    titulo: string,
    mensaje: string,
    fijado: boolean,
  ): Promise<Anuncio> {
    return http<Anuncio>(`/api/v1/aulas/${aulaId}/anuncios`, {
      method: "POST",
      body: { titulo, mensaje, fijado },
    });
  },

  async eliminarAnuncio(aulaId: string, anuncioId: string): Promise<void> {
    return http<void>(`/api/v1/aulas/${aulaId}/anuncios/${anuncioId}`, {
      method: "DELETE",
    });
  },

  /* ── Foros ───────────────────────────────────────────────────────────── */

  async listHilos(aulaId: string): Promise<ForoHilo[]> {
    return http<ForoHilo[]>(`/api/v1/aulas/${aulaId}/foros`);
  },

  async crearHilo(aulaId: string, titulo: string): Promise<ForoHilo> {
    return http<ForoHilo>(`/api/v1/aulas/${aulaId}/foros`, {
      method: "POST",
      body: { titulo },
    });
  },

  async listMensajesHilo(hiloId: string): Promise<ForoMensaje[]> {
    return http<ForoMensaje[]>(`/api/v1/foros/${hiloId}/mensajes`);
  },

  async responderHilo(hiloId: string, texto: string): Promise<ForoMensaje> {
    return http<ForoMensaje>(`/api/v1/foros/${hiloId}/mensajes`, {
      method: "POST",
      body: { texto },
    });
  },

  /* ── Mensajería directa ──────────────────────────────────────────────── */

  async listContactos(aulaId: string): Promise<Contacto[]> {
    return http<Contacto[]>(`/api/v1/aulas/${aulaId}/contactos`);
  },

  async getConversacion(aulaId: string, otroId: string): Promise<MensajeDirecto[]> {
    return http<MensajeDirecto[]>(`/api/v1/aulas/${aulaId}/mensajes/${otroId}`);
  },

  async enviarMensaje(
    aulaId: string,
    otroId: string,
    texto: string,
  ): Promise<MensajeDirecto> {
    return http<MensajeDirecto>(`/api/v1/aulas/${aulaId}/mensajes/${otroId}`, {
      method: "POST",
      body: { texto },
    });
  },
};
