# Quiz-zen Server (dev)

Simple Express server for local development with two auth endpoints:

- POST /auth/signup -> { name, email, password } returns { token }
- POST /auth/login -> { email, password } returns { token }

This is intentionally minimal and uses an in-memory user store. For production, replace with a database.

Install and run:

```powershell
cd server
npm install
npm run dev
```

Notes:
- This server uses an in-memory user store and is for local testing only.
- Set `JWT_SECRET` in a `.env` file when running locally.
