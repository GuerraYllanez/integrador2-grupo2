# Módulo de Gestión de Incidentes — Sistema ODAM

## Estructura incluida en este paquete
- `database/odontologia_odam.sql`: Script completo de creación de tablas (`estado_ticket`, `prioridad`, `asignado_a`, `ticket`) y catálogos iniciales.
- `backend/src/main/resources/application.properties`: Configuración con `odam.jwt.secret` por defecto de 32+ caracteres para evitar `WeakKeyException`.
- `backend/src/main/java/com/odam/controller/TicketController.java`: Controlador REST (`GET /api/tickets` y `POST /api/tickets`).
- `frontend/src/app/pages/incidentes/Incidentes.tsx`: Componente React con formulario de registro y tabla de tickets.
- `frontend/src/app/routes/RUTA_A_AGREGAR_EN_INDEX.tsx`: Bloque exacto para registrar `path: "incidentes"` en `frontend/src/app/routes/index.tsx`.

## Pasos rápidos de despliegue
1. Ejecutar `database/odontologia_odam.sql` en MySQL (`localhost:3306`).
2. Copiar `TicketController.java` y actualizar `application.properties` en `backend/`. Si tu usuario `root` de MySQL tiene contraseña, colócala en `${MYSQLPASSWORD:tu_clave}`.
3. Arrancar `OdamApplication.java` en IntelliJ IDEA (puerto `8080`).
4. Copiar `Incidentes.tsx` en `frontend/src/app/pages/incidentes/`, registrar la ruta en `frontend/src/app/routes/index.tsx`, ejecutar `npm install && npm run dev` en `frontend/` y abrir `http://localhost:5173/incidentes`.
