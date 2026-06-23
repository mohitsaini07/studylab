# StudyLab AI Study Assistant

StudyLab turns private PDF uploads into summaries, topics, questions, quizzes, flashcards, and learning analytics. The existing Tailwind/Shadcn-style frontend is connected to Supabase Auth, Postgres, RLS, private Storage, and Gemini structured generation.

## Requirements

- Node.js 20+
- A Supabase project
- A Google AI Studio Gemini API key

## Setup

1. Install dependencies with `npm install`.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor. It creates the tables, indexes, auth-user trigger, private `study-pdfs` bucket, and owner-only RLS policies.
3. In Supabase Authentication settings, enable Email authentication, set the local Site URL to `http://localhost:3000`, and add the production URL before deployment. StudyLab supports both immediate and confirmation-required signups.
4. Copy `.env.example` to `.env.local` and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
   GEMINI_API_KEY=your_google_ai_studio_key
   GEMINI_MODEL=gemini-2.5-flash-lite
   ```

   `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only. The service role is used only after the request's cookie session is verified; ownership is always derived from that verified user. Never expose either value through a `NEXT_PUBLIC_` variable.

5. Run `npm run dev`, open [http://localhost:3000](http://localhost:3000), create an account, and upload a text-based PDF.

## Data model

- `users`: profile synchronized from `auth.users`
- `study_sets`: source file, summary, topics, and processing state
- `questions`: MCQ, short-answer, and long-answer content
- `flashcards`: active-recall cards
- `quiz_attempts`: scores and weak-topic history
- `flashcard_reviews`: review completion and known-card counts
- `user_settings`: persisted account preferences

Every table has RLS. Child rows are accessible only when their study set belongs to the authenticated user. Private Storage paths begin with the user's UUID and use the same ownership rule.

## Upload and AI pipeline

`POST /api/study-sets` verifies the server-side user, validates the PDF and 25 MB limit, uploads to private Storage, extracts text with `pdf-parse`, asks Gemini for structured JSON, validates it with Zod, and stores the complete study set. MCQs are checked for exactly four options and an answer that matches one option. Extraction and AI failures are saved as safe failed states.

Authenticated handlers also save quiz attempts, flashcard reviews, settings, account email changes, and owner-only study-set deletion. User IDs are always derived from the verified session, never accepted from the browser.

## Production notes

- Add the deployment URL to Supabase Auth redirect URLs.
- Source PDFs use five-minute signed URLs.
- The generation handler allows up to 60 seconds; confirm the host supports that duration.
- Scanned/image-only PDFs return an OCR guidance error.
- Gemini free-tier quotas vary. Change `GEMINI_MODEL` without code changes when needed.

## Verification

Run `npm run build` for the production compile and TypeScript validation.
