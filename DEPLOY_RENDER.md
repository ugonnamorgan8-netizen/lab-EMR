# Render Demo Deploy

This project is set up to deploy as a single Render web service:

- Express serves the API
- Express also serves the built React frontend
- Render runs Prisma schema push and demo seeding during build

## 1. Put the code in GitHub

Render deploys from a Git repo.

1. Create a new GitHub repository.
2. Upload the contents of this `lab-emr` folder.
3. Make sure `render.yaml` is in the repo root.

## 2. Copy the two Supabase database URLs

You only need to copy exactly what Supabase shows you.

1. Open your Supabase project dashboard.
2. In the left sidebar, click `Connect`.
3. In the connection panel, find the `Connection string` section.
4. Copy the `Session pooler` Postgres URL.
   Use this as `DATABASE_URL`.
   It normally ends with port `5432`.
5. Copy the `Direct connection` Postgres URL.
   Use this as `DIRECT_URL`.

Notes:

- Supabase documents the pooler string as the right choice for persistent app traffic when IPv6 is not available.
- The direct connection is still useful for Prisma schema operations.

## 3. Create the Render service

1. Sign in to Render.
2. Click `New`.
3. Click `Blueprint`.
4. Connect your GitHub account if asked.
5. Select the repo that contains this project.
6. Render will detect `render.yaml`.
7. Continue to the environment variable screen.

## 4. Fill the environment variables

Set these values in Render:

- `DATABASE_URL` = the Supabase `Session pooler` URL you copied
- `DIRECT_URL` = the Supabase `Direct connection` URL you copied
- `CLIENT_URL` = leave blank for the first deploy

Render will generate these automatically from `render.yaml`:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## 5. Deploy

1. Click `Apply`.
2. Wait for the build to finish.
3. Open the generated `onrender.com` URL.

On deploy, Render is configured to:

1. install dependencies
2. generate Prisma Client
3. push the Prisma schema
4. seed demo data
5. build the frontend and backend
6. start the app

Important build note:

- the build command should be `npm install --include=dev && npm run prisma:generate --workspace server && npm run build`
- Render can skip devDependencies when `NODE_ENV=production`
- the client build needs devDependencies like `vite`, so using plain `npm install` can fail with `Cannot find type definition file for 'vite/client'`

## 6. Demo login

After the seed finishes, use one of these demo accounts:

- `reception@labemr.test`
- `phlebotomy@labemr.test`
- `scientist@labemr.test`
- `technician@labemr.test`
- `qc@labemr.test`
- `dispatch@labemr.test`
- `accountant@labemr.test`
- `manager@labemr.test`
- `admin@labemr.test`

Default password:

- `Password123!`

## 7. If the deploy fails

Most likely cause is the wrong Supabase connection string.

Use:

- `DATABASE_URL`: Session pooler
- `DIRECT_URL`: Direct connection

Not:

- only the raw `db.<project-ref>.supabase.co:5432` URL for both values

## Sources

- Supabase Prisma docs: https://supabase.com/docs/guides/database/prisma
- Supabase connection strings: https://supabase.com/docs/reference/postgres/connection-strings
- Render free deploy docs: https://render.com/docs/free
- Render first deploy docs: https://render.com/docs/your-first-deploy
