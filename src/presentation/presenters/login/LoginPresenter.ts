import { createClientSupabaseClient } from "@/src/infrastructure/config/supabase-client";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginViewModel {
  user: User | null;
  redirectUrl?: string;
}

/**
 * Presenter for Login page
 * Follows Clean Architecture with proper separation of concerns
 */
export class LoginPresenter {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<LoginViewModel> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      return {
        user,
        redirectUrl: user ? "/play" : undefined,
      };
    } catch (error) {
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
      title: "เข้าสู่ระบบ | Open World Town",
      description: "เข้าสู่ระบบเพื่อเริ่มสร้างเมืองของคุณและเล่นกับเพื่อนๆ",
    };
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: LoginData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
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
    } catch (error) {
      return null;
    }
  }
}

/**
 * Factory for creating LoginPresenter instances
 */
export class LoginPresenterFactory {
  static async createServer(): Promise<LoginPresenter> {
    const { createServerSupabaseClient } = await import(
      "@/src/infrastructure/config/supabase-server"
    );
    const supabase = await createServerSupabaseClient();
    return new LoginPresenter(supabase);
  }

  static createClient(): LoginPresenter {
    const supabase = createClientSupabaseClient();
    return new LoginPresenter(supabase);
  }
}
