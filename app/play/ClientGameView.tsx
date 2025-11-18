"use client";

import { GameView } from "@/src/presentation/components/game/GameView";
import { CharacterSelection, type CharacterType } from "@/src/presentation/components/game/CharacterSelection";
import { useEffect, useState } from "react";

export default function ClientGameView() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  // Show character selection if no character is selected
  if (!selectedCharacter) {
    return (
      <CharacterSelection
        onSelect={(character) => {
          setSelectedCharacter(character);
        }}
        unavailableCharacters={[]} // Will be populated from server
      />
    );
  }

  return <GameView selectedCharacter={selectedCharacter} />;
}
