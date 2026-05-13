# API Reference

Base URL: `https://YOUR-BACKEND.vercel.app/api`

All protected endpoints require: `Authorization: Bearer <accessToken>`

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register student or trainer |
| POST | `/auth/login` | Public | Login, returns access token + sets refresh cookie |
| POST | `/auth/refresh` | Cookie | Refresh access token |
| POST | `/auth/logout` | Auth | Logout, clears refresh token |
| GET | `/auth/me` | Auth | Get current user |
| PATCH | `/auth/change-password` | Auth | Change password |

## Courses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/courses` | Public | List published courses (search, filter, paginate) |
| GET | `/courses/:slug` | Public | Get course detail with curriculum |
| POST | `/courses` | Trainer | Create draft course |
| PATCH | `/courses/:id` | Trainer/Admin | Update course |
| PATCH | `/courses/:id/status` | Trainer/Admin | Publish / unpublish |
| DELETE | `/courses/:id` | Trainer/Admin | Archive course |

## Lessons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/lessons` | Trainer | Create lesson (pass `youtubeUrl` for YouTube) |
| PATCH | `/lessons/:id` | Trainer | Update lesson |
| DELETE | `/lessons/:id` | Trainer | Delete lesson |
| GET | `/lessons/:id/stream-url` | Auth | Get playback token (YouTube) or signed URL |
| GET | `/lessons/:id/playback-frame?token=` | Auth | Server-rendered secure YouTube player HTML |

## Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-order` | Student | Create Razorpay order |
| POST | `/payments/verify` | Student | Verify payment signature + enroll |
| GET | `/payments/my-transactions` | Auth | List my transactions |
| POST | `/webhooks/razorpay` | Public (signed) | Razorpay webhook |

## Certificates

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/certificates/:courseId/eligibility` | Student | Check eligibility |
| GET | `/certificates/:courseId/download` | Student | Download PDF certificate |
