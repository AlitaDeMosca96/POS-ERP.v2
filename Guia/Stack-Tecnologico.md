# Stack Tecnológico (Arquitectura Técnica)

- **Backend (Nube):** Node.js + NestJS (TypeScript).
  - *Motivo:* Arquitectura modular ideal para ERP, alto rendimiento en tiempo real (WebSockets) y tipado fuerte.
- **Base de Datos (Nube):** PostgreSQL.
  - *Motivo:* Integridad relacional, ACID, y uso de Row-Level Security (RLS) para el aislamiento multi-tenant.
- **Frontend (Web / POS):** React.js (Next.js) + TypeScript.
  - *Motivo:* Interfaz de usuario rápida, reactiva y PWA para tolerancia a fallos de red.
- **Agente Local (Offline):** Electron.js + SQLite.
  - *Motivo:* Aplicación de escritorio multiplataforma (Windows/Mac) que corre localmente, gestiona impresión y sincroniza con la nube.
- **Infraestructura:** Docker + AWS / GCP (Arquitectura Multi-región).
