# Rawat Lawat Client

Frontend prototype for preparing patient admission requests and coordinating
doctor, hospital, and insurance review workflows.

## Requirements

- Node.js 22 or newer
- npm

## Install and start

Run these commands from the `client` directory:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` and keep the terminal running. Press `Ctrl+C` to
stop the development server.

For a clean installation using the locked dependency versions:

```powershell
npm ci
npm run dev
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Patient | `patient@example.com` | `Patient123!` |
| Doctor | `doctor@hospital.com` | `Doctor123!` |
| Administrator | `admin@hospital.com` | `Admin123!` |

Patients can prepare a new request, review their admissions, and track an
admission through doctor, hospital, and insurance review.

## OCR models

Document recognition runs in the browser. The production build downloads the
required OCR models automatically into `public/models`; generated model files
are excluded from Git.

```powershell
npm run build
```

The `prebuild` script runs before the Vite build, verifies each model download,
and ensures the models are included in `dist/models` for deployment. The cloud
build environment therefore needs outbound internet access.

## Commands

```powershell
npm run dev      # Start the development server
npm run build    # Download OCR models and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```
