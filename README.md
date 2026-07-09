# Sistema de seguimiento de practicantes pre-profesionales Cs. Comunicación (Proyecto de Ingeniería de Software)

## Descripción del proyecto

El sistema busca digitalizar y centralizar el proceso de seguimiento de las prácticas pre-profesionales de los estudiantes de la Escuela Profesional de Ciencias de la Comunicación de la UNSA, proceso que actualmente se gestiona en el aula virtual de la universidad.

---

# Frontend Web (SSP)

Frontend del **Sistema de Seguimiento de Practicantes (SSP)** — Grupo 7, Proyecto
de Ingeniería de Software (UNSA, FIPS). Gestiona las prácticas pre-profesionales
conforme al reglamento RCU 0501-2020.

## Stack

Según `SSP_ARQ_ArquitecturaDelSistema_V1.0`:

- **React 19 + TypeScript** (Vite)
- **React Router** para el enrutamiento SPA
- Autenticación **JWT + RBAC** (roles: `ADMIN`, `PROFESOR`, `ALUMNO`)
- Despliegue previsto en **Vercel**

> El backend (FastAPI + PostgreSQL) aún no está disponible. La carpeta
> `src/services` contiene una **capa mock** que replica los contratos de la API
> REST (`/api/v1/...`) con latencia simulada y persistencia en `localStorage`.
> Cuando el backend exista, basta reemplazar el cuerpo de los servicios por
> llamadas `fetch` reales: los componentes no cambian.

## Historias de usuario implementadas

| HU    | Descripción                               | Ruta                  |
| ----- | ------------------------------------------ | ---------------------- |
| HU-1  | Iniciar sesión                             | `/login`               |
| HU-2  | Recuperar contraseña                       | `/recuperar`           |
| HU-3  | Registrar nuevas cuentas                   | `/registro`            |
| HU-4  | Creación de clases/prácticas               | `/aulas`               |
| HU-13 | Registro de empresa / centro de prácticas  | `/empresa`             |
| HU-14 | Seguimiento de horas acumuladas            | `/horas`               |
| HU-15 | Cierre y validación de prácticas           | `/cierre`              |
| HU-16 | Generación de reporte final de prácticas   | `/reporte`             |
| HU-17 | Notificaciones de tareas y vencimientos    | campana en el topbar   |
| HU-18 | Historial de prácticas por practicante     | `/historial`           |
| HU-19 | Gestión del supervisor externo             | `/empresa`             |
| HU-20 | Gestión de metas por practicante           | `/metas`               |
| HU-22 | Panel de control del profesor              | `/dashboard`           |
| HU-23 | Panel de control administrativo            | `/dashboard`           |
| HU-24 | Panel de control de empresa (supervisor)   | `/dashboard`           |

## Cuentas de prueba

| Rol      | Correo                  | Contraseña     |
| -------- | ----------------------- | -------------- |
| Admin    | `admin@unsa.edu.pe`     | `admin123`     |
| Profesor | `profesor@unsa.edu.pe`  | `profesor123`  |
| Alumno   | `alumno@unsa.edu.pe`    | `alumno123`    |
| Supervisor | `supervisor@radioyaravi.pe` | `supervisor123` |

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # type-check + build de producción
npm run preview  # previsualizar el build
```

## Estructura

```
src/
  components/      Componentes de UI reutilizables y layouts
    ui/            Button, TextField, SelectField, Alert, Modal
    layout/        AuthLayout (auth), AppLayout (shell autenticado), NotificationBell (HU-17)
  context/         AuthProvider + contexto de autenticación
  hooks/           useAuth
  pages/
    auth/          LoginPage, ForgotPasswordPage, RegisterPage  (HU-1/2/3)
    aulas/         AulasPage                                     (HU-4)
    empresa/       EmpresaPage                                   (HU-13, HU-19)
    horas/         HorasPage                                     (HU-14)
    cierre/        CierrePage                                    (HU-15)
    reporte/       ReportePage                                   (HU-16)
    historial/     HistorialPage                                 (HU-18)
    DashboardPage
  services/        Capa mock de la API (auth, aulas, empresa, práctica,
                    reporte, notificación) + "BD" local
  types/           Tipos del dominio (contratos de la API)
  utils/           Validadores de formularios
```
