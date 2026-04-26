# Railway Deploy

Railway is the better fit for this project than Vercel because this app runs as a long-lived Node service with:

- Express serving both API and frontend
- Socket.IO real-time connections
- an in-process cron timer

Vercel Functions are request-based and Vercel documents WebSocket support through external providers rather than native long-lived function connections, so Railway is the safer deployment target for this codebase.

## 1. Repo setup

This repository now includes [`railway.json`](./railway.json), which tells Railway to:

- build with `npm install --include=dev && npm run prisma:generate --workspace server && npm run build`
- run Prisma schema push and demo seeding before deploy
- start the app with `npm run start`
- use `/api/health` for health checks

## 2. Create the project

1. Sign in to Railway.
2. Create a new project.
3. Choose `Deploy from GitHub repo`.
4. Select `ugonnamorgan8-netizen/lab-EMR`.

Railway should detect the repo and use `railway.json` automatically.

## 3. Add variables

Add these service variables:

- `NODE_ENV=production`
- `DATABASE_URL=<your pooled postgres URL>`
- `DIRECT_URL=<your direct postgres URL>`
- `JWT_ACCESS_SECRET=<long random string>`
- `JWT_REFRESH_SECRET=<long random string>`
- `CLIENT_URL=https://<your-public-railway-domain>`

Notes:

- Railway injects `PORT` automatically, so you should not hardcode it.
- For Supabase, use the session pooler for `DATABASE_URL` and the direct connection for `DIRECT_URL`.
- The seed script wipes and reseeds the demo database on each deploy.

## 4. Generate a public domain

After the first successful deploy:

1. Open the Railway service.
2. Go to `Settings` or `Networking`.
3. Generate a public domain.
4. Copy the HTTPS URL.
5. Update `CLIENT_URL` to that exact HTTPS origin.
6. Redeploy once so CORS and Socket.IO allow the public frontend origin.

## 5. Demo login

- `admin@labemr.test`
- `Password123!`

## Sources

- Railway config as code: https://docs.railway.com/deploy/config-as-code
- Railway build/start commands: https://docs.railway.com/reference/build-and-start-commands
- Railway monorepo guide: https://docs.railway.com/guides/monorepo
- Railway build/deploy overview: https://docs.railway.com/build-deploy
- Vercel Functions: https://vercel.com/docs/functions/
- Vercel WebSocket guidance: https://vercel.com/guides/do-vercel-serverless-functions-support-websocket-connections
