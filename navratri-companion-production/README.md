# Navratri Companion — Production Application

Navratri Companion is a specialized platform connecting Navratri Garba enthusiasts with verified companions and event hosts in Gujarat.

## Architecture

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend API:** Vercel Serverless Functions (`/api/*`)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Storage:** Supabase Storage (Public profile photos, private KYC documents)
- **Authentication:** Scrypt-hashed credentials & HMAC-SHA256 session tokens with server-side authorization guards

## Deployment on Vercel

### Build Settings
- **Framework Preset:** Vite
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Environment Variables
Configure the following in Vercel Project Settings -> Environment Variables:

| Variable | Description |
| :--- | :--- |
| `SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_URL` | Supabase Project URL for client |
| `SUPABASE_ANON_KEY` | Supabase Public Anonymous Key |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anonymous Key for client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key (Server only) |
| `MASTER_ADMIN_PASSWORD` | Master Platform Operations Admin Password |
| `MASTER_ADMIN_USER_ID` | Master Admin User ID (e.g. `parthjunior23`) |
| `MASTER_ADMIN_EMAIL` | Master Admin Email (e.g. `owner@navratricompanion.com`) |
| `AUTH_SECRET` | 64+ char secret for JWT session token signing |
| `JWT_SECRET` | 64+ char secret for JWT session token signing |
| `VITE_UPI_ID` | Platform registration fee receiver UPI ID (`9974203300@okbizaxis`) |
| `VITE_UPI_NAME` | Platform receiver name (`Navratri Companion`) |
| `NODE_ENV` | `production` |

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start local development server
npm run dev

# 4. Production build check
npm run build
```
