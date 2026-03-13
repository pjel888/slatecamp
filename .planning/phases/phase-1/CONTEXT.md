# CONTEXT: Phase 1 Foundations

## 💡 Overview

Phase 1 establishes the "Core Loop" of SlateCamp: **Syllabus → Wiki → Quiz**. We are migrating from a legacy, coupled schema to a unified, scalable "Educational OS" architecture. This phase provides the structural foundations for all subsequent features (3D Lab, AI Tutor, and Analytics).

## 🏔️ Scope

- **Vertical:** Architecture (ALE) as the pilot discipline.
- **Tables:** `disciplines`, `taxonomy_tree`, `wiki_articles`, `questions`.
- **UI:** Apple HIG (Clarity, Deference, Depth) using Tailwind v4.
- **Tech:** Next.js Server Components for content fetching; Client Components for interactivity.

## 🏁 Goal

A functional dashboard where an authenticated user can:
1.  Navigate the Architecture syllabus.
2.  Read a taxonomy-mapped Wiki article.
3.  Take a 5-question Camp Mode quiz with rationales.
