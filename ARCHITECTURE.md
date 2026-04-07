# Application Architecture & Sitemap Reference

This document serves as the baseline for the application's features, structure, and technical architecture. It is intended to be human-readable and easily updated as the application evolves.

---

## 1. Project Overview
A high-performance personal brand and knowledge-sharing platform for a founder/consultant. It combines a professional blog with an AI-powered chatbot that uses a Google Drive-hosted knowledge base to provide expert-level advice based on the founder's specific methodology.

---

## 2. Sitemap (Routes)

### Public Routes
- `/`: **Home Page**. Hero section, core value proposition, and featured content.
- `/blog`: **Blog Index**. List of all articles with category filtering.
- `/blog/:id`: **Article View**. Full article content with a nested comment system.
- `/chat`: **AI Expert Chat**. Full-screen chat interface for interacting with the founder's knowledge base.
- `/sitemap`: **Visual Sitemap**. A user-friendly overview of all site sections.
- `/sitemap.xml`: **Technical Sitemap**. XML format for search engine indexing.

### Admin Routes (Protected)
- `/admin`: **Admin Dashboard**. Requires password authentication.
  - **Posts Tab**: CRUD operations for blog articles.
  - **Knowledge Tab**: Configuration for the Google Drive Knowledge Base (File ID) and manual sync trigger.
  - **Subscribers Tab**: View and export newsletter subscribers.
  - **System Tab**: Database initialization, documentation management, self-audit system, email testing, and server diagnostics.

---

## 3. Technical Architecture

### Frontend
- **Framework**: React 18+ with Vite.
- **Styling**: Tailwind CSS (Utility-first).
- **Animations**: `motion` (framer-motion) for smooth transitions and interactions.
- **Icons**: `lucide-react`.
- **State Management**: React Hooks (useState, useEffect, useMemo).

### Backend (Full-Stack)
- **Server**: Express.js running on Node.js.
- **API Entry Point**: `/api/index.ts`.
- **Database Layer**: `/api/db.ts` (Abstraction for Postgres and SQLite).
- **Utilities**: `/api/utils.ts` (Auth, Email, Notifications).

### Database Schema
The application uses a relational database with the following tables:
1.  **`posts`**: Stores blog articles (ID, Title, Date, Category, Excerpt, Content).
2.  **`comments`**: Stores user comments and admin replies (ID, Post ID, Parent ID, Name, Email, Content, Admin Flag).
3.  **`subscriptions`**: Stores newsletter emails (ID, Email, Created At).
4.  **`settings`**: Stores dynamic configuration (e.g., `GOOGLE_DRIVE_KNOWLEDGE_FILE_ID`).
5.  **`audits`**: Stores system health check results (ID, Status, Details, Created At).

---

## 4. Core Features & Logic

### AI Chatbot (RAG System)
- **Knowledge Source**: A Google Doc hosted on Google Drive.
- **Sync Process**: The server fetches the doc content, cleans it, and caches it in memory.
- **Retrieval**: When a user asks a question, the AI uses the cached knowledge as context to provide accurate, methodology-specific answers.
- **Model**: Powered by Google's Gemini API (`gemini-3-flash-preview`).

### Blog & Comments
- **Markdown Support**: Articles are written and rendered in Markdown.
- **Nested Comments**: Supports threaded conversations.
- **Admin Replies**: Comments can be flagged as "Admin" via the dashboard.

### Newsletter Integration
- **Subscription**: Simple email capture form.
- **Notifications**: Real-time email notifications to the admin via **Resend** when a new user subscribes.

### Self-Audit System
- **Purpose**: Automated and manual health checks for system stability.
- **Checks**: Verifies Database connectivity, Gemini API availability, Knowledge Base integrity, and Resend API configuration.
- **Persistence**: Results are stored in the `audits` table for historical tracking.

---

## 5. External Integrations & Environment Variables
- **Google Gemini API**: `GEMINI_API_KEY` (AI Chatbot).
- **Resend API**: `RESEND_API_KEY` (Email notifications).
- **Vercel Postgres**: `POSTGRES_URL` (Production database).
- **Google Drive**: Publicly accessible Google Doc (Knowledge Base).

---

## 6. Maintenance & Operations
- **Database Init**: Can be re-run from the Admin -> System tab to ensure schema integrity. Automatically handles table creation for Postgres and SQLite.
- **Documentation Management**: The `ARCHITECTURE.md` file can be downloaded directly from the Admin -> System tab. The download mechanism includes robust path resolution. Deployment configuration in `vercel.json` ensures these files are included in the serverless function bundle.
- **Knowledge Sync**: Can be forced from the Admin -> Knowledge tab if the Google Doc is updated.
- **Vercel Config**: `vercel.json` is configured to include documentation files (`ARCHITECTURE.*`, `AGENTS.md`) in the serverless function bundle to ensure they are available for download at runtime.
- **Hard Restart**: Available in Admin -> System to reload environment variables.

---

## 7. Future Build Ideas
- **Chatbot UI Improvements (COMPLETED)**:
  - ✅ Implement line breaks between paragraphs in chatbot answers to improve readability.
  - ✅ Fix color contrast for user messages (question stem); increase text whiteness on blue backgrounds for better visibility.
- **Self-Audit System (COMPLETED)**:
  - ✅ Build an automated self-audit tool that runs periodically.
  - ✅ The tool performs end-to-end system health checks (Database, Gemini API, Knowledge Base, Resend API).
  - ✅ Results are stored in the `audits` table and viewable in the Admin -> System tab.

---
*Last Updated: 2026-04-07 (Implemented Self-Audit System)*
