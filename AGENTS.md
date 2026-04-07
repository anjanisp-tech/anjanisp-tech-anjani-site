# Agent Rules & Project Conventions

## Core Workflow Rules
- **Baseline Reference**: ALWAYS read `/ARCHITECTURE.md` at the beginning of every turn to understand the current state of the application's features and structure.
- **Documentation Updates**: ALWAYS update `/ARCHITECTURE.md` immediately after implementing a new feature, changing a route, or modifying the database schema.
- **Verification**: After updating documentation, ensure the "Download Architecture Doc" feature in the Admin panel still works as expected.
- **Self-Audit**: If a task involves system stability or backend changes, run the "Self-Audit" from the Admin -> System tab to verify end-to-end health.

## Technical Conventions
- **Database**: Support both SQLite (local) and Postgres (production). Use the abstraction in `/api/db.ts`.
- **Styling**: Use the established Tailwind theme in `src/index.css`.
- **AI**: Use `gemini-3-flash-preview` for the chatbot.
