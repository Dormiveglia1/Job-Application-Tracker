# CareerFlow — Job Application Tracker

CareerFlow is a full-stack web application for organizing job applications, tracking their progress, and monitoring job-search performance.

It supports secure account-based data isolation, application lifecycle management, interview scheduling, archive management, and dashboard analytics.

## Features

- JWT-based registration, login, protected routes, and sign out
- Create, view, edit, and delete job applications
- Track company, role, category, application date, source, location, salary, notes, and job-posting URL
- Manage application statuses: Applied, Interview, Offer, Rejected, and Withdrawn
- Schedule the next interview with an in-app date/time picker
- Archive and restore records separately from workflow status
- Search, filter, sort, paginate, and optionally include archived applications
- Open job postings directly from the application list
- Dashboard metrics for application volume, interviews, offers, interview rate, monthly trends, category distribution, status counts, and the next upcoming interview

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express, REST API |
| Authentication | JSON Web Tokens, bcryptjs |
| Database | MySQL 8, mysql2 |
| Local tooling | npm, nodemon, ESLint |

## Project Structure

```text
Job-Application-Tracker/
├── client/                         # React + Vite frontend
│   └── src/
│       ├── components/             # Reusable UI components
│       ├── pages/                  # Login, dashboard, list, add, and edit pages
│       ├── services/               # API request helper
│       └── styles/                 # Shared CSS grouped by responsibility
├── server/                         # Express REST API
│   ├── database/
│   │   ├── schema.sql              # MySQL tables and indexes
│   │   └── 001-add-application-source.sql
│   └── src/
│       ├── config/                 # MySQL connection pool
│       ├── controllers/            # Request and business logic
│       ├── middleware/             # JWT authentication middleware
│       └── routes/                 # REST endpoints
└── README.md
```

## Local Setup

### 1. Create the MySQL database

Create a database named `careerflow`, then run the schema in MySQL Workbench or the MySQL command line:

```sql
CREATE DATABASE careerflow;
USE careerflow;
```

Run [`server/database/schema.sql`](server/database/schema.sql). If you are upgrading an earlier local database, run [`server/database/001-add-application-source.sql`](server/database/001-add-application-source.sql) afterward.

### 2. Configure the backend

```bash
cd server
copy .env.example .env
npm install
```

Update `server/.env` with your local MySQL credentials and a strong JWT secret:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=careerflow
DB_USER=root
DB_PASSWORD=your-local-password
JWT_SECRET=use-a-long-random-secret
```

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API Overview

All application and dashboard endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/auth/me` | Read the current user |
| GET | `/api/applications` | List applications with filters and pagination |
| POST | `/api/applications` | Create an application |
| GET | `/api/applications/:applicationId` | Read one application |
| PUT | `/api/applications/:applicationId` | Update an application |
| PATCH | `/api/applications/:applicationId/status` | Update status or schedule an interview |
| DELETE | `/api/applications/:applicationId` | Delete an application |
| GET | `/api/dashboard/summary` | Read dashboard metrics |
| GET | `/api/health` | Check API availability |
| GET | `/api/health/database` | Check MySQL connectivity |

## Database Design

The `users` table owns many `applications` records through `applications.user_id`.

```text
users (1) ─────< applications (many)
```

The foreign key uses `ON DELETE CASCADE`, so deleting a user also deletes that user's applications. Composite indexes on user/status, user/application date, and user/category support common dashboard and filtering queries.

## Security and Data Rules

- Passwords are hashed with bcrypt before storage.
- JWT middleware protects private API routes.
- Every application query includes `user_id`, so users cannot access another user's records.
- Job URLs are normalized to `https://...` when a protocol is omitted and only HTTP/HTTPS URLs are accepted.
- Archived applications are hidden by default and can be included through the list filter.

## Available Scripts

```bash
# Frontend
cd client
npm run dev
npm run lint
npm run build

# Backend
cd server
npm run dev
npm start
```

## Future Improvements

- Deploy the frontend and API to cloud hosting
- Host MySQL in a managed cloud database
- Add automated API and component tests
- Add file attachments and interview history
- Add charts with selectable date ranges
