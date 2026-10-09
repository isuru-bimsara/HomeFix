# HomeFix

HomeFix is a full-stack home-service booking platform that connects customers with verified service providers and insurance partners. It includes a cross-platform mobile application, a REST API, and a web-based administration console.

## Applications

| Application | Purpose | Main technologies |
| --- | --- | --- |
| `mobile/` | Customer, service-provider, and insurance-partner application | Expo 57, React Native, Expo Router, NativeWind, Axios |
| `backend/` | Authentication, bookings, messaging, reviews, claims, media, and notifications API | Node.js, Express 5, Sequelize, PostgreSQL |
| `admin-web/` | Platform administration dashboard | Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query |

## Main features

### Customer

- Register with email verification or Google Sign-In
- Search and view service-provider profiles, rates, ratings, and reviews
- Create, confirm, update, and cancel pending bookings
- Attach photos to booking requests
- Follow booking progress and scheduled service date/time
- Message providers directly or within a booking
- Submit, edit, and delete provider reviews
- Receive in-app and device notifications
- Manage profile photo, account details, and password

### Service provider

- Maintain a provider profile, service category, experience, location, hourly rate, and profile photo
- Receive and manage customer booking requests
- Move bookings through `PENDING -> ACCEPTED -> WORKING -> COMPLETED`
- Schedule an accepted booking using a future date and time
- Add completion notes and completion photos
- Message customers and receive activity notifications
- Create and manage insurance claims with evidence photos
- View earnings, booking metrics, and recent activity

### Insurance partner

- View assigned and available insurance claims
- Review evidence and claimant details
- Move claims through `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, and `SETTLED`
- Record reviewer identity and review date/time
- Update company details and profile image
- Receive claim notifications

### Administrator

- View platform statistics and operational records
- Manage all users, customers, providers, and insurance partners
- Create administrator and insurance-partner accounts
- Ban and unban users
- Review bookings, ratings, and insurance claims

## Architecture

```mermaid
flowchart LR
    Mobile[Expo mobile app] -->|HTTPS / JSON + multipart| API[Express REST API]
    Admin[Next.js admin console] -->|HTTPS / JSON| API
    API --> DB[(PostgreSQL)]
    API --> Cloudinary[Cloudinary media storage]
    API --> Gmail[Gmail / Nodemailer OTP]
    API --> Google[Google identity verification]
    API --> Expo[Expo Push Service]
```

Authentication uses short-lived JWT access tokens. Passwords are hashed with bcrypt, mobile tokens are stored with Expo SecureStore, and protected API routes enforce role-based access.

## Project structure

```text
Homefix/
|-- backend/
|   |-- src/
|   |   |-- config/          # Database and Cloudinary configuration
|   |   |-- controllers/     # Request handlers
|   |   |-- middleware/      # Authentication, authorization, uploads, limits
|   |   |-- migrations/      # Compatibility migrations run during startup
|   |   |-- models/          # Sequelize models and associations
|   |   |-- routes/          # REST API routes
|   |   |-- services/        # OTP, notifications, and image services
|   |   `-- server.js        # API entry point
|   `-- package.json
|-- mobile/
|   |-- assets/
|   |-- lib/                 # API clients, auth storage, and domain helpers
|   |-- src/
|   |   |-- app/             # Expo Router screens grouped by role
|   |   `-- components/      # Shared UI components
|   |-- app.json
|   |-- eas.json
|   `-- package.json
|-- admin-web/
|   |-- src/
|   |   |-- app/             # Next.js App Router pages
|   |   |-- components/      # Dashboard UI
|   |   |-- hooks/
|   |   |-- lib/             # API and session utilities
|   |   `-- types/
|   `-- package.json
`-- README.md
```

## Prerequisites

- Node.js 20 LTS or newer
- npm
- PostgreSQL database (the current database configuration expects SSL)
- Cloudinary account for uploaded images
- Gmail account with an App Password for OTP emails
- Google Cloud OAuth clients for native Google Sign-In
- Expo account and EAS CLI for development/preview/production builds

