"use client";

import { GameView } from "@/src/presentation/components/game/GameView";
import { useEffect, useState } from "react";

export default function ClientGameView() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return <GameView />;
}
