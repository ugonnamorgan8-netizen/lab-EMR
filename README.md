---
title: ST. DAVID MEDICAL DIAGNOSTIC CENTRE — Lab EMR
emoji: 🏥
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# ST. DAVID MEDICAL DIAGNOSTIC CENTRE — Lab EMR

A full-featured Laboratory Electronic Medical Records system. Manages the complete diagnostic workflow — from patient registration through sample collection, processing, QC, and results dispatch.

## Demo

Log in with any of the pre-seeded demo accounts:

| Email | Role |
|---|---|
| `reception@labemr.test` | Receptionist |
| `phlebotomy@labemr.test` | Phlebotomist |
| `scientist@labemr.test` | Lab Scientist |
| `technician@labemr.test` | Lab Technician |
| `qc@labemr.test` | QC Officer |
| `dispatch@labemr.test` | Dispatch Officer |
| `accountant@labemr.test` | Accountant |
| `manager@labemr.test` | Lab Manager |
| `admin@labemr.test` | Administrator |

**Default password:** `Password123!`

## Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL (set `DATABASE_URL` as a Space secret)
- **Auth:** JWT (access + refresh token rotation)
- **Real-time:** Socket.io for live queue and notification updates

## Deployment

See [DEPLOY_HUGGINGFACE.md](DEPLOY_HUGGINGFACE.md) for full instructions.

You need a PostgreSQL database (e.g. [Supabase](https://supabase.com) free tier) and set `DATABASE_URL` as a repository secret in the Space settings.
