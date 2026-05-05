# Final Reminders for Codex

1. Build the admin UI and logging infrastructure only.
2. Do not integrate AI/search providers yet.
3. Use real SlateCamp IDs:
   - `wiki_articles.article_id`
   - `questions.question_id`
   - `design_scenario_questions.question_id`
4. Do not use guessed columns like `id`, `stem`, or `answer_key` unless the repository code proves such aliases exist.
5. Reuse existing admin route guards and Supabase clients.
6. Keep service-role usage server-only if the project uses it.
7. Do not mutate live article/question content from proposals.
8. Make status/phase filters URL-based.
9. Paginate question tables server-side.
10. After migration, regenerate Supabase TypeScript types using the repository's existing command.
