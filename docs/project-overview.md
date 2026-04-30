# FutureTeacher — EduLearn Pro

A professional teacher learning platform built on Cloudflare (Workers + D1 + R2 + Pages).

---

## Live URLs

| Service | URL |
|---------|-----|
| Frontend (Cloudflare Pages) | https://futureteacher.pages.dev |
| Backend API (Cloudflare Workers) | https://futureteacher-api.yuhaousa.workers.dev |

---

## Architecture

```
frontend/   React 18 + Vite → Cloudflare Pages
backend/    Hono v4 + Jose + Web Crypto → Cloudflare Workers
            ├── D1 SQLite (futureteacher-db)  — relational data
            └── R2 Object Storage (futureteacher-images) — course cover photos
```

---

## First-Time Setup

1. Visit **https://futureteacher.pages.dev/setup**
2. Enter a password for the admin account (min 6 characters)
3. This activates all accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edulearn.pro | *(your chosen password)* |
| Instructor | sarah@edulearn.pro | teacher123 |
| Instructor | james@edulearn.pro | teacher123 |
| Instructor | maria@edulearn.pro | teacher123 |
| Instructor | alex@edulearn.pro | teacher123 |

> The `/setup` page automatically redirects to `/login` once setup is complete.

---

## Cloudflare Resources

| Resource | Name / ID |
|----------|-----------|
| Worker | `futureteacher-api` |
| D1 Database | `futureteacher-db` — `c4624446-0d8d-4aa3-b1a1-b5adbf2bbb16` |
| R2 Bucket | `futureteacher-images` |
| Pages Project | `futureteacher` |
| Worker Secret | `JWT_SECRET` (set via `wrangler secret put`) |

---

## Project Structure

```
futureteacher/
├── docs/
│   └── project-overview.md        ← this file
├── backend/
│   ├── wrangler.toml              ← Worker config (D1 + R2 bindings)
│   ├── package.json               ← hono, jose, wrangler
│   ├── migrations/
│   │   ├── 0001_schema.sql        ← 12 tables
│   │   └── 0002_seed.sql          ← users, courses, communities, pathways
│   └── src/
│       ├── index.js               ← Hono app entry, mounts all routes
│       ├── lib/
│       │   └── crypto.js          ← PBKDF2 password hash + JWT (jose)
│       ├── middleware/
│       │   └── auth.js            ← authMiddleware, adminMiddleware
│       └── routes/
│           ├── auth.js            ← /api/auth/*
│           ├── courses.js         ← /api/courses/*
│           ├── enrollments.js     ← /api/enrollments/*
│           ├── pathways.js        ← /api/pathways/*
│           ├── communities.js     ← /api/communities/*
│           ├── users.js           ← /api/users/*
│           ├── ai.js              ← /api/ai/*
│           └── upload.js          ← /api/upload, /api/images/*
└── frontend/
    ├── .env.development           ← VITE_API_URL=http://localhost:8787
    ├── public/_redirects          ← SPA fallback for Pages
    └── src/
        ├── api/client.js          ← Axios base URL from VITE_API_URL
        ├── App.jsx                ← Routes
        ├── context/               ← AuthContext
        ├── pages/
        │   ├── Setup.jsx          ← First-time admin activation (/setup)
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Home.jsx
        │   ├── Discover.jsx       ← Course catalogue
        │   ├── CourseDetail.jsx
        │   ├── MyLearning.jsx
        │   ├── Pathways.jsx
        │   ├── Communities.jsx
        │   ├── AIAssistant.jsx
        │   └── admin/
        │       ├── AdminLayout.jsx
        │       ├── AdminDashboard.jsx
        │       ├── AdminCourses.jsx   ← Course CRUD + cover photo upload
        │       ├── AdminUsers.jsx
        │       ├── AdminPathways.jsx
        │       └── AdminCommunities.jsx
        └── components/
```

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/setup-status` | — | Check if setup needed |
| POST | `/api/auth/setup` | — | One-time admin activation |
| POST | `/api/auth/register` | — | Register new teacher |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user |

### Courses
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/courses` | — | List (filter: category, modality, search) |
| GET | `/api/courses/:id` | — | Course + modules + tags |
| POST | `/api/courses` | Admin | Create course |
| PUT | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |
| POST | `/api/courses/:id/enroll` | Bearer | Enroll |
| GET | `/api/courses/:id/discussions` | — | Get discussions |
| POST | `/api/courses/:id/discussions` | Bearer | Post discussion |

