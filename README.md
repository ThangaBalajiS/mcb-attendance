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
- Single shared password with a signed session cookie
- MongoDB persistence via Next.js route handlers

## Run
Start a local MongoDB (Homebrew: `brew services start mongodb-community`), then:

npm install
npm run dev

Settings live in `.env.local`:

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=mcb_attendance      # optional, defaults to mcb_attendance
APP_PASSWORD=mcb@2026          # password for signing in
AUTH_SECRET=<random hex>       # signs the session cookie

Collections (`employees`, `shifts`, `attendance`) and their unique indexes are created on first request, and the three default shifts are seeded when the shifts collection is empty.

## Sign in
The whole app sits behind one shared password (`APP_PASSWORD`). Signing in at `/login` sets `mcb_session`, an httpOnly cookie holding an expiry timestamp signed with HMAC-SHA256 using `AUTH_SECRET`, valid for 12 hours. `middleware.js` verifies it on every request: browser routes redirect to `/login?next=…`, API routes return 401. There are no user accounts — anyone with the password has full access.

Changing `AUTH_SECRET` invalidates every active session. Because middleware runs on the Edge runtime, env changes need a dev-server restart (or a rebuild before `npm run start`) to take effect there.

## API
- `POST /api/auth/login` (`{password}`), `POST /api/auth/logout`
- `GET/POST /api/employees`, `PUT/DELETE /api/employees/[id]`
- `GET/POST /api/shifts`, `PUT/DELETE /api/shifts/[id]`
- `GET/POST /api/attendance` (optional `?from=&to=`), `DELETE /api/attendance/[id]`

All except `/api/auth/*` require a valid session.

For Vercel, import this repository/folder as a Next.js project and set `MONGODB_URI` to a reachable MongoDB (e.g. Atlas).
