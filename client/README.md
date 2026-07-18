# Rawat Lawat — Hospital Admission & Guarantee Letter Platform

A web platform that coordinates hospital admissions and insurance guarantee
letter (GL) processing across patients, doctors, hospital administrators, and
insurers. Patients scan their identity and policy documents once, request an
admission, and track it end to end; hospital staff review the package, run
policy eligibility checks against the Policy Vault, and submit it to the
insurer. An optional AI service drafts a doctor's admission recommendation.

## Project Structure

```
rawat-lawat/
├── client/                 # React frontend (this app)
│   ├── public/             # Static assets and OCR models (downloaded at build)
│   ├── src/
│   │   ├── auth/           # Supabase Auth session and role-based access
│   │   ├── components/     # Screens and UI, grouped by role (admin/doctor/insurance)
│   │   ├── data/           # Policy Vault and reference data
│   │   ├── lib/            # Supabase client, workflow data access, API client
│   │   ├── types/          # Shared domain types
│   │   ├── utils/          # In-browser OCR (document recognition)
│   │   └── workflow/       # Admission workflow state and eligibility rules
│   ├── supabase-schema.sql # Database schema (run once in Supabase)
│   └── .env.example        # Frontend environment variable template
└── backend/                # Optional FastAPI AI service (see backend/README.md)
```

## Tech Stack

### Frontend

- **React 19** with the React Compiler
- **Vite 8** — dev server and build
- **TypeScript**
- **MUI 7** and **Tailwind CSS 4** — UI and styling
- **React Router 7** — routing

### Data & Realtime

- **Supabase (PostgreSQL)** — persistence for patient profiles and admissions
- **Supabase Realtime** — live status updates shared across roles
- **@supabase/supabase-js** — browser client (row-level security enforced)

### Document Recognition

- **PaddleOCR** — identity and policy scanning that runs entirely in the browser

### AI Service (optional)

- **FastAPI** — a small Python backend (`backend/`) that keeps the AI key
  server-side
- **Groq** via the **OpenAI SDK** — drafts a doctor's admission recommendation
  with `openai/gpt-oss-20b`

The app runs fully without this service; only the doctor's **AI Generate** button
depends on it, and it falls back to manual entry if the service is unavailable.

## Getting Started

### Prerequisites

- Node.js 22 or newer
- npm
- A Supabase project (free tier is sufficient)

### 1. Install dependencies

From the `client` directory:

```bash
npm install
```

For a clean install using the locked dependency versions:

```bash
npm ci
```

### 2. Set up the database

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents
of [`supabase-schema.sql`](./supabase-schema.sql), and run it. This creates the
`patient_profiles` and `admissions` tables, row-level security policies, and
enables realtime on `admissions`.

### 3. Configure environment variables

Copy the template and fill in your project values:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
# Optional — only needed for the doctor's AI recommendation (defaults to this):
VITE_API_URL=http://localhost:8000
```

- **Project URL** — Supabase dashboard → Project Settings → Data API
- **Publishable key** — Project Settings → API Keys (the `sb_publishable_...`
  key; safe for the browser because row-level security is enabled)

The `sb_secret_...` key must never be placed in the client.

### 4. Set up authentication

Login uses Supabase Auth, so the demo accounts must be provisioned once in your
project:

1. **Authentication → Providers → Email** — turn **off** "Confirm email" so demo
   accounts can sign in immediately.
2. **Authentication → Users → Add user** — create each account (auto-confirmed):
   - `patient@example.com` / `Patient123!`
   - `doctor@hospital.com` / `Doctor123!`
   - `admin@hospital.com` / `Admin123!`
3. **SQL Editor** — set the staff roles (patients default to `user`):

   ```sql
   update public.profiles set role = 'doctor' where email = 'doctor@hospital.com';
   update public.profiles set role = 'admin'  where email = 'admin@hospital.com';
   ```

   If `profiles` is empty (accounts were created before the schema ran), backfill
   first, then run the updates above:

   ```sql
   insert into public.profiles (id, email, name, role)
   select id, email, coalesce(raw_user_meta_data ->> 'name', ''), 'user'
   from auth.users
   on conflict (id) do nothing;
   ```

New patients can self-register from the app's **Create account** tab and get the
`user` role automatically.

### 5. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` and keep the terminal running. Press `Ctrl+C` to
stop.

### 6. (Optional) Start the AI service

Only needed for the doctor's **AI Generate** recommendation. In a second terminal:

```bash
cd ../backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set GROQ_API_KEY, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
uvicorn main:app --reload --port 8000
```

The Groq key stays server-side and is never exposed to the browser. See
[`backend/README.md`](../backend/README.md) for details.

## Demo Accounts

These are the accounts created during setup (step 4). The sign-in screen also has
quick-login buttons for the admin and doctor demos.

| Role          | Email                 | Password     |
| ------------- | --------------------- | ------------ |
| Patient       | `patient@example.com` | `Patient123!` |
| Doctor        | `doctor@hospital.com` | `Doctor123!`  |
| Administrator | `admin@hospital.com`  | `Admin123!`   |

## Sample Data

The first time the app loads against an empty database, it seeds four demo
admissions with matching patient profiles into Supabase, so the hospital and
doctor views are populated immediately:

| Patient            | State                                             |
| ------------------ | ------------------------------------------------- |
| Tan Ah Kow         | Signed note, eligible, ready to submit            |
| Lim Wei Jian       | Signed note, eligible, ready to submit            |
| Nur Aisha Rahman   | Awaiting the doctor's signature                   |
| Siti Hawa Ismail   | Not eligible (elective procedure waiting period)  |

Sign in as the **doctor** to review and sign Nur Aisha Rahman's note, or as the
**administrator** to review the eligible cases and submit them to the insurer.

To reset the demo data, clear the `admissions` and `patient_profiles` tables in
the Supabase dashboard (**Table Editor**); the sample data reseeds on the next
load.

## Features

### Patient

- One-time identity and policy document scan (kept for future admissions)
- Request an admission at a chosen hospital with consent
- Track an admission through onboarding, documents, submission, and the final
  decision, with a full activity log

### Doctor

- Review the prepared admission note
- Enter the diagnosis and estimated cost
- Draft the recommendation with **AI Generate** (Groq, via the AI service) or
  write it manually
- Electronically sign the note

### Hospital Administrator

- Review incoming admission requests and manage the case queue
- Policy eligibility checks against the Policy Vault (active policy, coverage,
  waiting periods, and sum insured)
- Pre-submission package review and submission to the insurer
- Policy Vault, patient case registry, and analytics

### Insurer

- Review the submitted guarantee letter package and record the decision

### Platform

- Shared, persistent state — an update by one role appears live for the others
- Guarantee letter package assembly from patient, policy, and clinical data

## Commands

```bash
npm run dev      # Start the development server
npm run build    # Download OCR models and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## OCR Models

Document recognition runs in the browser. The `prebuild` script downloads the
required OCR models into `public/models` before the Vite build and ensures they
are included in `dist/models` for deployment; generated model files are excluded
from Git. The build environment therefore needs outbound internet access.

```bash
npm run build
```

## Deployment

The frontend is a static build and deploys to any static host (e.g. Vercel). Set
the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment
variables in the hosting provider so the production build can reach Supabase.

The optional AI service (`backend/`) is a Python app and must be hosted
separately (e.g. Render, Railway, Fly). If you deploy it, point the frontend at
it with `VITE_API_URL` and add its origin to the backend's `CORS_ORIGINS`.

## License

MIT
