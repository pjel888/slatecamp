# STATE: SlateCamp (Project Memory)

**Current Status:** Initialization phase. Codebase mapped, schema extracted, and project identity established.
**Next Milestone:** Finalize requirements and roadmap (Phase 1).

---

## 📍 Current Phase: 0 — Initialization

- [x] Codebase mapped (`.planning/codebase/`).
- [x] Schema extracted (`DATABASE_SCHEMA.sql`).
- [x] Project identity defined (`PROJECT.md`, `CLAUDE.md`).
- [x] Workflow config set (`config.json`).
- [ ] Requirements scoped (`REQUIREMENTS.md`).
- [ ] Roadmap structured (`ROADMAP.md`).

## 🧱 Known Issues & Tech Debt

- **Missing Documentation:** Need specific requirements for the 3D Lab and AI Tutor RAG pipeline.
- **Testing Gap:** Zero automated tests in the current codebase (from `CONCERNS.md`).
- **Architectural Risk:** Need to verify the dual-payment (Stripe + PayRex) logic on the server.

## 🏁 Critical Paths

1.  **Syllabus Taxonomy:** Finalizing the master syllabus tree (Architecture focus).
2.  **State Persistence:** Implementing the 10-second auto-save logic for the quiz engine.
3.  **Readiness Score:** Designing the EMA (Exponential Moving Average) scoring engine.
