# Rawat Lawat

Hospital Admission & Guarantee Letter (GL) Platform

Rawat Lawat coordinates hospital admissions and insurance guarantee-letter processing across patients, doctors, hospital administrators, and insurers. Patients scan their identity and policy documents once, request admission, and track their case from submission through the insurer’s decision.

## Features

### Patient

- Scan identity and policy documents for reuse in future admissions
- Request admission at a selected hospital with consent
- Track progress across onboarding, documents, submission, and final decision
- View a complete admission activity log

### Doctor

- Review prepared admission notes
- Record diagnosis, estimated cost, and recommendation
- Electronically sign clinical notes

### Hospital Administrator

- Review incoming admission requests and manage the case queue
- Verify policy eligibility through the Policy Vault
- Check policy status, coverage, waiting periods, and sum insured
- Review and submit completed GL packages to insurers
- Access the Policy Vault, patient registry, and analytics

### Insurer

- Review submitted guarantee-letter packages
- Record claim decisions

### Platform

- Persistent, real-time updates shared across all roles
- GL package assembly from patient, policy, and clinical information
- In-browser identity and policy-document recognition

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8 |
| UI | MUI 7 |
| Routing | React Router 7 |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime |
| OCR | PaddleOCR, running entirely in the browser |

## Project Structure

```text
client/
├── public/                 # Static assets and downloaded OCR models
├── src/
│   ├── auth/               # Sessions and role-based access
│   ├── components/
│   │   ├── admin/          # Hospital administrator dashboard and queues
│   │   ├── doctor/         # Doctor review and note signing
│   │   └── insurance/      # Insurer claim review
│   ├── data/               # Policy Vault and reference data
│   ├── lib/                # Supabase client and workflow data access
│   ├── types/              # Shared domain types
│   ├── utils/              # In-browser OCR
│   └── workflow/           # Admission workflow and eligibility rules
├── supabase-schema.sql     # Supabase database schema
├── .env.example            # Environment variable template
└── package.json
```

## Prerequisites

- Node.js 22+
- npm
- A Supabase project (the free tier is sufficient)

## Getting Started

### 1. Install dependencies

From the `client` directory:

```bash
npm install
```

Or use the lockfile for a clean install:

```bash
npm ci
```

### 2. Set up Supabase

1. Open your Supabase project dashboard.
2. Go to **SQL Editor** → **New query**.
3. Paste and run the contents of `supabase-schema.sql`.

This creates the `patient_profiles` and `admissions` tables, configures row-level security policies, and enables realtime updates for admissions.

### 3. Configure environment variables

Copy the environment template:

```bash
cp .env.example .env.local
```

Then update `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Find these values in Supabase:

- **Project URL:** Project Settings → Data API
- **Publishable key:** Project Settings → API Keys

> Never expose an `sb_secret_...` key in the client application.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Patient | `patient@example.com` | `Patient123!` |
| Doctor | `doctor@hospital.com` | `Doctor123!` |
| Administrator | `admin@hospital.com` | `Admin123!` |

## Sample Data

When the app first loads against an empty database, it seeds four demo admissions and associated patient profiles.

| Patient | Status |
| --- | --- |
| Tan Ah Kow | Signed note, eligible, ready to submit |
| Lim Wei Jian | Signed note, eligible, ready to submit |
| Nur Aisha Rahman | Awaiting doctor signature |
| Siti Hawa Ismail | Not eligible due to an elective-procedure waiting period |

Try signing in as:

- **Doctor** to review and sign Nur Aisha Rahman’s note.
- **Administrator** to review eligible cases and submit them to the insurer.

To reset the demo data, clear the `admissions` and `patient_profiles` tables in Supabase’s Table Editor. The app reseeds them the next time it loads.

## Available Commands

```bash
npm run dev      # Start the development server
npm run build    # Download OCR models and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## OCR Models

Document recognition runs entirely in the browser using PaddleOCR.

During `npm run build`, the prebuild script downloads the required OCR models to `public/models` and includes them in `dist/models`. Generated model files are excluded from Git, so the build environment needs outbound internet access.

## Deployment

Rawat Lawat produces a static build and can be deployed to any static hosting provider, such as Vercel.

Set the same environment variables in your hosting provider:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

## License

MIT
