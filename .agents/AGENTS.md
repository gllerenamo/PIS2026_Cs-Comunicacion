# Proyecto de Ciencias de la Comunicación - Memoria del Agente

## Estado del Proyecto al 09/07/2026

### Cambios Realizados para HU-5 (Acceso y vista de clases programadas)
1. **Backend**:
   - Agregada la tabla `ClaseProgramada` en `app/models/models.py`.
   - Agregado el esquema `ClaseProgramadaOut` en `app/schemas/schemas.py`.
   - Agregado el endpoint `GET /api/v1/alumno/clases-programadas` en `app/routers/alumno.py`.
   - Inyectadas semillas para clases programadas (próximas e historial) en `app/db/seed.py`.
2. **Frontend**:
   - Creado el tipo `ClaseProgramada` en `src/types/index.ts`.
   - Creado el método `listClasesProgramadas` en `src/services/alumnoService.ts`.
   - Creada la página `src/pages/alumno/ClasesProgramadasPage.tsx` y su hoja de estilos `ClasesProgramadasPage.css`.
   - Agregada la ruta `/clases` en `src/App.tsx`.
   - Agregada la opción "Clases programadas" en la barra lateral del rol `ALUMNO` en `src/components/layout/AppLayout.tsx`.
3. **Configuración**:
   - Actualizado `tsconfig.node.json` agregando `"DOM"` a `"lib"` para que las evaluaciones del navegador en los tests de Node (Stagehand) compilen sin errores de tipo.
4. **Pruebas**:
   - Creado `tests/HU-5.ts` para validar el flujo completo de visualización de clases programadas utilizando Stagehand y Browserbase.

### Pendientes / Próximos Pasos
- Validar las ejecuciones de los tests de manera local levantando el backend FastAPI y el frontend Vite.
- Correr `python -m app.db.seed` en el backend para aplicar los nuevos cambios de base de datos e insertar las semillas de clases programadas.
