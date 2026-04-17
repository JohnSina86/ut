# ut-api

Backend API for the United Tyres Dundrum booking system. This service provides REST endpoints consumed by the React front‑end in `../ut-front`.

## Stack
- Node.js + TypeScript
- Express for routing
- TypeORM for database abstraction (MySQL)
- dotenv for configuration
- zod for input validation
- JWT & bcryptjs for authentication

## Architecture

**MVC + Modular**:
- Each feature lives in its own module under `src/modules/` with:
  - `*.entity.ts` – TypeORM entity (database model)
  - `*.service.ts` – business logic & data access
  - `*.controller.ts` – HTTP request handlers
  - `*.routes.ts` – Express router

- `src/common/` – shared utilities (auth middleware, etc.)
- `src/migrations/` – database migrations (TypeORM)

## Getting started

1. Install dependencies:
   ```bash
   cd ut-api
   npm install
   ```

2. Copy and configure environment:
   ```bash
   cp .env.example .env
   # Update DB_HOST, DB_USER, DB_PASS, DB_NAME as needed
   ```

3. Run migrations to set up the database:
   ```bash
   npm run migrate
   # or manually import src/migrations/1688547600000-InitialSchema.ts
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:4000` by default.

## API Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/register` | POST | – | User registration |
| `/api/auth/login` | POST | – | Login & get JWT token |
| `/api/vehicles` | GET | ✓ | List user's vehicles |
| `/api/vehicles` | POST | ✓ | Add a vehicle |
| `/api/services` | GET | – | List available services |
| `/api/services` | POST | ✓ | Create service (admin) |
| `/api/appointments` | GET | ✓ | List user's appointments |
| `/api/appointments` | POST | ✓ | Book an appointment |
| `/api/transactions` | POST | ✓ | Record payment |
| `/api/transactions/:appointmentId` | GET | ✓ | Get payments for appointment |
| `/api/settings/:key` | GET | – | Get business setting |
| `/api/settings` | POST | ✓ | Update business setting (admin) |

## Database

The schema is version-controlled as TypeORM migrations in `src/migrations/`. Tables include:

- `users` – customer accounts
- `user_providers` – social login (Google, Apple)
- `vehicles` – user's vehicles (basic info)
- `vehicle_specs` – cached detailed specs (Tier 2)
- `vehicle_lookup_cache` – cached vehicle lookups (Tier 1)
- `services` – tyre, maintenance, repair offerings
- `appointments` – bookings
- `transactions` – payments/invoices
- `business_settings` – config (hours, holidays, etc.)

## To-Do / Features to implement

- [ ] Password hashing (bcryptjs integration)
- [ ] JWT token verification
- [ ] Tier 1 API: Scrape MyVehicle.ie or call VehicleRegistrationAPI
- [ ] Tier 2 API: Integrate CarQuery for detailed specs
- [ ] Caching logic (check `vehicle_lookup_cache` before scraping)
- [ ] Social login via `user_providers` table
- [ ] Authorization (check user ownership before returning data)
- [ ] Validation middleware on request bodies
- [ ] Queue system for background spec fetching
- [ ] Error handling & logging

