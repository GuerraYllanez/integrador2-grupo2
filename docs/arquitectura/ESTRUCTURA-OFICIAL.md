# Estructura oficial de ODAM

La reorganización mantiene el backend Spring Boot, JWT y el esquema MySQL `odontologia_odam`.

## Frontend

- `src/app/pages`: pantallas agrupadas por dominio odontológico.
- `src/app/components`: componentes reutilizables.
- `src/app/components/ui`: componentes shadcn/Radix existentes, conservados.
- `src/app/layouts`: layouts globales.
- `src/app/routes`: definición de rutas.
- `src/app/hooks`: hooks de aplicación.
- `src/app/types`: tipos compartidos.
- `src/app/api`: cliente HTTP y APIs por dominio.
- `src/app/utils`: utilidades y compatibilidad con el código anterior.
- `src/app/components/legacy`: prototipos anteriores conservados sin eliminarlos.

## Backend

Se conserva `config`, `controller`, `dto`, `entity`, `exception`, `repository`, `security` y `service`.

## Base de datos

Se conserva `database/odontologia_odam.sql` sin cambios estructurales en esta fase.
