# Parathi.in — Civic Intelligence Platform

Parathi.in helps residents turn a short civic-issue description into a ready-to-submit municipal complaint. It classifies the issue, identifies the responsible department, drafts English and Malayalam complaint text, and links the user to the official municipal complaint portal.

## Features

- Describe a civic issue in English, Malayalam, or Manglish.
- Optional voice input in browsers that support speech recognition.
- Ward selection from the Kochi Municipal Corporation ward list.
- Issue classification by type, severity, and department.
- Editable English and Malayalam complaint drafts.
- Copy-to-clipboard action and a direct link to the official portal.
- Resilient local fallback triage: reports continue to work if the Gemini API key is unavailable or the provider response fails.

## Tech stack

- Next.js 14 / React 18 / TypeScript
- Tailwind CSS
- OpenAI-compatible Gemini API integration
- Vercel deployment

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the production build locally:

```bash
npm run build
npm run start
```

## Optional AI configuration

Create `.env.local` with a Gemini key to enable AI-powered classification and drafting:

```env
GEMINI_API_KEY=your-gemini-api-key
```

Without this key, the app uses its built-in civic-triage fallback so the reporting flow remains available.

For Vercel, add `GEMINI_API_KEY` under **Project Settings → Environment Variables** and redeploy. Never commit `.env.local`.

## Project structure

```text
app/
  api/manglish/route.ts  # Report classification and draft generation
  page.tsx               # Reporting experience and dashboard
  globals.css            # Shared styles
lib/wards.ts             # Kochi ward data and location helpers
```

## Deployment

The production site is hosted at [parathi.in](https://parathi.in).

Deploy from the project directory:

```bash
npx vercel --prod
```
