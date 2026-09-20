import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { secret } from "./secret";
import { isMock } from "./config";

export const SESSION_COOKIE = "session";

export async function createSession(role) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function getSession() {
  // В демо-режиме (DATA_MODE="mock") панели открыты без входа: отдаём
  // фиктивную сессию. В боевом (DATA_MODE="db") — только реальный JWT.
  if (isMock) return { role: "admin", mock: true };
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function requireRole(...roles) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
