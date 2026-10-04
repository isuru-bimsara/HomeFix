# Home Service Backend

Express and Sequelize API for the Homefix home-service platform.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies with `npm install`.
3. Start the API with `npm run dev` or `npm start`.

The API is available at `http://localhost:5000` by default.

## Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile/me` (Bearer token required)
- `PATCH /api/profile/me` (Bearer token required)
- `POST /api/profile/avatar` (Bearer token and Cloudinary configuration required)