### Enrollments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/enrollments/my` | Bearer | My enrolled courses |
| PUT | `/api/enrollments/:courseId/progress` | Bearer | Update progress |
| POST | `/api/enrollments/:courseId/module/:moduleId/complete` | Bearer | Complete module |
| GET | `/api/enrollments` | Admin | All enrollments |

### Pathways
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/pathways` | — | List pathways |
| GET | `/api/pathways/:id` | — | Pathway + courses |
| POST | `/api/pathways` | Admin | Create pathway |
| PUT | `/api/pathways/:id` | Admin | Update pathway |
| DELETE | `/api/pathways/:id` | Admin | Delete pathway |
| POST | `/api/pathways/:id/enroll` | Bearer | Enroll in pathway |

### Communities
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/communities` | — | List communities |
| GET | `/api/communities/:id` | — | Community + posts |
| POST | `/api/communities` | Admin | Create community |
| PUT | `/api/communities/:id` | Admin | Update community |
| DELETE | `/api/communities/:id` | Admin | Delete community |
| POST | `/api/communities/:id/join` | Bearer | Join community |
| POST | `/api/communities/:id/posts` | Bearer | Post to community |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/stats` | Admin | Platform statistics |
| GET | `/api/users` | Admin | All users |
| PUT | `/api/users/:id` | Bearer | Update profile |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Upload (Course Cover Photos)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload` | Admin | Upload image to R2 (multipart, field: `file`) |
| GET | `/api/images/*` | — | Serve image from R2 |

### AI Assistant
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/chat` | Bearer | Keyword-based course recommendations |

---

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev              # wrangler dev on http://localhost:8787

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # Vite on http://localhost:5173
```

The frontend `.env.development` already points to `http://localhost:8787`.  
For local D1, run migrations without `--remote`:
```bash
cd backend
.\node_modules\.bin\wrangler d1 execute futureteacher-db --file=migrations/0001_schema.sql
.\node_modules\.bin\wrangler d1 execute futureteacher-db --file=migrations/0002_seed.sql
```

---

## Deployment

```bash
# 1. Deploy backend Worker
cd backend
.\node_modules\.bin\wrangler deploy

# 2. Build frontend (embed Worker URL)
cd frontend
$env:VITE_API_URL="https://futureteacher-api.yuhaousa.workers.dev"
npm run build

# 3. Deploy frontend to Pages
..\backend\node_modules\.bin\wrangler pages deploy dist --project-name=futureteacher --branch=main
```

---

## Database Schema (D1)

```
users               — id, name, email, password_hash, role, avatar, bio
courses             — id, title, description, category, modality, level, duration_hours, image_url, instructor_id, enrolled_count, rating, status
course_modules      — id, course_id, title, description, content, order_index, duration_mins
competency_tags     — id, course_id, tag
enrollments         — id, user_id, course_id, progress, enrolled_at, completed_at
module_progress     — id, user_id, module_id, completed, completed_at
discussions         — id, course_id, community_id, user_id, content, parent_id, created_at
communities         — id, name, description, category, image_url, member_count, created_by
community_members   — id, community_id, user_id, joined_at
learning_pathways   — id, title, description, category, level, duration_hours, image_url, created_by
pathway_courses     — id, pathway_id, course_id, order_index
pathway_enrollments — id, user_id, pathway_id, enrolled_at
```

---

## Technology Choices

| Concern | Solution | Reason |
|---------|----------|--------|
| HTTP framework | Hono v4 | Workers-native, fast, ESM |
| JWT | jose v5 | Uses Web Crypto API (Workers-compatible) |
| Password hashing | PBKDF2 via `crypto.subtle` | Workers-compatible (no bcrypt) |
| Database | Cloudflare D1 (SQLite) | Serverless SQL, Workers-native |
| File storage | Cloudflare R2 | S3-compatible, zero egress fees |
| Frontend | React 18 + Vite | Fast builds, SPA |
| Hosting | Cloudflare Pages | Global CDN, free tier |
