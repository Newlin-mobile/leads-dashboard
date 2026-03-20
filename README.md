# Leads Dashboard

Lead tracking dashboard voor freelance opdrachten.

## Features

- **Lead management**: Track leads van verschillende bronnen (Hoofdkraan, FreelancerMap, eigen netwerk)
- **Status tracking**: GO / Gesprek / Wacht / Rejected / Geen reactie
- **Value tracking**: Eenmalig / Recurring / TBD met bedrag
- **Notes**: Timeline per lead met notities

## Tech Stack

- Next.js 14 (App Router)
- SQLite (better-sqlite3)
- Jose JWT auth
- Tailwind CSS

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
pm2 start ecosystem.config.js
```

## Database

SQLite database in `data/leads.db`.

**Tables:**
- `users` - Admin gebruikers
- `leads` - Lead tracking
- `lead_notes` - Notes per lead

**Seed data:**
```bash
npx tsx src/scripts/seed.ts
```

Default admin: `admin@example.com` / `admin123`

## Deployment

Live op: https://leads.newlin.nl

Port: 3007 (via Apache reverse proxy)

## Template

Gebouwd op basis van [developer-tools-template](https://github.com/Newlin-mobile/developer-tools-template).

Voor template updates:
```bash
git fetch template
git merge template/master
```
