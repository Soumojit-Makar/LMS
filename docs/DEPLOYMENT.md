# Deployment Guide — Digitalindian Skill Academy LMS

## Prerequisites

| Service | Purpose | URL |
|---------|---------|-----|
| MongoDB Atlas | Database | cloud.mongodb.com |
| Cloudinary | Media storage | cloudinary.com |
| Razorpay | Payments | razorpay.com |
| Vercel | Hosting | vercel.com |
| pnpm | Package manager | pnpm.io |

---

## Step 1 — MongoDB Atlas Setup

1. Create a free M0 cluster (or M10 for production)
2. Create a database user with password
3. Set Network Access to `0.0.0.0/0` (Vercel uses dynamic IPs)
4. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/lms`

---

## Step 2 — Cloudinary Setup

1. Note your Cloud Name, API Key, API Secret from dashboard
2. Create these folders in your Media Library:
   - `lms/lessons/videos`
   - `lms/lessons/pdfs`
   - `lms/thumbnails`
   - `lms/avatars`
3. Set delivery type for `lms/lessons/videos` to **Authenticated**
4. Enable auto-quality (`q_auto`) and auto-format (`f_auto`) transforms

---

## Step 3 — Razorpay Setup

1. Complete KYC and activate your account
2. Navigate to Settings → API Keys → Generate Live Keys
3. Create a webhook:
   - URL: `https://YOUR-BACKEND.vercel.app/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`
4. Copy the webhook secret

---

## Step 4 — Deploy Backend to Vercel

```bash
cd backend

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your real credentials

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Answer prompts:
# Project name: digitalindian-lms-api
# Root directory: ./  (already in /backend)

# Set ALL production environment variables
vercel env add MONGODB_URI production
vercel env add JWT_ACCESS_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add JWT_ACCESS_EXPIRES production   # 15m
vercel env add JWT_REFRESH_EXPIRES production  # 30d
vercel env add CORS_ORIGIN production          # https://digitalindian-lms.vercel.app
vercel env add APP_URL production              # https://digitalindian-lms-api.vercel.app
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production
vercel env add RAZORPAY_KEY_ID production
vercel env add RAZORPAY_KEY_SECRET production
vercel env add RAZORPAY_WEBHOOK_SECRET production
vercel env add MEDIA_PROVIDER production       # cloudinary
vercel env add PAYMENT_PROVIDER production     # razorpay

# Deploy to production
vercel --prod
```

---

## Step 5 — Deploy Frontend to Vercel

```bash
cd frontend

cp .env.example .env.local
# Set VITE_API_BASE_URL=https://digitalindian-lms-api.vercel.app/api

vercel

# Project name: digitalindian-lms
# Root directory: ./

# Set env vars
vercel env add VITE_APP_NAME production        # Digitalindian Skill Academy
vercel env add VITE_API_BASE_URL production    # https://digitalindian-lms-api.vercel.app/api
vercel env add VITE_RAZORPAY_KEY_ID production # rzp_live_xxxxxxxxxx
vercel env add VITE_CLOUDINARY_CLOUD_NAME production

vercel --prod
```

---

## Step 6 — Create Admin Account

```bash
cd backend
ADMIN_EMAIL=admin@digitalindian.in ADMIN_PASSWORD=YourSecurePass123! pnpm seed:admin
```

---

## Step 7 — Update CORS

After frontend deploys, update `CORS_ORIGIN` in backend Vercel env:
```
https://digitalindian-lms.vercel.app
```
Redeploy backend: `cd backend && vercel --prod`

---

## Step 8 — Verify

1. Visit `https://YOUR-BACKEND.vercel.app/api/health` → `{"status":"ok"}`
2. Visit `https://YOUR-FRONTEND.vercel.app` → Home page loads
3. Register as student → Login works
4. Register as trainer → Pending approval message
5. Admin login → Approve trainer
6. Trainer creates a course with YouTube lesson
7. Student enrolls → Views the secure YouTube player

---

## Local Development

```bash
pnpm install
cp backend/.env.example backend/.env.local   # fill in dev credentials
cp frontend/.env.example frontend/.env.local

# Terminal 1
pnpm dev:backend    # http://localhost:5000

# Terminal 2
pnpm dev:frontend   # http://localhost:5173
```

---

## Environment Variables Reference

### Backend

| Variable | Example | Required |
|----------|---------|----------|
| `NODE_ENV` | `production` | Yes |
| `MONGODB_URI` | `mongodb+srv://...` | Yes |
| `JWT_ACCESS_SECRET` | 64-char random | Yes |
| `JWT_REFRESH_SECRET` | 64-char random (different) | Yes |
| `JWT_ACCESS_EXPIRES` | `15m` | Yes |
| `JWT_REFRESH_EXPIRES` | `30d` | Yes |
| `CORS_ORIGIN` | Frontend URL | Yes |
| `APP_URL` | Backend URL | Yes |
| `CLOUDINARY_CLOUD_NAME` | `digitalindian` | Yes |
| `CLOUDINARY_API_KEY` | From dashboard | Yes |
| `CLOUDINARY_API_SECRET` | From dashboard | Yes |
| `RAZORPAY_KEY_ID` | `rzp_live_xxx` | Yes |
| `RAZORPAY_KEY_SECRET` | From dashboard | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | From webhook settings | Yes |
| `MEDIA_PROVIDER` | `cloudinary` | Yes |
| `PAYMENT_PROVIDER` | `razorpay` | Yes |

### Frontend

| Variable | Example |
|----------|---------|
| `VITE_APP_NAME` | `Digitalindian Skill Academy` |
| `VITE_API_BASE_URL` | `https://api.vercel.app/api` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_xxx` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `digitalindian` |
