"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/presentation/stores/authStore";
import { RegisterPresenterFactory } from "./RegisterPresenter";
import type { RegisterData, RegisterViewModel } from "./RegisterPresenter";

// Initialize presenter instance once (singleton pattern)
const presenter = RegisterPresenterFactory.createClient();

export interface RegisterPresenterState {
  viewModel: RegisterViewModel | null;
  loading: boolean;
  error: string | null;
}

export interface RegisterPresenterActions {
  signUp: (data: RegisterData) => Promise<void>;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for Register presenter
 * Provides state management and actions for registration operations
 */
export function useRegisterPresenter(
  initialViewModel?: RegisterViewModel
): [RegisterPresenterState, RegisterPresenterActions] {
  const router = useRouter();
  const { signUp: signUpStore } = useAuthStore();
  const [viewModel] = useState<RegisterViewModel | null>(
    initialViewModel || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign up user
   */
  const signUp = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      setError(null);

      try {
        // Use auth store's signUp method
        await signUpStore(data.email, data.password, data.username);

        // Redirect to play page or verification page
        router.push("/play");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการสมัครสมาชิก";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signUpStore, router]
  );

  return [
    {
      viewModel,
      loading,
      error,
    },
    {
      signUp,
      setError,
    },
  ];
}
