# FleetMarket SA (production platform)

South African marketplace for renting delivery motorcycles and e-hailing cars.

Drivers can browse listings **or post rental requests**. Owners list vehicles and receive enquiry notifications. Admins moderate listings and abuse reports.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Auth.js (NextAuth v5) credentials auth with roles: `DRIVER` | `OWNER` | `ADMIN`
- Prisma + SQLite (local) / Postgres (`DATABASE_URL`) in production
- Zod validation, in-memory rate limits, Sharp photo uploads
- Nodemailer SMTP for enquiry/request notifications (console fallback in dev)
- POPIA privacy policy + consent logging
- Vercel-ready HTTPS hosting (`vercel.json`)

## Production guarantees in this codebase

| Requirement | Implementation |
|---|---|
| Auth + roles | `/register`, `/login`, JWT session with role claims |
| Shared DB + API | Prisma models + `/api/*` routes (no localStorage marketplace data) |
| Server-side ownership | Mutations check `ownerId` / admin |
| Enquiry delivery | Email (or logged console) to listing owner |
| Photo upload | `/api/uploads` → optimized WebP in `/public/uploads` |
| HTTPS hosting | Deploy to Vercel (or any HTTPS Node host) |
| POPIA | `/privacy`, required consent, `ConsentLog`, retention policy model |
| Validation + rate limits | Zod schemas + `rateLimit()` per IP/user |
| Admin moderation | `/admin` + abuse reports API |
| No demo data in prod | Seed never creates fictional listings; `SEED_DEMO` ignored in production |

## Local setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000

Default admin (from `.env`):

- Email: `admin@fleetmarket.sa`
- Password: `ChangeMeAdmin123!`

## Production deploy (HTTPS)

1. Create a Postgres database and set `DATABASE_URL`.
2. Set strong `AUTH_SECRET`, `APP_URL=https://your-domain`, SMTP vars, admin credentials.
3. Keep `SEED_DEMO=false`.
4. Deploy to Vercel (project root = this folder):

```bash
npx vercel --prod
```

5. Run migrations against production DB:

```bash
npx prisma migrate deploy
npm run db:seed
```

## Scripts

- `npm run dev` — local server
- `npm run build` / `npm start` — production server
- `npm run db:seed` — admin + retention policy only
- `npm run db:studio` — Prisma Studio

Legacy static PWA prototype is archived under `legacy-pwa/`.
