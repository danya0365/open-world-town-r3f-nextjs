import { createClientSupabaseClient } from "@/src/infrastructure/config/supabase-client";
import type { Session, User } from "@supabase/supabase-js";
import localforage from "localforage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Configure localforage
const storage = localforage.createInstance({
  name: "open-world-town",
  storeName: "auth",
});

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

/**
 * Auth Store using Zustand with localforage persistence
 * Manages authentication state and Supabase integration
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setSession: (session) =>
        set({
          session,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setError: (error) =>
        set({
          error,
        }),

      /**
       * Sign in with email and password
       */
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClientSupabaseClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to sign in";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Sign up with email, password, and username
       */
      signUp: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClientSupabaseClient();
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: !!data.user,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to sign up";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Sign out current user
       */
      signOut: async () => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClientSupabaseClient();
          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to sign out";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Send password reset email
       */
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClientSupabaseClient();
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) throw error;

          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to send reset email";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Update user password
       */
      updatePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClientSupabaseClient();
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) throw error;

          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update password";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Initialize auth state from Supabase session
       */
      initialize: async () => {
        set({ isLoading: true });

        try {
          const supabase = createClientSupabaseClient();

          // Get current session
          const {
            data: { session },
          } = await supabase.auth.getSession();

          set({
            user: session?.user || null,
            session: session || null,
            isAuthenticated: !!session?.user,
            isLoading: false,
          });

          // Listen to auth state changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user || null,
              session: session || null,
              isAuthenticated: !!session?.user,
            });
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to initialize auth";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage,
      // Only persist user and session, not loading/error states
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isLoading: false,
        error: null,
        setUser: state.setUser,
        setSession: state.setSession,
        setLoading: state.setLoading,
        setError: state.setError,
        signIn: state.signIn,
        signUp: state.signUp,
        signOut: state.signOut,
        resetPassword: state.resetPassword,
        updatePassword: state.updatePassword,
        initialize: state.initialize,
      }),
    }
  )
);
