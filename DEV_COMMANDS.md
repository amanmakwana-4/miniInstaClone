# Development & Debugging Quick Commands

Use these commands to run and debug the project locally on Windows (paths are shown relative to the repository root).

Prerequisites
- Node.js (v18+)
- npm (or yarn)
- MongoDB (local or Atlas)

Backend (Express)

Install dependencies
```bash
cd backend
npm install
```

Create .env from example and edit values
```bash
copy .env.example .env
rem (then edit .env in an editor)
```

Run in development (with nodemon if available)
```bash
cd backend
npm run dev
# or if you prefer plain node
node server.js
```

Frontend (React)

Install dependencies
```bash
cd frontend
npm install
```

Set API url
```bash
REM Windows: create .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env.local
```

Run dev server
```bash
cd frontend
npm run dev
```

Quick health check (after backend is running)
```bash
curl http://localhost:5000/api/health
```

Open the frontend in a browser: http://localhost:3000

Common troubleshooting
- If CORS errors appear, ensure backend CORS is enabled and `NEXT_PUBLIC_API_URL` matches the backend URL.
- If authentication fails, verify `JWT_SECRET` in backend `.env` and that the frontend token is set in `localStorage`.
- For large video uploads, watch for request body size limits on the server (increase `express.json({ limit: '50mb' })` if needed).

Logs
- Backend console logs appear where you run `npm run dev`.
- Use `nodemon` for automatic server reloads when editing server files.

Other useful commands
- Install formatter / linter
```bash
npm install --save-dev eslint prettier
```
- Run tests (if present)
```bash
cd backend
npm test
cd ../frontend
npm test
```
