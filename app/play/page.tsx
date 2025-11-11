import type { Metadata } from "next";
import ClientGameView from "./ClientGameView";

export const metadata: Metadata = {
  title: "เล่นเกม | Open World Town",
  description: "สร้างและปรับแต่งเมืองของคุณในโลกเสมือนแบบ Top-Down",
};

/**
 * Play/Game page - Server Component for SEO optimization
 * Main game page with React Three Fiber canvas
 */
export default function PlayPage() {
  return <ClientGameView />;
}
