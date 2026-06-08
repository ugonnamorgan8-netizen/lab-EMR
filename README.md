---
title: Phenom Labs EMR
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# Phenom Labs EMR Pitch Demo

This is the pitch-ready version of the Phenom Labs EMR system. It is designed to run seamlessly as a Docker Space on Hugging Face.

## Pitching Environment Features

This setup embraces the ephemeral nature of Hugging Face Spaces:
- **Clean State**: The application uses a local SQLite database that is stored within the container. Every time the Space goes to sleep or is restarted, the database is wiped clean.
- **Auto-Seeding**: Upon startup, the `Dockerfile` automatically runs the Prisma push and seed commands (`npm run seed:maybe`). This instantly provisions the system with all the required roles, test catalogs, and the fresh Phenom Labs branding data.
- **No Cleanup Required**: You don't have to worry about cleaning up dummy patient data or test runs after a pitch. Simply restart the Space, and you'll have a pristine environment ready for the next presentation.

## Transition to Production

When a client is ready to pay for a production deployment:
1. Change the Prisma database provider from `sqlite` to `postgresql`.
2. Connect an external managed database (e.g., Neon, Supabase, AWS RDS) by passing the connection string via the `DATABASE_URL` environment variable.
3. The data will then persist permanently across deployments and handle high-traffic production workloads.
