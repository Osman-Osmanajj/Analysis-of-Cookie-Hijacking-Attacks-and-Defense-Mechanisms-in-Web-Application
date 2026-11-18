# Cookie Hijacking Analysis Lab

A small, local Node.js/Express application for a diploma project on authenticated sessions and cookie defenses. The current configuration is the **insecure baseline** for a controlled comparison. Do not publish or deploy it.

## Run locally

1. Use Node.js and npm, then run `npm ci` in this folder.
2. Copy `.env.example` to `.env` and replace both placeholder values with a strong random session secret and a unique test password. Keep `.env` private.
3. Run `npm run dev` and open `http://127.0.0.1:3000/login.html`.

Run `npm test` for a local, temporary account check of login, cookie flags, protected pages, and logout. It creates its own server on an available port and prints no cookie value.

Use the same hostname throughout an experiment. `localhost` and `127.0.0.1` have separate cookie scopes. The server listens on `127.0.0.1`.

## Current baseline

- Login creates a server-side session and rotates its ID. The browser receives `diploma_session`.
- `/dashboard` and `/security-lab` require that session. `/api/auth/me` returns `401` without it.
- The cookie currently uses `HttpOnly=false`, `Secure=false`, `SameSite=Lax`, and a 15-minute maximum age. The Security Lab shows cookies readable by JavaScript.
- `/index.html` and `/api/session-test` are an older session playground. `/` opens the login page.
- Sessions use Express's default in-memory store, so a server restart invalidates them.

The lab demonstrates **reuse of a known valid cookie**, which is different from demonstrating how the cookie was stolen. `HttpOnly` will prevent JavaScript from reading the cookie in the next comparison, but it will not invalidate or prevent replay of a cookie obtained some other way.

Keep test credentials and raw cookie values out of screenshots, logs, commits, and shared files. Use only your own local browser sessions.
