import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const SESSION_COOKIE_NAME = 'acropole_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || 'admin';
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || 'acropole2026';
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET?.trim() ||
    createHash('sha256')
      .update(`acropole-secret-${getAdminUsername()}-${getAdminPassword()}`)
      .digest('hex')
  );
}

function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUser = getAdminUsername();
  const expectedPass = getAdminPassword();
  return safeEqual(username.trim(), expectedUser) && safeEqual(password, expectedPass);
}

export function createSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      exp: Date.now() + SESSION_TTL_MS,
    })
  ).toString('base64url');

  const signature = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): { username: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSig = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');

  if (!safeEqual(signature, expectedSig)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      sub?: string;
      exp?: number;
    };
    if (!parsed.sub || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return { username: parsed.sub };
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}

export function getAdminFromRequest(req: Request): { username: string } | null {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    res.status(401).json({ error: 'Sessão administrativa não autenticada.' });
    return;
  }
  next();
}
