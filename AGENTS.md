<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# BazzUp

Marketplace connecting MSMEs who need selling space with owners
of unused short-term space. Hackathon, 8-day deadline.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui,
Prisma + Supabase Postgres, Supabase Auth & Storage, deploy to Vercel.

## Database rules — these override the Supabase skills
- Query with Prisma only. supabase-js is for auth and storage only.
- Data API is disabled on this project.
- DDL only via prisma/schema.prisma → `npx prisma db push`
- Never alter tables from the Supabase dashboard.
- Never import prisma in a Client Component.
- Check role on the server, never trust the client.