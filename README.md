# MCB Attendance Management System

Responsive Next.js attendance web app.

## Features
- Daily roster: pick a date and tap shift chips per employee to log or unlog attendance
- Multiple shifts on the same employee/date; duplicates prevented by a unique index
- Reports list only days with logged attendance (no automatic absence rows)
- Date presets (today / this week / this month / last month) plus a custom range
- Two report views: by day, and by employee with totals
- Salary calculation caps payable day value at 1 per employee/date while preserving actual shift total
- CSV export with proper quoting, respecting the active view and filters
- Employee and shift management with inline validation
- Toast notifications, in-page confirm dialogs and pending states (no native alerts)
- Light/dark theme following the OS, with a manual toggle stored in a cookie
- Responsive: sidebar on desktop, bottom nav and card-based reports on mobile
- MongoDB persistence via Next.js route handlers

## Run
Start a local MongoDB (Homebrew: `brew services start mongodb-community`), then:

npm install
npm run dev

Connection settings live in `.env.local`:

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=mcb_attendance

Collections (`employees`, `shifts`, `attendance`) and their unique indexes are created on first request, and the three default shifts are seeded when the shifts collection is empty.

## API
- `GET/POST /api/employees`, `PUT/DELETE /api/employees/[id]`
- `GET/POST /api/shifts`, `PUT/DELETE /api/shifts/[id]`
- `GET/POST /api/attendance` (optional `?from=&to=`), `DELETE /api/attendance/[id]`

For Vercel, import this repository/folder as a Next.js project and set `MONGODB_URI` to a reachable MongoDB (e.g. Atlas).
