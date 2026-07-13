# Hugging Face Spaces Deployment — ST. DAVID MEDICAL DIAGNOSTIC CENTRE

This project can be deployed as a Hugging Face Space using the Docker SDK.
It uses the same PostgreSQL database (Supabase recommended) as any other deployment.

## Architecture

- **Docker** container runs on HF Spaces (port 7860)
- **PostgreSQL** database (Supabase free tier works)
- Express serves both the API and the built React frontend
- Prisma schema push + optional demo seed on first startup

## Prerequisites

- A Hugging Face account: https://huggingface.co
- A Supabase project with PostgreSQL: https://supabase.com
- The code pushed to a GitHub or HF repository

## 1. Set up your Supabase database

1. Create a new Supabase project at https://supabase.com.
2. In the left sidebar, click `Connect`.
3. In the connection panel, find the `Connection string` section.
4. Copy the **Session pooler** Postgres URL → this is your `DATABASE_URL`.

> **Note:** Only `DATABASE_URL` is required. The schema does not use a separate direct connection URL.

## 2. Create a Hugging Face Space

1. Go to https://huggingface.co/spaces and click `New Space`.
2. Choose a name for your space (e.g. `lab-emr`).
3. Select **Docker** as the SDK.
4. Set visibility to **Public** or **Private** as you prefer.
5. Click `Create Space`.

## 3. Push the code to the Space

The easiest option is to push from Git:

```bash
# Add the HF remote (replace with your username and space name)
git remote add hf https://huggingface.co/spaces/<your-username>/<your-space-name>

# Push main branch
git push hf main
```

Alternatively, upload files through the HF web UI.

## 4. Set Space secrets (environment variables)

In your Space, go to **Settings → Repository secrets** and add:

| Secret name | Value |
|---|---|
| `DATABASE_URL` | Your Supabase Session pooler Postgres URL |
| `JWT_ACCESS_SECRET` | A long random string (e.g. `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | A different long random string |
| `ENABLE_DEMO_SEED` | `true` (seeds demo accounts on first run) |
| `CLIENT_URL` | Leave blank — the app is served from the same origin |

> **Important:** Never commit secrets to your repository. Always use the Secrets panel.

## 5. Wait for the build

After pushing code or setting secrets, the Space will automatically rebuild.
Watch the build logs in the **Logs** tab. The startup sequence is:

1. `prisma db push` — creates/updates all tables in your PostgreSQL database
2. `tsx prisma/maybeSeed.ts` — seeds demo data if the database is empty
3. `tsx src/index.ts` — starts the Express server on port 7860

The first build takes 3–5 minutes. Subsequent builds are faster due to Docker layer caching.

## 6. Demo login

After the seed finishes, log in with any of these demo accounts:

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

Default password: **`Password123!`**

## 7. Troubleshooting

### Build fails with "prisma generate" error
Make sure `DATABASE_URL` is set. Without it, `prisma generate` can fail.
Go to Settings → Repository secrets and verify the value.

### App loads but login fails
- Confirm `DATABASE_URL` points to your actual Supabase database.
- Check the Logs tab for connection errors.

### "Origin not allowed by CORS"
- Leave `CLIENT_URL` blank — the API and frontend are served from the same HF Space URL.

### Build is slow
HF Spaces Docker builds run in the cloud. The first build always installs all
`node_modules` from scratch. Subsequent pushes reuse the Docker cache.

### Database schema is out of date
Re-trigger a deploy (e.g. push an empty commit). `prisma db push` runs on every
startup and updates the schema safely.

## 8. Updating the deployment

Push a new commit to the `hf` remote:

```bash
git push hf main
```

The Space will automatically rebuild and redeploy.

## Sources

- HF Spaces Docker docs: https://huggingface.co/docs/hub/spaces-sdks-docker
- Supabase Prisma docs: https://supabase.com/docs/guides/database/prisma
- Prisma db push: https://www.prisma.io/docs/reference/api-reference/command-reference#db-push
