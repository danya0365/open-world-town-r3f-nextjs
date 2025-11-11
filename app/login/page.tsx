import { LoginView } from "@/src/presentation/components/login/LoginView";
import { LoginPresenterFactory } from "@/src/presentation/presenters/login/LoginPresenter";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the page
 */
export async function generateMetadata(): Promise<Metadata> {
  const presenter = await LoginPresenterFactory.createServer();

  try {
    return presenter.generateMetadata();
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata
    return {
      title: "เข้าสู่ระบบ | Open World Town",
      description: "เข้าสู่ระบบเพื่อเริ่มสร้างเมืองของคุณและเล่นกับเพื่อนๆ",
    };
  }
}

/**
 * Login page - Server Component for SEO optimization
 * Uses presenter pattern following Clean Architecture
 */
export default async function LoginPage() {
  const presenter = await LoginPresenterFactory.createServer();

  try {
    // Get view model from presenter
    const viewModel = await presenter.getViewModel();

    // Redirect if already logged in
    if (viewModel.user) {
      redirect(viewModel.redirectUrl || "/play");
    }

    return <LoginView initialViewModel={viewModel} />;
  } catch (error) {
    console.error("Error fetching login data:", error);

    // Return view without initial data
    return <LoginView />;
  }
}
