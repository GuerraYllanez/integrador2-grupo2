# Estructura oficial ODAM

Esta versión reorganiza progresivamente el proyecto sin eliminar el código anterior.

## Arquitectura

```text
Proyecto ODM/
├── frontend/
│   └── src/app/
│       ├── api/
│       ├── components/
│       │   ├── common/
│       │   ├── legacy/
│       │   └── ui/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── types/
│       └── utils/
├── backend/
│   └── src/main/java/com/odam/
│       ├── config/
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── exception/
│       ├── repository/
│       ├── security/
│       └── service/
├── database/
├── docs/
└── README.md
```

## Decisiones

- Se conserva `components/ui` y el código del prototipo anterior en `components/legacy`.
- Las pantallas nuevas se agrupan por dominio odontológico.
- `api/client.ts` es el cliente HTTP único; `api/*Api.ts` separa los dominios.
- El backend mantiene Spring Boot, JWT y su separación por capas.
- La BD oficial continúa siendo `odontologia_odam` y no se modifica en esta fase.
- Figma se integrará sobre las páginas de dominio, no sobre la estructura de persistencia.
