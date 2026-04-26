# Standalone Laboratory EMR System

This repository implements a full-stack Laboratory EMR/LIMS for an independent diagnostic laboratory using:

- React 18 + TypeScript + Vite
- Tailwind CSS v3
- Zustand + React Query
- React Router v6
- Node.js + Express + TypeScript
- Prisma + PostgreSQL
- JWT auth with refresh tokens
- Socket.io
- Zod shared validation

The codebase is organized as:

- `client/` for the React application
- `server/` for the Express API and Prisma schema
- `shared/` for shared Zod schemas and TypeScript types

Implementation targets the modules, workflows, database schema, routing, real-time contracts, and UI constraints defined in the project brief supplied by the user.
