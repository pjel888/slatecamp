# Batch 140 Git Handoff Stage List

Generated: 2026-05-14T00:43:10.878Z
Status: passed_local_validation_git_handoff_pending

## Validation Snapshot

- Compose/diff/validate: PASS
- UI-block validation: PASS
- JSON parse: PASS
- Source hash checks: PASS
- Question edits: PASS
- Targeted tests: PASS
- Scoped git diff --check: PASS

## Stage Command

```bash
git add -f \
  ".ai/03_plans/batch-140-git-handoff-stage-list.md" \
  ".ai/03_plans/batch-140-git-handoff-stage-paths.txt" \
  ".ai/03_plans/batch-140-independent-quality-review.md" \
  ".ai/03_plans/production-line-batch-140-manifest.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/article-metadata.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/candidate.md" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/compose-error.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/compose-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/diff-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/diff-report.md" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/linked-questions.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/normalized.md" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/parser-errors.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/10b85af4-6289-43c9-901a-4cb169724da8.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/5d7b1153-482f-4f88-82cd-daf571dcbd29.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/62f69f86-dcca-458b-96cb-2a62c69ab48a.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/77cd2e9a-d801-4325-b01b-aa90c1d7cf32.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/7f564971-2a03-4da2-ba62-10ca5fb8709b.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/a65c16a2-85ad-4ce1-846f-edf91fc48d83.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/cd164305-4a4c-419b-8100-2c9e2b2b2530.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/e22e3062-b6b3-4497-98b7-20461790e843.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/e3927fe9-0cb5-4a2e-8b21-8fa0cd4e9906.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/question-edits/e726c251-5f26-4ea0-b843-006910b6b20d.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/source-audit-evidence.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/sources.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/ui-block-edit-validation.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/ui-block-edits.json" \
  ".ai/content-audit-export/articles/lea-strc-001-02-core-concept--943907de-24bf-414c-8fc8-cfacf7af25ff/ui-blocks.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/article-metadata.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/candidate.md" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/compose-error.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/compose-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/diff-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/diff-report.md" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/linked-questions.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/normalized.md" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/parser-errors.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/298d2ebd-f01b-4be2-8285-5a805d0213bf.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/2c0387cf-bfa0-4561-afda-78eb69a7d56f.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/6d72bd7e-eb1c-478c-b9f1-a27cc79d96ea.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/70768658-af0a-43a9-a4d6-91ca42fd7ff8.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/b439a1bc-33ee-416c-b356-e28911fde076.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/d52f98f6-dbf5-4177-b5b6-7fddd830411b.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/dc36720c-0763-478e-a8a0-4b75f4a160ea.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/ee951241-18b2-4f66-aa01-b444144164d2.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/f2e03291-6704-482d-ba92-d88662114444.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/question-edits/fe1ec42d-841c-4be0-86c8-b15efb218fb2.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/source-audit-evidence.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/sources.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/ui-block-edit-validation.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/ui-block-edits.json" \
  ".ai/content-audit-export/articles/lea-strc-001-03-core-concept--0297182f-252e-4837-b965-2aa11ecfb539/ui-blocks.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/article-metadata.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/candidate.md" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/compose-error.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/compose-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/diff-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/diff-report.md" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/linked-questions.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/normalized.md" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/parser-errors.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/26a2f1f8-d7ec-45a7-93db-97c8e2a19fa6.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/3045ee67-253c-48ea-895e-369a6aae8781.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/32354ae6-f1bc-4052-a64b-f5a1acda6111.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/3c969a43-8b08-426f-b0cd-de2eba994c5c.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/5a007692-7cfb-445c-8edf-a36f60ff4fba.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/6568b8d4-2b7a-4be8-8c43-0e0da13d3fae.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/7bf5786c-ac60-462a-a476-c8a681fc5837.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/8bc8ba95-ef32-4894-907e-2749dcfe46cb.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/b47302a0-2400-420f-8ad5-bf5f6a9b9314.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/question-edits/c616a5b1-14e3-4de7-993f-0307cb5eb1f2.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/source-audit-evidence.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/sources.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/ui-block-edit-validation.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/ui-block-edits.json" \
  ".ai/content-audit-export/articles/lea-strc-001-04-core-concept--273f06a8-65f2-4a4a-afdd-73361952093e/ui-blocks.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/article-metadata.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/candidate.md" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/compose-error.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/compose-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/diff-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/diff-report.md" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/linked-questions.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/normalized.md" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/parser-errors.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/0963c4a3-78c5-46fe-bd79-095c6f24c7eb.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/12762415-a5eb-4c6c-8e08-da815188b1a1.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/16dbced7-8a85-4209-9758-ed0434506371.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/308c2083-d625-42eb-a210-403ea875752e.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/4500e14d-4ec8-4e0c-80bf-be0df0574860.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/58c6baad-a86f-4c53-b55a-66aa63275fa4.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/66154d23-fcc2-40b4-bd57-c60aa95e3bc9.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/91c01223-fa84-4085-92f8-6af37b72a0b1.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/a7300870-da16-46f6-be87-6b8e1872f3f3.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/question-edits/b182164e-af71-46f9-a510-9a414aa30f52.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/source-audit-evidence.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/sources.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/ui-block-edit-validation.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/ui-block-edits.json" \
  ".ai/content-audit-export/articles/lea-strc-001-05-core-concept--974a7c85-c700-435b-80cc-8a2594a132a8/ui-blocks.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/article-metadata.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/candidate.md" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/compose-error.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/compose-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/diff-report.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/diff-report.md" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/linked-questions.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/normalized.md" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/parser-errors.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/147c6a87-2de9-434e-93a2-27f4621adf34.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/344d7ef4-6e57-4160-8ec9-726ff37f39fa.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/3b4cda58-122d-49c6-bec7-40c97aaf5a5c.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/43cc8681-979b-4de1-a19c-df9c04eb5a75.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/49de927c-0c98-4854-8958-60063f28fb09.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/6597ee20-dad2-47d9-8b67-6e22bcb35bc1.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/6e3aa52a-49d2-4885-8ad4-8f458fbf7011.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/86295d0b-30b2-42f9-a4ea-a6028f1e7bb1.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/98e870f2-5f59-434f-99d4-d062d934f6fd.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/question-edits/a25fc81c-1499-491c-a8e4-3afd6f4de016.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/source-audit-evidence.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/sources.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/ui-block-edit-validation.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/ui-block-edits.json" \
  ".ai/content-audit-export/articles/lea-strc-001-06-core-concept--d713a3b5-968e-4950-9f37-dd34d116b042/ui-blocks.json" \
  ".ai/content-audit-export/runs/source-audited-batch-140-local-finalizer.mjs" \
  ".ai/content-audit-export/runs/source-audited-batch-140-local-generation-summary.json" \
  ".ai/content-audit-export/runs/source-audited-batch-140-local-generator.mjs" \
  ".ai/content-audit-export/source-audited-article-batch-140-local-first-content-generation-summary.json" \
  ".ai/content-audit-export/source-audited-article-batch-140-local-first-ledger.json" \
  ".ai/content-audit-export/source-audited-article-batch-140-local-first-report.md" \
  ".ai/content-audit-export/source-audited-article-batch-140-local-first-scoped-checks.json" \
  ".ai/content-audit-export/ui-block-edit-validation.json" \
  ".ai/content-audit-export/validation-report.json" \
  "vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-140/lea-strc-001-02-core-concept.source-capture.md" \
  "vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-140/lea-strc-001-03-core-concept.source-capture.md" \
  "vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-140/lea-strc-001-04-core-concept.source-capture.md" \
  "vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-140/lea-strc-001-05-core-concept.source-capture.md" \
  "vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-140/lea-strc-001-06-core-concept.source-capture.md" \
  "vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-140/lea-strc-001-02-core-concept.refined.md" \
  "vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-140/lea-strc-001-03-core-concept.refined.md" \
  "vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-140/lea-strc-001-04-core-concept.refined.md" \
  "vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-140/lea-strc-001-05-core-concept.refined.md" \
  "vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-140/lea-strc-001-06-core-concept.refined.md"
```

The `vitruvius-connection` paths may be ignored by git defaults, so keep `-f` for this handoff.
