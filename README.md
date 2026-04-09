# BlogCraft — MERN Blog Management System

git remote add origin https://github.com/saadafzal87/BlogCraft_backend.git.

## Tech Stack

### Backend
- **Node.js + Express** with TypeScript
- **MongoDB + Mongoose** with text indexes and aggregation pipelines
- **JWT** — access token (15min, in-memory) + refresh token (7 days, httpOnly cookie)
- **Bcryptjs** with salt rounds = 12
- **Cloudinary & Multer** for image uploads
- **Joi** for input validation
- **Helmet + CORS + Rate Limiting** for security

### Frontend
- **React 18 + TypeScript** with Vite
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- **React Router v6** for routing
- **Axios** with request/response interceptors for silent token refresh
- **Zod** for form validation
- **Context API** for global auth and post state

## Security Model

| Layer | Implementation |
|-------|---------------|
| Access Token | 15-min JWT, stored in JS memory only |
| Refresh Token | 7-day JWT, httpOnly + Secure + SameSite=Strict cookie |
| Token Rotation | New refresh token issued on every refresh |
| Reuse Detection | All tokens invalidated if reuse detected |
| Password Hashing | bcrypt with salt rounds = 12 |
| Input Sanitisation | Joi (backend) + Zod (frontend) |
| CORS | Whitelisted origin with credentials |
| Rate Limiting | 20 req/15min on auth routes, 200 req/15min general |

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017

### Backend Setup

```bash
cd backend
npm install
# Edit .env with your secrets
npm run dev
```


### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```


## API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public (cookie) |
| POST | `/api/auth/logout` | Authenticated |
| GET  | `/api/auth/me` | Authenticated |

### Posts
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/posts?search=&page=&limit=&tags=` | Public |
| GET | `/api/posts/user/my` | Authenticated |
| GET | `/api/posts/:id` | Public |
| POST | `/api/posts` | Author / Admin |
| PUT | `/api/posts/:id` | Owner / Admin |
| DELETE | `/api/posts/:id` | Owner / Admin |
| PATCH | `/api/posts/:id/status` | Owner / Admin |

### Comments
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/posts/:id/comments` | Public |
| POST | `/api/posts/:id/comments` | Authenticated |

### Stats
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/stats/posts` | Admin only |

## Features

### Backend
- ✅ JWT authentication with refresh token rotation
- ✅ Role-based access control (admin / author)
- ✅ Full-text search with MongoDB text indexes
- ✅ Pagination with configurable page/limit
- ✅ MongoDB aggregation for platform statistics
- ✅ Centralised error handling (AppError + asyncHandler)
- ✅ Joi validation with `stripUnknown` for input sanitisation

### Frontend
- ✅ Silent refresh via Axios response interceptor
- ✅ Concurrent request queuing during refresh
- ✅ Optimistic updates (create, update, delete, status toggle)
- ✅ Debounced search input
- ✅ `useAuth`, `usePosts`, `useForm` custom hooks
- ✅ `withAuth` HOC + `ProtectedRoute` component
- ✅ Class-based `ErrorBoundary`
- ✅ Responsive dark-mode UI with Tailwind v4