## Environment configuration

Never commit real passwords, API secrets, database URLs, App Passwords, or OAuth client secrets. If a secret has been shared publicly or committed previously, rotate it before deploying.

### Backend

Create `backend/.env`:

```dotenv
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require

JWT_ACCESS_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRES_IN=45m
REFRESH_TOKEN_DAYS=30

GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_IDS=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com,YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
# Only required by a server-side OAuth flow that uses the client secret:
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET

CORS_ORIGIN=http://localhost:3000,http://YOUR_COMPUTER_IP:3000

EMAIL_TRANSPORT=gmail
EMAIL_USER=your-address@gmail.com
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD
EMAIL_FROM=your-address@gmail.com
OTP_EXPIRES_MINUTES=10
OTP_RESEND_SECONDS=60
OTP_MAX_ATTEMPTS=5

MESSAGE_RETENTION_HOURS=24
MESSAGE_EDIT_MINUTES=5
MESSAGE_MAX_IMAGES=3
CRON_SECRET=replace-with-another-long-random-secret

# Sri Lanka is UTC+05:30 (330 minutes).
SERVICE_TIMEZONE_OFFSET_MINUTES=330
```

Generate secrets with a password manager or a cryptographically secure random generator. Do not reuse the JWT and cron secrets.

### Mobile app

Copy `mobile/.env.example` to `mobile/.env` and update it:

```dotenv
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

Use the computer's LAN IPv4 address instead of `localhost` when testing on a physical phone. The phone and development computer must be on the same network, and the firewall must allow port `5000`.

For a hosted API, use an HTTPS address such as:

```dotenv
EXPO_PUBLIC_API_URL=https://your-api.example.com/api
```

The Google button uses a native module and therefore does **not** work inside Expo Go. Install a development, preview, or production build to test Google Sign-In.

### Admin console

Create `admin-web/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For deployment, set this to the public HTTPS API URL and add the admin site's origin to `CORS_ORIGIN` in the backend.

## Local development

Open three terminals from the repository root.

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API starts on `http://localhost:5000`. Confirm it is available:

```text
GET http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Home Service API is running."
}
```

On startup, the API authenticates with PostgreSQL, synchronizes Sequelize models, and executes the included compatibility migrations. Back up production data before schema changes.

### 2. Start the mobile app

```bash
cd mobile
npm install
npx expo start -c
```

Expo Go can be used for most UI and API development. Native Google Sign-In requires a custom build.

### 3. Start the admin dashboard

```bash
cd admin-web
npm install
npm run dev
```

Open `http://localhost:3000`. Only a user with the `ADMIN` role can enter the dashboard.

## Google Sign-In setup

1. Create or select a project in Google Cloud Console.
2. Configure the OAuth consent screen.
3. Create a **Web application** OAuth client. Use its client ID as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and include it in backend `GOOGLE_CLIENT_IDS`.
4. Create an **Android** OAuth client using package name `com.homefix.app`.
5. Add the SHA-1 fingerprints for every signing certificate used by development, preview, and production builds.
6. Add the Android client ID to backend `GOOGLE_CLIENT_IDS`.
7. Rebuild the app whenever native configuration or native dependencies change.

Useful EAS commands:

```bash
cd mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile production
```

The `preview` profile creates an installable APK. The `production` profile is intended for store distribution.

## Authentication flows

### Email registration

1. The customer or provider submits role-specific registration details.
2. The backend creates an unverified account and emails a six-digit OTP.
3. The user verifies the OTP before its expiry time.
4. The backend marks the account as verified and returns an authenticated session.

Expired registrations can request a new OTP. Insurance-partner and administrator accounts are created by an administrator and are verified immediately.

### Password reset

Password recovery is available to customer and service-provider accounts. A valid password-reset OTP is required before a new bcrypt password hash is stored.

