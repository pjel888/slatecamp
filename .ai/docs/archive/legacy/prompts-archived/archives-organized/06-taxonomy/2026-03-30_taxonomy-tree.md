# Architectural Correction Mandate: Taxonomy and Article Schema Separation

## Executive Summary
The current database schema is structurally compromised. The `taxonomy_tree` table is improperly storing level 3 content (articles) alongside level 1 and 2 organizers (subjects, subtopics). This execution mandate dictates the strict, sequential process for migrating articles to a dedicated `wiki_articles` table, establishing proper relational constraints, and refactoring the frontend `taxonomy-tree.tsx` component to handle the updated data pipeline. 

The agent is strictly prohibited from skipping validation steps.

## Phase 1: Database Schema Overhaul & Structural Integrity
The database is the bedrock. We must establish the correct tables and relationships before writing any application logic.

1. **Schema Definition:** The agent must update the schema file (e.g., Prisma, SQL) to define the new `wiki_articles` table. 
2. **Column Specifications (`wiki_articles`):** This new table must include the article content, title, slug, and a mandatory foreign key `taxonomy_id` (or `parent_id`) that directly references the primary key of the `taxonomy_tree` table.
3. **Constraint Enforcement:** The agent must implement a strict one-to-many relationship. The foreign key must have an `ON DELETE CASCADE` or `RESTRICT` rule to prevent orphaned articles if a subtopic is deleted.
4. **Taxonomy Cleanup:** The `taxonomy_tree` schema must be formally redefined to only expect hierarchical organizers.

## Phase 2: Data Migration Protocol
Existing data must be transferred without loss.

1. **Migration Script Generation:** The agent must write a localized migration script.
2. **Data Extraction:** The script must select all records in `taxonomy_tree` where the level is 3 (or the designation for articles).
3. **Data Insertion & Relational Binding:** The script must insert these records into the new `wiki_articles` table. Critically, it must map the old parent ID of the level 3 item to the new `taxonomy_id` foreign key in `wiki_articles`.
4. **Purge Operation:** Once the exact row count is verified as successfully inserted into `wiki_articles`, the script must permanently delete the level 3 records from the `taxonomy_tree` table.

## Phase 3: Backend API Routing and Payload Construction
The data delivery pipelines must be rebuilt to serve the new separated structure efficiently.

1. **Endpoint Refactoring:** The agent must locate the API route responsible for serving the taxonomy tree.
2. **Fetch Logic:** The query must be rewritten. It must first fetch the clean `taxonomy_tree` (Subjects and Subtopics). 
3. **Relational Joining:** Depending on the required frontend load, the backend must either use a SQL `JOIN` (or ORM equivalent) to attach the relevant `wiki_articles` to their respective subtopics before sending the payload, or establish a secondary route for fetching articles strictly by their `taxonomy_id`. 
4. **Type Definitions:** The agent must update all backend TypeScript interfaces or types to reflect this separated payload structure.

## Phase 4: Frontend UI Overhaul (`taxonomy-tree.tsx`)
The user interface must be adapted to ingest and render the newly formatted data payload without breaking the user experience.

1. **Component Inspection:** The agent must read `taxonomy-tree.tsx` and identify where the current 3-level assumption is hardcoded.
2. **State Management Update:** Update the local state interfaces to expect an array of taxonomy objects, which now contain a nested array of referenced `wiki_articles` (or handle the secondary fetch logic if architected that way).
3. **Render Logic Refactoring:** The component's map functions must be updated. Levels 1 and 2 will map from the taxonomy data. The 3rd level (the leaf nodes) must now specifically map over the `wiki_articles` array associated with that specific subtopic ID.
4. **Prop Drilling/Context:** Ensure that the routing links generated for the articles still construct the correct URL slugs based on the new `wiki_articles` data.

## Execution Sequence & Verification
The agent must execute and verify in this exact order.
1. Draft the Schema changes.
2. Draft the Migration script.
3. Apply the Schema and Migration. (Verify database integrity).
4. Refactor Backend API routes. (Verify JSON payloads via terminal or tests).
5. Refactor `taxonomy-tree.tsx`. (Verify frontend compilation and rendering).