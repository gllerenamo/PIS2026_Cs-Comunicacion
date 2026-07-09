import { useEffect, useRef, useState } from "react";
import { notificacionService } from "../../services/notificacionService";
import { useAuth } from "../../hooks/useAuth";
import type { Notificacion } from "../../types";
import "./NotificationBell.css";

/** HU-17 · Notificaciones de tareas asignadas y vencimientos próximos. */
export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    notificacionService.list(user.id).then(setNotifs);
  }, [user]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const unread = notifs.filter((n) => !n.leida).length;

  async function handleToggle() {
    setOpen((v) => !v);
  }

  async function handleMarkAll() {
    if (!user) return;
    await notificacionService.markAllRead(user.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  }

  async function handleMarkOne(id: string) {
    await notificacionService.markRead(id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  return (
    <div className="notif" ref={ref}>
      <button
        className="notif__trigger"
        onClick={handleToggle}
        aria-label="Notificaciones"
      >
        🔔
        {unread > 0 && <span className="notif__badge">{unread}</span>}
      </button>

      {open && (
        <div className="notif__panel">
          <header className="notif__header">
            <span>Notificaciones</span>
            {unread > 0 && (
              <button className="notif__mark-all" onClick={handleMarkAll}>
                Marcar todas como leídas
              </button>
            )}
          </header>
          {notifs.length === 0 ? (
            <p className="notif__empty">No tienes notificaciones.</p>
          ) : (
            <ul className="notif__list">
              {notifs.map((n) => (
                <li
                  key={n.id}
                  className={`notif__item ${n.leida ? "" : "notif__item--unread"}`}
                  onClick={() => handleMarkOne(n.id)}
                >
                  <strong>{n.titulo}</strong>
                  <p>{n.mensaje}</p>
                  <span className="notif__date">
                    {new Date(n.fecha).toLocaleDateString("es-PE")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
