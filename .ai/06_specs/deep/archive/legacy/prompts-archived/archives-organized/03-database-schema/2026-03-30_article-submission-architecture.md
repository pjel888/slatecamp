# Integration Blueprint: AI Enforcement and Data Pipeline Integrity

## 1. The AI Mandate (Prompt Engineering & Constraint)
The AI must not be allowed to operate freely. It must be bound by a strict contractual prompt that forces a deterministic output.

* **System Instructions:** Hardcode the AI prompt to act strictly as a categorization engine. 
* **Dynamic Context Injection:** Feed the AI the exact, current list of valid Subjects and Subtopics pulled directly from your database at the moment of the request. Do not allow it to guess, infer, or create new categories.
* **Enforced Output Format:** Mandate the AI to return only a strictly formatted JSON object matching your actual schema. If utilizing the Gemini API, you must use the `responseMimeType: "application/json"` configuration parameter to mathematically guarantee the output format.

## 2. The Intercept and Validation Layer (Quality Control)
Never trust the AI output directly. Treat it as an unverified subcontractor submission that must be inspected before it touches the live database.

* **Pre-insertion Validation:** Implement a rigid validation schema using libraries like Zod or Yup on your backend server. 
* **Relational Verification:** The validation layer must cross-reference the AI's selected Subject and Subtopic against your live database IDs. 
* **Rejection Protocol:** If the AI hallucinates a Subtopic or outputs data that does not perfectly match the dynamic list provided, the validation layer must instantly reject the payload before any database connection is initiated.

## 3. Database Structural Integrity (The Bedrock)
The database remains the final arbiter of truth. We rely on traditional, ironclad relational rules to prevent application failure.

* **Strict Foreign Keys:** Ensure your articles table possesses hard foreign key constraints enforcing the relationship to the subjects and subtopics tables. 
* **Atomic Transactions:** The insertion of the article and its relational category tags must occur within a single database transaction. If the linkage to a Subject or Subtopic fails, the entire transaction rolls back. This guarantees zero orphaned data and maintains a pristine structural state.

## 4. Failsafe and Fallback Operations (Risk Mitigation)
You must engineer for the inevitable scenario where the AI fails, times out, or produces garbage data.

* **Manual Override:** If the AI fails the validation layer, the system must gracefully fall back to the explicit manual selections the user made on the user interface. 
* **Quarantine Protocol:** If an article passes basic text validation but fails the relational mapping, route it to a hidden pending review table rather than discarding the user's work or crashing the application.
* **State Synchronization:** The front end must wait for the database transaction to fully resolve before showing a success state. If the operation fails, surface a precise error allowing the user to bypass the AI and manually force the categorization.