### Google registration and login

- A new Google account selects a supported role and completes the corresponding profile once.
- A previously registered Google account signs in directly without repeating registration.
- The backend validates Google ID tokens against the configured client ID allow-list.

## API overview

All application endpoints use the `/api` prefix.

| Prefix | Responsibility |
| --- | --- |
| `/api/auth` | Registration, OTP verification, login, Google auth, password reset |
| `/api/profile` | Current user's account and profile image |
| `/api/providers` | Provider search and public provider details |
| `/api/booking` | Customer bookings and provider booking workflow |
| `/api/reviews` | Provider reviews and rating summaries |
| `/api/messages` | Direct and booking conversations, image messages, edit/delete |
| `/api/insurance-claims` | Provider claims and insurance-partner decisions |
| `/api/notifications` | Notification list, read state, device registration, deletion |
| `/api/admin` | Admin overview and platform management |

Protected routes expect:

```http
Authorization: Bearer <access-token>
```

Image endpoints use `multipart/form-data`; other API requests generally use JSON.

## Creating the first administrator

Use a bcrypt hash; never store a plain password. From `backend/`, generate a hash:

```bash
node -e "require('bcryptjs').hash('CHANGE_THIS_PASSWORD', 12).then(console.log)"
```

Then insert the account in PostgreSQL, replacing the email and generated hash:

```sql
INSERT INTO users (
  id, email, password_hash, auth_provider, role, account_status,
  is_verified, is_active, profile_image_source, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'PASTE_GENERATED_BCRYPT_HASH_HERE',
  'LOCAL',
  'ADMIN',
  'REGISTERED',
  TRUE,
  TRUE,
  'NONE',
  NOW(),
  NOW()
);
```

After the first administrator signs in, additional operational accounts can be created from the admin console.

## Production checklist

- Use HTTPS for both the API and admin dashboard.
- Replace every example secret and rotate any previously exposed credentials.
- Restrict `CORS_ORIGIN` to trusted web origins.
- Use separate Google OAuth credentials for each application/signing environment.
- Configure production Cloudinary restrictions and Gmail/App Password access.
- Configure EAS environment variables for the selected build profile.
- Back up PostgreSQL and test restore procedures.
- Disable verbose request logging where sensitive operational data could appear.
- Run the admin build before deployment: `cd admin-web && npm run build`.
- Test registration, OTP delivery, Google login, image uploads, notifications, and every role workflow against the deployed API.

## Troubleshooting

### Mobile app reports `Network Error`

- Confirm `GET /health` works from the computer.
- Use the computer's LAN IP, not `localhost`, on a physical device.
- Confirm both devices use the same network and port `5000` is allowed through the firewall.
- For an installed production app, use a publicly reachable HTTPS API.

### Google Sign-In fails or reports a developer error

- Do not test the native Google button in Expo Go.
- Confirm the Android package is `com.homefix.app`.
- Confirm the installed APK's signing SHA-1 matches the Android OAuth client.
- Confirm the web and Android client IDs are included in backend `GOOGLE_CLIENT_IDS`.
- Rebuild the APK after changing native configuration.

### Admin dashboard login fails

- Verify `NEXT_PUBLIC_API_URL` ends with `/api`.
- Confirm the backend is reachable and permits the dashboard origin through CORS.
- Confirm the account is active, verified, and has role `ADMIN`.

### OTP email is not delivered

- Use a Gmail App Password rather than the normal Gmail password.
- Check `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`.
- Check spam/junk folders and backend email errors.
- Respect the configured resend cooldown.

## Current quality notes

- The project currently has no automated test suite. Before a production release, add API integration tests and critical mobile/admin end-to-end tests.
- `sequelize.sync()` currently runs during API startup. A migration-only production deployment strategy is recommended as the schema matures.
- Keep generated build files, local `.env` files, and credentials out of version control.

## License

This repository does not currently include a root license file. Add an appropriate `LICENSE` before public redistribution.
