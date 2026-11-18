import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.on("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const chosenPort = probe.address().port;
    probe.close(() => resolve(chosenPort));
  });
});
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["server.js"], {
  cwd: project,
  env: {
    ...process.env,
    SESSION_SECRET: randomBytes(32).toString("hex"),
    DEMO_USERNAME: "student",
    DEMO_PASSWORD: "temporary-test-password",
    PORT: String(port),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (child.exitCode !== null) throw new Error("Server exited before it was ready");
    try {
      const response = await fetch(`${base}/api/status`);
      ready = response.ok;
      if (ready) break;
    } catch { /* wait for startup */ }
    await delay(250);
  }
  assert.ok(ready, "Server did not start");

  let response = await fetch(`${base}/api/auth/me`);
  assert.equal(response.status, 401);

  response = await fetch(`${base}/dashboard`, { redirect: "manual" });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/login.html");

  response = await fetch(`${base}/login.html`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /class="container"/);

  response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "student" }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "student", password: "wrong" }),
  });
  assert.equal(response.status, 401);

  response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "student", password: "temporary-test-password" }),
  });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie?.startsWith("diploma_session="));
  assert.match(setCookie, /SameSite=Lax/i);
  assert.doesNotMatch(setCookie, /HttpOnly/i);
  assert.doesNotMatch(setCookie, /Secure/i);
  const cookie = setCookie.split(";")[0];

  response = await fetch(`${base}/api/auth/me`);
  assert.equal(response.status, 401);

  response = await fetch(`${base}/api/auth/me`, { headers: { cookie } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).user.username, "student");

  for (const route of ["dashboard", "security-lab"]) {
    response = await fetch(`${base}/${route}`, { headers: { cookie }, redirect: "manual" });
    assert.equal(response.status, 200);
  }

  response = await fetch(`${base}/api/auth/logout`, {
    method: "POST",
    headers: { cookie },
  });
  assert.equal(response.status, 200);

  response = await fetch(`${base}/api/auth/me`, { headers: { cookie } });
  assert.equal(response.status, 401);
  console.log("Smoke check passed: startup, login, cookie flags, protected routes, logout.");
} finally {
  child.kill();
}
