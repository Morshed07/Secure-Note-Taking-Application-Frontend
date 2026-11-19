# DigiNote — Secure Note-Taking Frontend

A modern, lightweight React + Vite frontend for **DigiNote**, a secure note-taking platform with JWT authentication, role-based access control, and MongoDB aggregations.

## Features
- **Auth**: Login & registration with quick 1-click test login buttons
- **Notes CRUD**: Create, read, update, and delete notes with paginated views
- **Admin Panel**: User management and platform-wide notes inspector (visible to Admins)
- **Aggregations Dashboard**:
  - Scenario 1: Users grouped by interest
  - Scenario 2: User profile & posts retrieved via `$lookup`
- **Public Feed**: Community posts with pagination

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   # App runs on http://localhost:3000
   ```
