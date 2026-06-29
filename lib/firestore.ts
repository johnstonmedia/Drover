// Firestore data-access layer for Drover.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import { DEFAULT_MEMBER_PERMISSIONS } from './rbac';
import type { Company, LivestockMob, UserProfile } from './types';

// --- Users -----------------------------------------------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Create a profile on first sign-in if one doesn't exist. The very first user
 * of the whole system is bootstrapped as a site_admin via an env allowlist;
 * everyone else starts as an unassigned member.
 */
// Emails that are always bootstrapped as site admins. Hardcoded so it does not
// depend on a CI/repo variable; additional emails can be added via the
// NEXT_PUBLIC_SITE_ADMIN_EMAILS env var (comma-separated).
const DEFAULT_SITE_ADMIN_EMAILS = ['wjohnston.media@gmail.com'];

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const siteAdminEmails = [
    ...DEFAULT_SITE_ADMIN_EMAILS,
    ...(process.env.NEXT_PUBLIC_SITE_ADMIN_EMAILS || '').split(','),
  ]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isBootstrapAdmin =
    !!user.email && siteAdminEmails.includes(user.email.toLowerCase());

  const existing = await getUserProfile(user.uid);
  if (existing) {
    // Promote an allowlisted admin whose profile was created before they were
    // added. Best-effort: if security rules block the self-update, set the
    // role manually in the Firebase console instead.
    if (isBootstrapAdmin && existing.role !== 'site_admin') {
      try {
        await updateDoc(doc(db, 'users', user.uid), { role: 'site_admin' });
        return { ...existing, role: 'site_admin' };
      } catch {
        /* rules may block self-promotion; ignore */
      }
    }
    return existing;
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phone: user.phoneNumber,
    companyId: null,
    role: isBootstrapAdmin ? 'site_admin' : 'member',
    permissions: DEFAULT_MEMBER_PERMISSIONS,
    createdAt: Date.now(),
    notifyByEmail: true,
  };
  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), patch as Record<string, unknown>);
}

export async function listCompanyUsers(companyId: string): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data() as UserProfile);
}

// --- Companies -------------------------------------------------------------

export async function createCompany(
  data: Omit<Company, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'companies'), {
    ...data,
    createdAt: Date.now(),
    createdServer: serverTimestamp(),
  });
  return ref.id;
}

export async function getCompany(id: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, 'companies', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Company) : null;
}

export async function listAllCompanies(): Promise<Company[]> {
  const snap = await getDocs(collection(db, 'companies'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Company));
}

// --- Livestock mobs --------------------------------------------------------

export async function listMobs(companyId: string): Promise<LivestockMob[]> {
  const q = query(collection(db, 'mobs'), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LivestockMob));
}

export async function createMob(data: Omit<LivestockMob, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'mobs'), data);
  return ref.id;
}

export async function updateMob(id: string, patch: Partial<LivestockMob>): Promise<void> {
  await updateDoc(doc(db, 'mobs', id), patch as Record<string, unknown>);
}

export async function deleteMob(id: string): Promise<void> {
  await deleteDoc(doc(db, 'mobs', id));
}
