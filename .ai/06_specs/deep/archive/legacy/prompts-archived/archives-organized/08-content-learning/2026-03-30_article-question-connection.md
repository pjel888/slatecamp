# Architectural Blueprint and Execution Mandate: Article-Question Relational Integration

## Executive Summary
This document dictates the exact execution sequence for integrating a "Related Questions" feature into the existing article editing interface at `/admin/articles/[slug]`. The primary directive is absolute relational integrity: every question submitted must be inextricably linked to its parent article in the database. The agent will not bypass any verification steps.

## Phase 1: Structural Audit and Schema Enforcement
Before touching the application layer, the agent must verify and enforce the database architecture.

1. **Schema Inspection:** The agent must read the current database schema file (e.g., `schema.prisma`, `schema.sql`, or equivalent).
2. **Foreign Key Mandate:** The agent must verify or establish a strict one-to-many relationship between the `Articles` table and the `Questions` table. The `Questions` table must contain a mandatory foreign key column (e.g., `articleId`) that directly references the primary key of the `Articles` table.
3. **Data Lifecycle Rules:** The agent must implement an `ON DELETE CASCADE` rule (or the ORM equivalent) on the foreign key. Orphaned questions without a parent article are structural liabilities and must not be permitted.
4. **Migration Generation:** If the schema lacks these constraints, the agent must generate the necessary database migration script and prompt for execution before proceeding to Phase 2.

## Phase 2: API Protocol and Transactional Integrity
The backend pipeline must act as a strict gatekeeper, rejecting any malformed or unlinked data.

1. **Route Modification:** The agent must locate the API route or server action responsible for updating articles or create a dedicated route for question ingestion.
2. **Payload Validation:** The incoming request payload must be strictly typed. It must require the parent `articleId` alongside the question text data.
3. **Atomic Transactions:** The database insertion logic must be wrapped in an atomic transaction. If the system attempts to insert three questions and one fails the relational mapping, the entire transaction must roll back. The database remains pristine or the update fails completely.

## Phase 3: Client Interface Construction (`/admin/articles/[slug]`)
The front-end must securely capture the relational data point (the article ID) silently while the user inputs the question text.

1. **Context Extraction:** The agent must modify the editing page to guarantee it possesses the exact internal `articleId` belonging to the current `[slug]`.
2. **Component Isolation:** The agent must build a dedicated, modular UI component for adding questions to maintain code hygiene and prevent polluting the main article form.
3. **State Management:** The UI must maintain a local array of drafted questions.
4. **Submission Binding:** When the user initiates a save operation, the front-end logic must automatically append the extracted `articleId` to every new question object before transmitting the payload to the server.

## Phase 4: Agent Execution Sequence
The agent must execute its tasks in the following strict order to prevent cascading failures.

1. Read the database schema and propose necessary relationship updates.
2. Read the backend API route for the specified page.
3. Read the front-end file located at or routing to `http://localhost:3000/admin/articles/[slug]`.
4. Implement and finalize backend database transactions.
5. Implement front-end UI components and bind them to the backend protocol.
6. Verify that saving a question dynamically updates the interface and structurally links in the database.
