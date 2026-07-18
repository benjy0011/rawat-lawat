# Rawat Lawat AI Service

A small FastAPI backend for AI features that need a server-side key. It verifies
the caller's Supabase session and calls Groq (via the OpenAI-compatible API) to
draft a doctor's admission recommendation.

## Endpoints

- `GET /health` — service status and configured model.
- `POST /ai/recommendation` — draft a recommendation. Requires a Supabase access
  token in the `Authorization: Bearer <token>` header.
  ```json
  { "diagnosis": "...", "estimatedCost": "MYR 6,400", "admissionReason": "..." }
  ```

## Setup

Requires **Python 3.10+** and a **Groq API key**
([console.groq.com/keys](https://console.groq.com/keys)).

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in GROQ_API_KEY, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

The service listens on `http://localhost:8000`. Point the frontend at it with
`VITE_API_URL` in `client/.env.local` (defaults to `http://localhost:8000`).

## Notes

- The `GROQ_API_KEY` stays server-side and is never exposed to the browser.
- `GROQ_MODEL` defaults to `openai/gpt-oss-20b`; confirm the exact id in the Groq
  console and override via the env var if needed.
