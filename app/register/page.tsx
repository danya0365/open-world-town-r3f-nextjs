import { RegisterView } from "@/src/presentation/components/register/RegisterView";
import { RegisterPresenterFactory } from "@/src/presentation/presenters/register/RegisterPresenter";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the page
 */
export async function generateMetadata(): Promise<Metadata> {
  const presenter = await RegisterPresenterFactory.createServer();

  try {
    return presenter.generateMetadata();
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata
    return {
      title: "สมัครสมาชิก | Open World Town",
      description: "สร้างบัญชีเพื่อเริ่มสร้างเมืองในฝันของคุณและเล่นกับเพื่อนๆ",
    };
  }
}

/**
 * Register page - Server Component for SEO optimization
 * Uses presenter pattern following Clean Architecture
 */
export default async function RegisterPage() {
  const presenter = await RegisterPresenterFactory.createServer();

  try {
    // Get view model from presenter
    const viewModel = await presenter.getViewModel();

    // Redirect if already logged in
    if (viewModel.user) {
      redirect(viewModel.redirectUrl || "/play");
    }

    return <RegisterView initialViewModel={viewModel} />;
  } catch (error) {
    console.error("Error fetching register data:", error);

    // Return view without initial data
    return <RegisterView />;
  }
}
