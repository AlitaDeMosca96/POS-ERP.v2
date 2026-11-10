# ADR-002: Base de datos
Estado: aceptada
Decisión: PostgreSQL 16 principal + SQLite local en el POS.
Razón: Postgres cubre multi-tenant y RLS; SQLite es el único motor embebido serio para offline.
