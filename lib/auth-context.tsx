'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import { ensureUserProfile, getUserProfile } from './firestore';
import type { UserProfile } from './types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInMicrosoft: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string) => Promise<void>;
  startPhoneSignIn: (phone: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Create the profile on first sign-in, then load it.
        const p = await ensureUserProfile(u);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function refreshProfile() {
    if (user) setProfile(await getUserProfile(user.uid));
  }

  const value: AuthState = {
    user,
    profile,
    loading,
    async signInGoogle() {
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    async signInMicrosoft() {
      const provider = new OAuthProvider('microsoft.com');
      await signInWithPopup(auth, provider);
    },
    async signInEmail(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    async registerEmail(email, password) {
      await createUserWithEmailAndPassword(auth, email, password);
    },
    async startPhoneSignIn(phone, recaptchaContainerId) {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
      });
      return signInWithPhoneNumber(auth, phone, verifier);
    },
    async signOut() {
      await fbSignOut(auth);
    },
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
