# ODAM — Sistema de Gestión Odontológica

Proyecto reorganizado de la Clínica Odontológica ODAM.

## Stack actual

- Frontend: React + TypeScript + Vite.
- Backend: Java + Spring Boot.
- Seguridad: Spring Security + JWT.
- Base de datos: MySQL `odontologia_odam`.
- UI: componentes existentes de shadcn/Radix conservados.

## Organización

El frontend se organiza por dominios odontológicos (`pacientes`, `historias`, `evaluaciones`, `tratamientos`, `citas`, `horarios`, `pagos`, `reprogramaciones`, `servicios`, `odontologos`, `marketing`, `casos-especiales` y `auditoria`).

El backend conserva la separación `controller / service / repository / entity / dto / security`.

El código del prototipo anterior no fue eliminado: se conserva en `frontend/src/app/components/legacy/` mientras se realiza la migración funcional.

## Arranque local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Configura `frontend/.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:8080
```

### Backend

Configura `backend/.env` a partir de `.env.example` y ejecuta el proyecto con Maven/tu IDE.

### Base de datos

Ejecuta `database/odontologia_odam.sql` en MySQL.

## Estado de esta reorganización

Esta entrega corresponde a la **Fase 1 — Estructura**: separación de dominios, layouts, rutas, hooks, tipos y APIs, conservando el código anterior. La integración visual exacta con Figma y la conexión CRUD completa con Spring Boot se realizan sobre esta base.
