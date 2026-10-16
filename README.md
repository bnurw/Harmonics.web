# Harmonics — Pristine Audio & Messaging Platform

Harmonics is a production-grade, full-stack audio and social messaging platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**.

---

## Architecture & Project Structure

- **`/app`**: Next.js App Router pages, layouts, and server-side API routes (`/api/auth/*`, `/api/posts/*`, `/api/tracks`, `/api/upload`, `/api/playlists`, `/api/conversations`, `/api/search`, `/api/notifications`, `/api/admin/*`, `/api/cron/cleanup`).
- **`/components`**: Reusable frontend components partitioned into layout, feed, profile, audio player, reels, snaps, search, playlists, messaging, notifications, and owner dashboard.
- **`/lib`**: Utility functions, database client singleton (`db.ts`), and secure authentication helpers (`auth.ts`).
- **`/prisma`**: Complete database schema (`schema.prisma`) defining models for Users, Profiles, Follows, Posts, AudioTracks, SoundSnaps, Likes, Comments, Reposts, SavedItems, Playlists, Conversations, Messages, Notifications, Reports, ModerationActions, and AdminAuditLogs.

---

## Environment Variables

Configure the following environment variables in your `.env` or deployment secrets manager (see `.env.example` for placeholders):

```env
# GEMINI_API_KEY: Required for Gemini AI API calls.
GEMINI_API_KEY="your_gemini_api_key"

# APP_URL: The URL where this applet is hosted.
APP_URL="https://your-app-url.run.app"

# DATABASE_URL: PostgreSQL connection string for Prisma ORM
DATABASE_URL="postgresql://user:password@hostname:5432/harmonics?schema=public"

# AUTHENTICATION & JWT
JWT_SECRET="your_secure_jwt_secret_key"
NEXTAUTH_URL="https://your-app-url.run.app"

# SECURE OWNER PROVISIONING
OWNER_EMAIL="owner@harmonics.app"
OWNER_INITIAL_PASSWORD="SecureOwnerPassword2026!"

# OBJECT STORAGE & UPLOADS
UPLOAD_PROVIDER="local" # or 's3' for persistent object storage in production
UPLOAD_DIR="./public/uploads"
MAX_AUDIO_SIZE_MB="50"
MAX_IMAGE_SIZE_MB="5"

# CRON SCHEDULING SECRET
CRON_SECRET="your_secure_cron_secret_token"
```

---

## Database Setup & Migrations

1. Configure your PostgreSQL database URL in `DATABASE_URL`.
2. Run Prisma migrations to deploy the schema:
   ```bash
   npx prisma db push
   ```
3. The platform automatically provisions the initial OWNER account upon first server startup using `OWNER_EMAIL` and `OWNER_INITIAL_PASSWORD`.

---

## Persistent Media Storage & SoundSnap Expiration Scheduling

- **Media Storage**: Uploaded audio files and cover art are validated on the server for type and size constraints and stored via persistent object storage or adapter (`/public/uploads` locally, easily switchable to AWS S3 / Cloudinary adapters).
- **SoundSnap Expiry**: SoundSnaps automatically expire after 24 hours. Reliable backend cleanup is provided via the protected endpoint `/api/cron/cleanup`, which can be scheduled via Cloud Scheduler or standard cron jobs using `Authorization: Bearer <CRON_SECRET>`.

---

## Deployment Instructions

1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the production standalone server:
   ```bash
   node server.js
   ```
