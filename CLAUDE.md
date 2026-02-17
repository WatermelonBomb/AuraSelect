# CLAUDE.md - AuraSelect Codebase Guide

## Project Overview

AuraSelect is a beauty salon product recommendation and trial management system. It allows customers to discover, try, and purchase beauty products while providing salon staff and admins with management tools. The UI language is Japanese.

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Backend:** FastAPI (Python 3.11+) with SQLAlchemy 2.0 async ORM
- **Database:** PostgreSQL (production) / SQLite (development)
- **Cache:** Redis
- **Styling:** Tailwind CSS 3 + shadcn/ui + custom luxury theme
- **State:** Zustand (client state) + TanStack React Query (server state)
- **Forms:** React Hook Form + Zod validation
- **Auth:** JWT via fastapi-users (backend), token in localStorage (frontend)
- **Infrastructure:** Docker Compose, Nginx reverse proxy, Vercel (frontend)

## Repository Structure

```
AuraSelect/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (QueryProvider, Toast)
│   ├── page.tsx                  # Home page (role-based routing)
│   ├── globals.css               # Global styles + CSS variables + theme
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── components/
│   ├── auth/                     # AuthGuard, LoginForm, RegisterForm
│   ├── data/                     # Static data (products, categories)
│   ├── forms/                    # ProductForm (react-hook-form + zod)
│   ├── hooks/                    # Component-level hooks
│   ├── pages/                    # Page wrappers (AdminPage, CustomerPage, StaffPage)
│   ├── reviews/                  # ProductReviews component
│   ├── ui/                       # shadcn/ui primitives + custom UI
│   ├── views/                    # Dashboard views (Admin, Customer, Staff, Unified)
│   ├── ClientOnly.tsx            # SSR-safe wrapper
│   ├── ProductManager.tsx        # Product CRUD interface
│   ├── TrialCartEnhanced.tsx     # Trial request cart
│   └── TrialRequestManager.tsx   # Trial request management
├── lib/
│   ├── api/                      # Axios API client modules (auth, products, trials, reviews)
│   ├── hooks/                    # App-level React hooks (useAuth, useProducts, useTrials, useReviews)
│   ├── providers/                # QueryProvider (React Query)
│   ├── schemas/                  # Zod validation schemas (auth, trial)
│   ├── store/                    # Zustand store (appStore.ts)
│   ├── utils/                    # Helpers (cn, fmtPrice, formatDate, toast utils)
│   └── types.ts                  # Shared TypeScript types
├── backend/
│   ├── main.py                   # FastAPI entry point
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend Docker image
│   ├── alembic.ini               # Migration config
│   ├── populate_products.py      # Seed script
│   ├── app/
│   │   ├── core/                 # Config (config.py) + database setup (database.py)
│   │   ├── auth/                 # fastapi-users JWT auth config
│   │   ├── models/               # SQLAlchemy models (user, product, trial_request)
│   │   ├── schemas/              # Pydantic DTOs (user, product, trial_request, common)
│   │   ├── crud/                 # Generic CRUD base + domain CRUD classes
│   │   └── api/v1/               # API route handlers (products, trial_requests, users)
│   ├── migrations/               # Alembic migration scripts
│   └── tests/                    # pytest tests (test_main, test_products_api)
├── scripts/                      # deploy.sh
├── nginx/                        # nginx.conf (reverse proxy, rate limiting)
├── docker-compose.yml            # Development services (postgres, redis, backend, pgadmin)
├── docker-compose.prod.yml       # Production services (+ frontend, nginx)
├── Dockerfile.prod               # Multi-stage Next.js production build
├── vercel.json                   # Vercel deployment config
├── middleware.ts                  # Next.js auth middleware (protected routes)
├── tailwind.config.ts            # Tailwind config with shadcn/ui theme
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js config (rewrites, webpack, image optimization)
├── tsconfig.json                 # TypeScript strict mode, path aliases
└── .eslintrc.json                # ESLint (next/core-web-vitals + next/typescript)
```

## Development Commands

