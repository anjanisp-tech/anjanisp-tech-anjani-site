# MetMov Operating Clarity Platform - Architecture Documentation

## Core Methodology: MetMov (The Scaling Architect)
The platform is designed to digitize and scale the MetMov methodology, which focuses on installing "Operating Spines" in founder-led businesses to eliminate heroics and enable structural growth.

## Technical Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion (for animations).
- **Backend**: Node.js, Express, TSX (for TypeScript execution).
- **Database**: 
  - **Production**: Vercel Postgres.
  - **Development**: Better-SQLite3 (local file-based).
  - **Abstraction**: `/api/db.ts` handles the switching logic.
- **AI Engine**: 
  - **Model**: `gemini-3.1-flash-lite-preview` (Primary for speed), `gemini-3-flash-preview` (Fallback).
  - **Knowledge Base**: RAG (Retrieval-Augmented Generation) using Google Drive as the source.
- **Email**: Resend API for notifications and diagnostics.

## Key Features & Services

### 1. AI Chatbot (The Scaling Architect)
- **Route**: `/api/chat`
- **Logic**: Uses the `gemini-3.1-flash-lite-preview` model for ultra-low latency.
- **Knowledge Base**: Synced from a Google Doc/Docx via Google Drive API.
- **Tone**: High-status, clinical, authoritative, concise (bullet points).
- **Performance**: Uses streaming responses and `ThinkingLevel.MINIMAL` for maximum speed.

### 2. Knowledge Base Sync
- **Service**: `/api/knowledgeService.ts`
- **Mechanism**: Fetches content from Google Drive using a Service Account. Supports Google Docs (exported as docx) and binary .docx files.
- **Text Extraction**: Uses `mammoth` to extract raw text from docx buffers.
- **Caching**: Server-side caching with 1-hour TTL.

### 3. Admin Dashboard
- **Route**: `/admin`
- **Features**:
  - System Health & Environment Diagnostics.
  - Knowledge Base Sync management.
  - Database initialization and self-audit.
  - AI Debugging interface.
  - Email notification testing.

### 4. Diagnostic & Audit System
- **Route**: `/api/diagnostic`
- **Function**: Verifies environment variables, database connectivity, and Gemini API health.
- **Self-Audit**: `/api/admin/audit` runs a comprehensive system check and logs results to the `audits` table.

### 5. Performance Optimizations
- **Code Splitting**: All routes are lazy-loaded using `React.lazy` and `Suspense` to minimize initial bundle size.
- **Backend Efficiency**: Lazy imports and module caching in the API layer.
- **AI Streaming**: Real-time response streaming for perceived speed.

## Environment Variables (.env)
- `GEMINI_API_KEY`: Google AI API key.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email for Drive access.
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: Service account private key (PEM format).
- `GOOGLE_DRIVE_KNOWLEDGE_FILE_ID`: ID of the Google Doc/Docx source.
- `RESEND_API_KEY`: API key for Resend email service.
- `ADMIN_PASSWORD`: Password for accessing the admin dashboard.
- `POSTGRES_URL`: Connection string for production database.

## Database Schema (Key Tables)
- `posts`: Blog content.
- `comments`: User feedback on posts.
- `subscriptions`: Newsletter signups.
- `settings`: Key-value store for dynamic configuration (e.g., File IDs).
- `audits`: System health logs.
- `analytics_chatbot`: History of AI interactions.
- `analytics_calculator`: Results from the Bottleneck Calculator.
- `chatbot_leads`: (Deprecated) Historical email leads.

## Development Conventions
- Use `node --import tsx server.ts` to run the dev server.
- All backend routes should be defined in `api/index.ts`.
- Use `lucide-react` for icons.
- Follow the "Doctor, Not Advisor" tone in all AI-generated content.
