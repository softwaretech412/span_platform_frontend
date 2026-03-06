# Span28 Frontend

Next.js application for the Span28 Australian outdoor structure configurator. Users can register and log in, use a dashboard hub, search an address, view council compliance rules, configure a structure (dimensions, attachment type), see a 3D preview, validate against council limits, and create quotes with BOM and supplier info.

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, TypeScript, Tailwind CSS
- **3D:** React Three Fiber, Three.js, @react-three/drei
- **Maps:** Mapbox GL JS

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see `source/`); default base URL `http://localhost:3000`

## Setup

```bash
npm install
```

## Environment

Create a `.env.local` (or `.env`) in the frontend root:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:3000`). Omit for default. |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on **port 3001** |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 3001 |
| `npm run lint` | Run ESLint |

## Auth and dashboard

- **Login** (`/login`) and **Register** (`/register`) use the backend `POST /api/auth/login` and `POST /api/auth/register`. The access token is stored in `localStorage` under `span28_token`.
- **Dashboard** (`/dashboard`) is the post-login hub with links to Configurator, Admin, and Builder (view-only). Requires authentication.
- The **header** shows Log in / Register when signed out, or the user menu (Dashboard, Sign out) when signed in.

## Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (AuthProvider, Header)
│   ├── page.tsx             # Home / landing (hero, CTAs, features)
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── dashboard/           # Dashboard (post-login hub)
│   ├── configurator/
│   │   ├── page.tsx         # Main configurator
│   │   └── quote/[id]/
│   │       └── page.tsx     # Quote detail
│   └── admin/
│       └── page.tsx         # Admin dashboard
├── components/
│   └── configurator/
│       ├── AddressSearch.tsx   # Address input → location rules
│       ├── MapView.tsx         # Mapbox map + boundary
│       ├── ConfigSliders.tsx   # Dimensions, attachment, setback
│       ├── Structure3D.tsx    # R3F wrapper
│       ├── Structure3DPreview.tsx  # 3D structure mesh
│       ├── ValidationBadge.tsx  # Compliance status & red flags
│       └── BOMQuote.tsx       # BOM, suppliers, create quote
└── lib/
    └── api.ts                 # API client (location, validate, quote)
```

## Configurator flow

1. **Address** — Enter address; app calls backend `POST /api/location/rules` for geocode, council rules, and optional boundary.
2. **Map** — Mapbox shows the location and property boundary when available.
3. **Configure** — Set width, depth, height, attachment type, post size, rear setback.
4. **Validate** — `POST /api/configurator/validate-full` returns compliance, BOM, and nearest suppliers.
5. **Quote** — Submit customer details to create a quote; redirect to quote detail page.

## API dependency

The frontend expects the Span28 backend to be running with at least:

- `POST /api/location/rules` — address → location + council limits
- `POST /api/configurator/validate-full` — full validation + BOM + suppliers
- `GET /api/configurator/products`
- `POST /api/configurator/quote` — create quote
- Admin and quote-by-id endpoints if using `/admin` and `/configurator/quote/[id]`

Run the backend from the `source/` directory (`npm run dev` on port 3000 by default).
