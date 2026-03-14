# STATE: SlateCamp (Project Memory)

**Current Status:** Initialization phase. Codebase mapped, schema extracted, and project identity established.
**Next Milestone:** Finalize requirements and roadmap (Phase 1).

---

## 📍 Current Phase: 1 — Foundations (The Core Loop) [COMPLETED]

- [x] Syllabus Infrastructure: Database setup, disciplines, and taxonomy hierarchy.
- [x] The Wiki CMS: MDX article renderer, sticky ToC, internal sidebar, and highlight-fade.
- [x] Camp Mode Quizzing: Professional high-density renderer, visual feedback, and rationales.
- [x] Auth & Onboarding: Fixed redirect loops, validated discipline selection, and stats initialization.
- [x] Aesthetic: Premium Apple HIG layout (Triple-column scrolling).
- [x] Omnibar: Global discovery with Sidebar Peek and horizontal recents.
- [ ] Storm Mode (Phase 2).

## 🧱 Known Issues & Tech Debt

- **Missing Documentation:** Need specific requirements for the 3D Lab and AI Tutor RAG pipeline.
- **Testing Gap:** Zero automated tests in the current codebase (from `CONCERNS.md`).
- **Architectural Risk:** Need to verify the dual-payment (Stripe + PayRex) logic on the server.

## 🏁 Critical Paths

1.  **Syllabus Taxonomy:** Finalizing the master syllabus tree (Architecture focus).
2.  **State Persistence:** Implementing the 10-second auto-save logic for the quiz engine.
3.  **Readiness Score:** Designing the EMA (Exponential Moving Average) scoring engine.
