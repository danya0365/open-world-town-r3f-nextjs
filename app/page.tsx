import { MainLayout } from "@/src/presentation/components/layout/MainLayout";
import { LandingView } from "@/src/presentation/components/landing/LandingView";

/**
 * Home Page - Landing Page
 * Server Component for SEO optimization
 */
export default function Home() {
  return (
    <MainLayout>
      <LandingView />
    </MainLayout>
  );
}