### Frontend

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript type checking (tsc --noEmit)
npm run start        # Start production server
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py                                    # Start FastAPI (port 8000)
alembic upgrade head                              # Run migrations
alembic revision --autogenerate -m "description"  # Create migration
pytest                                            # Run tests
pytest --cov                                      # Tests with coverage
```

### Docker

```bash
docker-compose up -d                              # Start dev services
docker-compose -f docker-compose.prod.yml up -d   # Start production
./scripts/deploy.sh production                    # Full deployment script
```

## Key Architecture Decisions

### Frontend Data Flow

1. **API Layer** (`lib/api/`): Axios client with Bearer token interceptor. Base URL from `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`). All API modules export object literals with async methods.

2. **Hook Layer** (`lib/hooks/`): Custom hooks wrap API calls and provide loading/error states. All hooks gracefully fall back to mock data when the backend is unavailable. Hooks expose `mutateAsync` for React Query mutation compatibility.

3. **Store** (`lib/store/appStore.ts`): Zustand store with persist middleware. Holds UI state (theme, sidebar, filters), trial cart, and product data. Only `theme` and `notifications` are persisted to localStorage.

4. **Components**: Views compose smaller UI components. Role-based rendering in the root page routes to AdminPage, CustomerPage, or StaffPage.

### Backend Architecture

- **Generic CRUD Base**: `CRUDBase[ModelType, CreateSchemaType, UpdateSchemaType]` in `app/crud/base.py` provides standard operations. Domain CRUDs extend it.
- **Schema Pattern**: `Base → Create → Update → Response` Pydantic models in `app/schemas/`.
- **Auth**: fastapi-users handles JWT login/register. Routes at `/api/v1/auth/jwt` and `/api/v1/auth`. Many API endpoints have TODO comments for adding auth dependencies.
- **API Versioning**: All routes under `/api/v1/`.

### Authentication Flow

- Login sends credentials to FastAPI, receives JWT token
- Token stored in `localStorage` under `auth-token`
- Axios interceptor attaches `Authorization: Bearer <token>` to all requests
- 401 responses trigger token cleanup and redirect to `/login`
- `AuthGuard` component wraps protected pages with role/permission checks
- Next.js middleware redirects unauthenticated users from `/admin`, `/staff`, `/profile`
- User roles: `admin`, `manager`, `stylist`, `customer`

## Coding Conventions

### TypeScript / React

- **File naming**: PascalCase for components (`ProductManager.tsx`), lowercase-hyphen for shadcn/ui (`dropdown-menu.tsx`), camelCase with `use` prefix for hooks (`useAuth.ts`)
- **Component pattern**: Functional components with `'use client'` directive where needed. `forwardRef` for UI primitives.
- **Props**: Interfaces with `Props` suffix (e.g., `AuthGuardProps`)
- **Imports**: Path alias `@/*` maps to project root
- **Styling**: Tailwind utility classes. Use `cn()` from `lib/utils` for conditional class merging (clsx + tailwind-merge).
- **Custom CSS classes**: `luxury-gradient`, `glass-effect`, `luxury-shadow`, `luxury-shadow-lg`, `rose-gold-gradient`, `luxury-text-gradient`, `font-playfair`
- **Forms**: Always use react-hook-form with Zod schema validation
- **Toasts**: Use helpers from `lib/utils/toast.ts` (`showSuccess`, `showError`, `showApiError`, etc.)
- **Validation messages**: Written in Japanese
- **Currency**: JPY formatting via `fmtPrice()` from `lib/utils`
- **Date formatting**: Japanese locale via `formatDate()` from `lib/utils`

### Python / Backend

- **Code style**: black + isort + flake8
- **Models**: SQLAlchemy 2.0 declarative with `mapped_column`. Use `TimestampMixin` for `created_at`/`updated_at`.
- **Schemas**: Pydantic v2 with field validators and `model_config`
- **CRUD**: Extend `CRUDBase` for new entities
- **API routes**: Each domain gets its own file under `app/api/v1/`
- **Async**: All database operations use async/await with `AsyncSession`

### Git Conventions

Commit messages follow conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code restructuring
- PRs merged from feature branches into `main`

## UI Component Library

### shadcn/ui Components (in `components/ui/`)

Button, Card, Input, Textarea, Label, Checkbox, Switch, Badge, Alert, Separator, Dialog, Dropdown Menu, Select, Tabs

### Custom UI Components

- `QuickStats` - Statistics card with icon, value, trend display, and color variants
- `ActivityFeed` - Timeline component for trial request activity
- `ShampooIcon` - Custom SVG icon

### Adding New shadcn/ui Components

Config is in `components.json`. The setup uses:
- Style: default
- RSC: true
- CSS variables: true
- Icon library: lucide
- Aliases: `@/components/ui`, `@/lib/utils`, `@/lib`, `@/hooks`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `DATABASE_URL` | PostgreSQL connection string | SQLite fallback |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `POSTGRES_PASSWORD` | PostgreSQL password | - |

## API Endpoints (Backend)

### Products (`/api/v1/products`)
`GET /`, `GET /search`, `GET /featured`, `GET /low-stock`, `GET /{id}`, `POST /`, `PUT /{id}`, `PATCH /{id}/stock`, `PATCH /{id}/status`, `PATCH /{id}/featured`, `DELETE /{id}`

### Trial Requests (`/api/v1/trial-requests`)
`GET /`, `GET /pending`, `GET /active`, `GET /stats`, `GET /feedback-needed`, `GET /{id}`, `GET /customer/{id}`, `GET /product/{id}`, `POST /`, `PUT /{id}`, `PATCH /{id}/status`, `PATCH /{id}/staff-update`, `POST /{id}/feedback`, `PATCH /{id}/approve`, `PATCH /{id}/reject`, `PATCH /{id}/complete`

### Users (`/api/v1/users`)
`GET /`, `GET /me`, `PUT /me`, `POST /me/change-password`, `GET /{id}`, `POST /`, `PUT /{id}`, `PATCH /{id}/verify`, `PATCH /{id}/deactivate`, `PATCH /{id}/activate`, `GET /role/customers`, `GET /role/staff`, `POST /authenticate`

### Auth (`/api/v1/auth`)
`POST /jwt/login`, `POST /register`, user management via fastapi-users

## Testing

### Backend Tests
Located in `backend/tests/`. Uses pytest with in-memory SQLite and FastAPI TestClient. Run with `pytest` from the `backend/` directory.

### Frontend
No test runner configured in package.json currently. The project uses TypeScript strict mode and ESLint for static analysis.

## Common Tasks

### Adding a new frontend page
1. Create directory under `app/` with `page.tsx`
2. Add `'use client'` if client-side interactivity is needed
3. Wrap with `AuthGuard` if authentication is required

### Adding a new API domain
1. Create model in `backend/app/models/`
2. Create schemas in `backend/app/schemas/`
3. Create CRUD class extending `CRUDBase` in `backend/app/crud/`
4. Create route handler in `backend/app/api/v1/`
5. Register router in `backend/app/api/v1/__init__.py`
6. Generate migration: `alembic revision --autogenerate -m "add <entity>"`
7. Create API client in `lib/api/`
8. Create hook in `lib/hooks/`

### Adding a shadcn/ui component
Use the shadcn CLI or manually add to `components/ui/` following existing patterns. Ensure the component uses `cn()` for class merging and follows the `forwardRef` pattern.

## Known Considerations

- ESLint is ignored during builds (`next.config.mjs`: `ignoreDuringBuilds: true`)
- TypeScript errors block production builds (`ignoreBuildErrors: false`)
- `next.config.mjs` has a catch-all rewrite (`/(.*) → /`) for SPA-style routing
- Console logs are stripped in production via the Next.js compiler
- Many backend API endpoints still have TODO markers for adding authentication guards
- Frontend hooks fall back to mock data when the API is unreachable, enabling frontend-only development
- `lib/utils/test-utils.tsx` is excluded from TypeScript compilation in `tsconfig.json`
- Node.js requirement: `>=18.18.0`
