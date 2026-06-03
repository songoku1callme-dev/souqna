import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { loadProfileForAuthUser } from '@/api/profileApi';
import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

type AuthResult = { ok: true } | { ok: false; error: string };

type AuthState = {
  user: Profile | null;
  status: AuthStatus;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  continueAsGuest: () => void;
  addRole: (role: UserRole) => void;
};

function mockProfile(fullName: string, email: string): Profile {
  return {
    id: `mock-${email.toLowerCase()}`,
    fullName: fullName || email.split('@')[0],
    email,
    roles: ['buyer'],
    createdAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'idle',
      initialized: false,

      initialize: async () => {
        if (env.useMocks || !supabase) {
          // Persisted mock user (if any) is rehydrated by the persist middleware.
          set((s) => ({
            initialized: true,
            status: s.user ? 'authenticated' : s.status === 'guest' ? 'guest' : 'idle',
          }));
          return;
        }
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        if (sessionUser) {
          const user = await loadProfileForAuthUser(sessionUser);
          set({ user, status: 'authenticated', initialized: true });
        } else {
          set({ initialized: true });
        }
      },

      signIn: async (email, password) => {
        if (env.useMocks || !supabase) {
          if (!email || !password) return { ok: false, error: 'errors.signInFailed' };
          set({ user: mockProfile('', email), status: 'authenticated' });
          return { ok: true };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return { ok: false, error: 'errors.signInFailed' };
        const user = await loadProfileForAuthUser(data.user);
        set({ user, status: 'authenticated' });
        return { ok: true };
      },

      signUp: async (fullName, email, password) => {
        if (env.useMocks || !supabase) {
          if (!email || !password) return { ok: false, error: 'errors.signUpFailed' };
          set({ user: mockProfile(fullName, email), status: 'authenticated' });
          return { ok: true };
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { ok: false, error: 'errors.signUpFailed' };
        if (data.user) {
          const user = await loadProfileForAuthUser(data.user);
          set({ user, status: 'authenticated' });
        }
        return { ok: true };
      },

      signOut: async () => {
        if (supabase && !env.useMocks) {
          await supabase.auth.signOut();
        }
        set({ user: null, status: 'guest' });
      },

      resetPassword: async (email) => {
        if (env.useMocks || !supabase) {
          return email ? { ok: true } : { ok: false, error: 'validation.emailInvalid' };
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return error ? { ok: false, error: 'errors.generic' } : { ok: true };
      },

      continueAsGuest: () => set({ status: 'guest' }),

      addRole: (role) => {
        const user = get().user;
        if (!user || user.roles.includes(role)) return;
        set({ user: { ...user, roles: [...user.roles, role] } });
      },
    }),
    {
      name: 'souqna.auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.status === 'authenticated' && s.user !== null);
}
