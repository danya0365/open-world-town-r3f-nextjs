"use client";

import { useAuthStore } from "@/src/presentation/stores/authStore";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { LoginData, LoginViewModel } from "./LoginPresenter";

export interface LoginPresenterState {
  viewModel: LoginViewModel | null;
  loading: boolean;
  error: string | null;
}

export interface LoginPresenterActions {
  signIn: (data: LoginData) => Promise<void>;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for Login presenter
 * Provides state management and actions for login operations
 */
export function useLoginPresenter(
  initialViewModel?: LoginViewModel
): [LoginPresenterState, LoginPresenterActions] {
  const router = useRouter();
  const { signIn: signInStore } = useAuthStore();
  const [viewModel, setViewModel] = useState<LoginViewModel | null>(
    initialViewModel || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign in user
   */
  const signIn = useCallback(
    async (data: LoginData) => {
      setLoading(true);
      setError(null);

      try {
        // Use auth store's signIn method
        await signInStore(data.email, data.password);

        // Redirect to play page
        router.push("/play");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signInStore, router]
  );

  return [
    {
      viewModel,
      loading,
      error,
    },
    {
      signIn,
      setError,
    },
  ];
}
