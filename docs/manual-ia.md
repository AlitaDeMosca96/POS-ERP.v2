# MANUAL DE TRABAJO CON IA
## Proyecto POS + ERP Gastronómico — Guía Máxima v3.1

**Versión:** 1.0 — Manual operativo
**Referencia:** Guía Máxima v3.1 (fuente de verdad)

## 0. FILOSOFÍA DE TRABAJO
1. **La Guía es la fuente de verdad:** La IA propone, la Guía decide.
2. **La IA es copiloto, no piloto:** Cada línea generada pasa por revisión.
3. **Contexto estructurado > masivo:** 20 líneas bien pensadas rinden más que 200 páginas.
4. **Todo se verifica:** Especialmente permisos, offline-first, costos, multi-tenant e idempotencia.
5. **Una sesión = un objetivo:** No mezclar diseño de DB con bugs.

## 1. SETUP DEL ENTORNO
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy + PostgreSQL (SQLite en dev).
- **POS:** Tauri + React + SQLite (PowerSync para sync).
- **Backoffice:** React + Vite.
- **Testing:** pytest + httpx + Playwright.

## 2. REGLAS DE ORO PARA LA IA
1. **Offline-first (D-005):** El POS opera sin red. Sync idempotente.
2. **Permisos (D-027):** Todo endpoint verifica recurso + acción + alcance. Deny by default.
3. **Idempotencia:** Cobros, pagos y stock llevan UUID de deduplicación.
4. **Nada se borra:** Soft delete (`deleted_at`).
5. **Multi-tenant:** `tenant_id` y `establishment_id` en toda tabla.
6. **Auditoría:** Acción sensible → autor, timestamp, valores, IP.
7. **Nunca inventes:** Si no está en la guía, `# TODO: verificar D-XXX`.

## 3. CHECKLIST DE CALIDAD
- [ ] Pasa Ruff, mypy y pytest.
- [ ] Verifica permisos.
- [ ] Audita acciones sensibles.
- [ ] Soft delete.
- [ ] Cobertura de tests > 80%.
