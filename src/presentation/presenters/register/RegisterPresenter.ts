import { createServerSupabaseClient } from "@/src/infrastructure/config/supabase-server";
import { createClientSupabaseClient } from "@/src/infrastructure/config/supabase-client";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface RegisterViewModel {
  user: User | null;
  redirectUrl?: string;
}

/**
 * Presenter for Register page
 * Follows Clean Architecture with proper separation of concerns
 */
export class RegisterPresenter {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<RegisterViewModel> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      return {
        user,
        redirectUrl: user ? "/play" : undefined,
      };
    } catch {
      return {
        user: null,
      };
    }
  }

  /**
   * Generate metadata for the page
   */
  async generateMetadata() {
    return {
      title: "สมัครสมาชิก | Open World Town",
      description: "สร้างบัญชีเพื่อเริ่มสร้างเมืองในฝันของคุณและเล่นกับเพื่อนๆ",
    };
  }

  /**
   * Sign up with email, password, and username
   */
  async signUp(
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
      };
    }
  }

  /**
   * Get user
   */
  async getUser() {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }
}

/**
 * Factory for creating RegisterPresenter instances
 */
export class RegisterPresenterFactory {
  static async createServer(): Promise<RegisterPresenter> {
    const supabase = await createServerSupabaseClient();
    return new RegisterPresenter(supabase);
  }

  static createClient(): RegisterPresenter {
    const supabase = createClientSupabaseClient();
    return new RegisterPresenter(supabase);
  }
}
