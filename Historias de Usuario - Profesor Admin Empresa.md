# Historias de Usuario — Profesor · Administrador · Centro de prácticas

Derivadas del mockup `mockup_profesor_admin_practicasCC.html`. Cada historia indica el
ítem del sidebar / pantalla del mockup que la origina. La numeración continúa el backlog
existente (HU-01 … HU-20 ya trabajadas); ajústala si el equipo lleva otra secuencia.

Formato: **Como** \<rol\> **quiero** \<acción\> **para** \<beneficio\>, con criterios de aceptación.

---

## Rol: PROFESOR (Jefe de prácticas)

Sidebar del mockup: Inicio · Mis aulas · Tareas por revisar · Asistencia · Calificaciones ·
Seguimiento · Mensajería · Foros · Mi perfil.
Aula virtual con pestañas: Materiales · Tareas · Asistencia · Foro · Anuncios · Calificaciones · Mensajes · Alumnos.

### HU-21 — Panel de inicio del profesor
**Como** profesor **quiero** un panel con indicadores de mis aulas **para** priorizar mi trabajo del día.
- KPIs: alumnos activos, entregas por calificar, asistencia promedio, alumnos en riesgo.
- Lista de "pendientes urgentes" (entregas nuevas, alumnos en riesgo, mensajes sin responder) con acción directa.
- Panel de "próximas clases" con acceso a iniciar sesión.
- *Mockup: PROF SC0 · sidebar "Inicio".*

### HU-22 — Bandeja de tareas por revisar
**Como** profesor **quiero** ver todas las entregas pendientes de calificar agrupadas por tarea **para** no dejar entregas sin revisar.
- Contador de entregas pendientes en el sidebar y en la pestaña Tareas.
- Por tarea: nº entregadas / pendientes / sin avance, peso, fechas.
- Botón "Revisar (N)" que abre la calificación.
- *Mockup: PROF SC2 pestaña Tareas · sidebar "Tareas por revisar".*

### HU-23 — Calificar entrega con rúbrica
**Como** profesor **quiero** calificar una entrega usando una rúbrica de criterios ponderados **para** dar una nota justificada y retroalimentación.
- Vista de la entrega del alumno (archivo/comentario) + criterios con puntaje y peso.
- Cálculo automático de la nota ponderada.
- Campo de retroalimentación y opción de publicar / devolver para corrección.
- *Mockup: PROF SC3 "Calificar entrega".*

### HU-24 — Registro de asistencia
**Como** profesor **quiero** registrar la asistencia por sesión (presente/tardanza/ausente) **para** llevar control y detectar riesgo.
- Selector de fecha/semana, lista de alumnos con control de 3 estados.
- Resumen: presentes / tardanzas / ausentes / total.
- Guardar registro y exportar.
- *Mockup: PROF SC2 pestaña Asistencia · sidebar "Asistencia".*

### HU-25 — Libro de calificaciones y cierre de ciclo
**Como** profesor **quiero** un libro de notas consolidado por alumno **para** ver el desempeño global y cerrar el ciclo.
- Tabla: notas por tarea, % asistencia, horas de bitácora, promedio final.
- Exportar CSV.
- Acción "Cerrar ciclo" que consolida las notas.
- *Mockup: PROF SC2 pestaña Calificaciones · sidebar "Calificaciones".*

### HU-26 — Seguimiento individual del practicante
**Como** profesor **quiero** una ficha por practicante con su progreso completo **para** hacer seguimiento y contactarlo si está en riesgo.
- Perfil: centro de prácticas, promedio, asistencia, horas acumuladas, historial de entregas.
- Indicador de riesgo y acción de contacto.
- *Mockup: PROF SC4 "Seguimiento" · sidebar "Seguimiento".*

### HU-27 — Materiales del aula (profesor)
**Como** profesor **quiero** subir y organizar materiales por semana **para** que los alumnos accedan a los recursos.
- Subir PDF/video/plantillas, editar, eliminar; ver descargas/visualizaciones.
- *Mockup: PROF SC2 pestaña Materiales.*

### HU-28 — Publicar anuncios del aula
**Como** profesor **quiero** publicar anuncios al aula **para** comunicar novedades.
- Título + mensaje, opción "enviar por correo" y "fijar arriba".
- Lista de anuncios con "visto por N de M alumnos".
- *Mockup: PROF SC2 pestaña Anuncios.*

### HU-29 — Foro de discusión (profesor)
**Como** profesor **quiero** abrir y moderar hilos de foro **para** fomentar la discusión.
- Crear hilo, ver respuestas, moderar.
- *Mockup: PROF SC2 pestaña Foro · sidebar "Foros".*

### HU-30 — Mensajería profesor ↔ alumno
**Como** profesor **quiero** una bandeja de mensajes con mis alumnos **para** responder dudas.
- Lista de conversaciones, no leídos, hilo tipo chat con adjuntos.
- *Mockup: PROF SC2 pestaña Mensajes · sidebar "Mensajería".*

### HU-31 — Lista de alumnos por centro de prácticas
**Como** profesor **quiero** ver los alumnos del aula filtrables por centro de prácticas **para** organizar el seguimiento.
- Tarjeta por alumno con promedio, estado de riesgo, centro.
- *Mockup: PROF SC2 pestaña Alumnos.*

---

## Rol: ADMINISTRADOR

Sidebar del mockup: Dashboard · Usuarios · Aulas virtuales · Asignar profesores ·
Matrículas · Reportes · Auditoría · Configuración · Roles y permisos.

