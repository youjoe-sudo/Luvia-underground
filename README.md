# Luvia Educational Platform

A cohort-based LMS combining self-paced learning, virtual live sessions, attendance-gated assessments, and exclusive course communities. Built on **Next.js 15 App Router** with **Supabase** (Postgres + Auth + RLS + Storage).

## Architecture

| Layer            | Tech                                                                |
| ---------------- | ------------------------------------------------------------------- |
| Framework        | Next.js 15 App Router (React Server + Client Components)           |
| Styling          | Tailwind CSS with brand color tokens (see `tailwind.config.ts`)     |
| DB / Auth        | Supabase PostgreSQL + `@supabase/ssr` for cookie-based auth         |
| Migrations       | `supabase/migrations/0001_init.sql` — single, consolidated          |
| Security         | `lib/security/` — SHA-256 fingerprint, screen protection, heartbeat |
| Video            | `components/player/UltraSecurePlayer.tsx` with dynamic watermarks   |

## Setup

```bash
npm install
cp .env.local .env.local   # already provided; contains NEXT_PUBLIC_SUPABASE_URL etc.
```

> ⚠️ **`.env.local` currently has a placeholder for `SUPABASE_SERVICE_ROLE_KEY`.**
> Replace it with the value from your Supabase dashboard (Settings → API → `service_role` `secret`).
> Server-only admin RPCs (`admin_create_user`, etc.) will refuse to work without it.

### Database

Open the Supabase SQL editor and run the contents of `supabase/migrations/0001_init.sql`.
This is the *only* migration file. It:

- Creates all PRD §7 tables + auxiliary tables (lessons, exams, community, certificates, tickets, …).
- Adds `users.active_session_id` and `active_session_started_at` for **strict single-session** enforcement.
- Defines the `heartbeat_ping` and `start_session` RPCs.
- Enables RLS on every table with role-aware policies.
- Seeds `brand_settings` and the Super Admin account.

### Run

```bash
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint
```

## Super Admin

- Email: `mohamed.a.a.fatah2010@gmail.com`
- Default password: `M@20252026`
- Forced to change on first login.

## Security model

1. **Hardware fingerprint** — SHA-256 over canvas + WebGL + hardware signals. Cached in `localStorage`.
2. **Screen protection** — DevTools detection, hotkey blocking, blur/visibilitychange pause.
3. **Heartbeat** — client pings `heartbeat_ping` every 35s; server gives a 90s leeway; missed window → sign-out.
4. **Single-session** — every login calls `start_session`, which mints a fresh `active_session_id`. The previous device's next heartbeat fails with `session_invalid` and is signed out.
5. **Watermarks** — every 4–8s the player re-paints the student's name + phone + a 6-digit nonce at a random position with a CSS tween.

See `lib/security/` for the contracts.

## Directory map

```
app/                    # routes
components/             # UI primitives + layouts + player
contexts/               # AuthContext (client-only)
lib/supabase/           # server / client / service clients
lib/security/           # fingerprint, screenProtection, heartbeat, single-session
lib/auth/               # session helpers, password rules
lib/types/              # database row types
supabase/migrations/    # single SQL file
public/                 # favicon, LV monogram
```

## Out of scope (documented)

- Email transport (PRD §3.1 step 4). The `admin_create_user` RPC returns the user id; the temp password is logged to the admin console as a TODO.
- Instructor-facing content upload UI. The schema tables are ready; the upload UI is a follow-up.
- Mobile native biometric binding. Device Lock covers the browser case.
