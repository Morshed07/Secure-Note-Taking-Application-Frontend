# Secure Note-Taking Frontend

A lightweight, responsive React + Vite application for interacting with the Secure Note-Taking REST API.

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
