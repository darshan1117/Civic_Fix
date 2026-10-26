import { cookies } from 'next/headers';
import { UserRole, Profile } from './types';
import { dataStore, DEMO_PROFILES } from './dataStore';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  department_id?: string | null;
}

export const AUTH_COOKIE_NAME = 'civicfix_session';

/**
 * Reads user session from request cookies on server
 */
export function getCurrentSession(): SessionUser | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const parsed = JSON.parse(decodeURIComponent(sessionCookie.value)) as SessionUser;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Server-side role guard for API handlers and Server Components
 */
export function enforceUserRole(allowedRoles: UserRole[]): SessionUser {
  const user = getCurrentSession();
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required.');
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`FORBIDDEN: Requires role of ${allowedRoles.join(' or ')}.`);
  }
  return user;
}
