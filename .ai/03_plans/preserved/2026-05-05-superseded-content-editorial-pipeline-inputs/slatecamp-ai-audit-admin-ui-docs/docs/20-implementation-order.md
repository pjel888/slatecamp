# Implementation Order

## Step 1: Inspect repository

Find existing patterns for:

- admin routes,
- admin guards,
- Supabase client/server helpers,
- components,
- data tables,
- badges,
- dialogs,
- server actions.

## Step 2: Add migration

Add audit tables, indexes, updated-at triggers, and RLS policies.

## Step 3: Generate/update types

Update Supabase TypeScript types if the repo uses generated types.

## Step 4: Add data access helpers

Create typed functions for:

- dashboard summary,
- article list,
- question list,
- findings list,
- runs list,
- manual finding creation,
- status updates,
- review decisions.

## Step 5: Add UI routes

Start with route shell and tabs.

## Step 6: Add dashboard cards

Use real counts.

## Step 7: Add tables

Articles, questions, findings, runs.

## Step 8: Add detail drawer/page

For article/question/finding context.

## Step 9: Add manual actions

Create finding, confirm/reject/resolve, mark reviewed, approve.

## Step 10: QA

Run local checks, manually verify admin-only access, verify no content mutation.