### HU-32 — Panel de control general (admin)
**Como** administrador **quiero** un dashboard institucional **para** monitorear el estado global del programa.
- KPIs globales (usuarios, aulas activas, matrículas, etc.) y gráficos.
- *Mockup: ADM SC0.*

### HU-33 — Gestión de usuarios (extendida)
**Como** administrador **quiero** administrar todos los usuarios **para** crear, editar, activar/desactivar y cambiar roles.
- Filtro por rol, búsqueda, alta/baja, cambio de rol. (Extiende HU-12.)
- *Mockup: ADM SC1 · sidebar "Usuarios".*

### HU-34 — Gestión de aulas virtuales (admin)
**Como** administrador **quiero** crear y administrar todas las aulas **para** organizar los ciclos.
- Listado de aulas con estado, alumnos, profesor asignado; crear/editar/archivar.
- *Mockup: ADM SC2 · sidebar "Aulas virtuales".*

### HU-35 — Asignar profesor jefe de prácticas a un aula
**Como** administrador **quiero** asignar un profesor a cada aula **para** definir responsables.
- Seleccionar aula y profesor; ver carga actual de cada profesor.
- *Mockup: ADM SC3 · sidebar "Asignar profesores".*

### HU-36 — Gestión de matrículas
**Como** administrador **quiero** administrar las matrículas del ciclo **para** inscribir/mover alumnos.
- Lista de matrículas por ciclo, inscribir alumnos, mover de aula.
- *Mockup: ADM SC4 · sidebar "Matrículas".*

### HU-37 — Reportes y análisis institucionales
**Como** administrador **quiero** generar reportes del programa **para** tomar decisiones y rendir cuentas.
- Reportes por ciclo/aula/centro; exportación.
- *Mockup: ADM SC5 · sidebar "Reportes".*

### HU-38 — Auditoría de acciones
**Como** administrador **quiero** un registro de auditoría **para** rastrear acciones sensibles del sistema.
- Log de eventos por usuario/fecha/acción. *(sidebar "Auditoría").*

### HU-39 — Configuración del sistema
**Como** administrador **quiero** configurar parámetros del programa (horas mínimas, periodos, etc.) **para** adaptar el sistema. *(sidebar "Configuración").*

### HU-40 — Roles y permisos
**Como** administrador **quiero** gestionar roles y permisos **para** controlar el acceso por funcionalidad. *(sidebar "Roles y permisos").*

---

## Rol: CENTRO DE PRÁCTICAS (Supervisor de empresa) — rol nuevo

Sidebar del mockup: Inicio · Mis practicantes · Validar horas · Asistencia ·
Evaluaciones · Jefe de prácticas (mensajería) · Convenio y documentos · Datos del centro.

> Requiere agregar el rol `SUPERVISOR`/empresa al login y a las rutas protegidas.

### HU-41 — Panel de inicio del supervisor
**Como** supervisor del centro **quiero** un panel con mis practicantes y pendientes **para** organizar la supervisión.
- Resumen de practicantes asignados, horas por validar, evaluaciones pendientes.
- *Mockup: EM SC0.*

### HU-42 — Mis practicantes asignados
**Como** supervisor **quiero** ver la lista de practicantes de mi centro **para** hacer seguimiento.
- Ficha por practicante: aula, profesor, horas acumuladas, estado.
- *Mockup: EM SC1 · sidebar "Mis practicantes".*

### HU-43 — Validar horas de la bitácora
**Como** supervisor **quiero** revisar y validar (o rechazar) las horas que el practicante registra en su bitácora **para** dar fe del cumplimiento.
- Ver registros de bitácora del practicante, aprobar/rechazar con comentario.
- Contador de horas pendientes de validación en el sidebar.
- *Mockup: EM SC2 pestaña Bitácora · sidebar "Validar horas".*

### HU-44 — Registrar asistencia del practicante en el centro
**Como** supervisor **quiero** registrar la asistencia del practicante en la empresa **para** complementar el control académico.
- *Mockup: EM SC2 pestaña Asistencia · sidebar "Asistencia".*

### HU-45 — Evaluación de desempeño del practicante
**Como** supervisor **quiero** evaluar el desempeño del practicante con una rúbrica **para** entregar la nota del centro.
- Rúbrica de criterios, puntaje, comentario, envío al jefe de prácticas.
- *Mockup: EM SC3 · sidebar "Evaluaciones".*

### HU-46 — Comunicación con el jefe de prácticas
**Como** supervisor **quiero** enviar mensajes al jefe de prácticas **para** coordinar sobre los practicantes.
- *Mockup: EM SC2 pestaña Mensajes · sidebar "Jefe de prácticas".*

### HU-47 — Convenio y documentos del centro
**Como** supervisor **quiero** consultar/subir el convenio y documentos **para** mantener el vínculo formal al día.
- *Mockup: EM SC2 pestaña Documentos · sidebar "Convenio y documentos".*

### HU-48 — Datos del centro de prácticas
**Como** supervisor **quiero** administrar los datos de mi centro **para** mantener la información actualizada.
- *(sidebar "Datos del centro").*

---

## Notas de implementación

- **Rol nuevo:** las HU del centro de prácticas exigen habilitar el rol supervisor/empresa
  en autenticación, `ProtectedRoute` y el `NAV_BY_ROLE` del `AppLayout`.
- **Reutilización:** rúbrica de HU-23 (profesor) y HU-45 (supervisor) comparten componente;
  la bitácora ya existe (HU-14) y HU-43 solo añade la capa de validación del supervisor.
- **Prioridad sugerida:** Profesor (HU-21–26) → Supervisor (HU-41–45) → Admin (HU-32–37) →
  resto (auditoría, configuración, roles).
