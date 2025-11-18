"use client";

import { forwardRef } from "react";
import type { Mesh } from "three";
import type { CharacterType } from "./CharacterSelection";

interface CharacterModelProps {
  characterType: CharacterType;
  isMoving?: boolean;
  headYOffset?: number;
}

/**
 * Character Model Component
 * Renders different character models based on character type
 */
export const CharacterModel = forwardRef<{bodyRef: React.RefObject<Mesh>, headRef: React.RefObject<Mesh>}, CharacterModelProps>(
  function CharacterModel({ characterType, isMoving = false, headYOffset = 1.2 }, ref) {
    const getCharacterColors = () => {
      switch (characterType) {
        case "warrior":
          return {
            body: isMoving ? "#DC2626" : "#991B1B", // Red
            head: "#FCD34D", // Gold
            accent: "#7C2D12", // Dark Red
          };
        case "mage":
          return {
            body: isMoving ? "#3B82F6" : "#1E40AF", // Blue
            head: "#A78BFA", // Purple
            accent: "#312E81", // Dark Blue
          };
        case "archer":
          return {
            body: isMoving ? "#22C55E" : "#15803D", // Green
            head: "#FDE047", // Yellow
            accent: "#14532D", // Dark Green
          };
        case "rogue":
          return {
            body: isMoving ? "#A855F7" : "#7E22CE", // Purple
            head: "#1F2937", // Dark Gray
            accent: "#4C1D95", // Dark Purple
          };
        default:
          return {
            body: isMoving ? "#4CAF50" : "#2196F3",
            head: "#FFD700",
            accent: "#FF5722",
          };
      }
    };

    const colors = getCharacterColors();

    return (
      <>
        {/* Body */}
        <mesh castShadow>
          <boxGeometry args={[0.8, 1.6, 0.8]} />
          <meshStandardMaterial color={colors.body} />
        </mesh>

        {/* Head */}
        <mesh position={[0, headYOffset, 0]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={colors.head} />
        </mesh>

        {/* Character-specific accessories */}
        {characterType === "warrior" && (
          <>
            {/* Helmet */}
            <mesh position={[0, headYOffset + 0.3, 0]} castShadow>
              <boxGeometry args={[0.5, 0.3, 0.5]} />
              <meshStandardMaterial color={colors.accent} metalness={0.8} />
            </mesh>
          </>
        )}

        {characterType === "mage" && (
          <>
            {/* Wizard Hat */}
            <mesh position={[0, headYOffset + 0.6, 0]} castShadow>
              <coneGeometry args={[0.35, 0.8, 8]} />
              <meshStandardMaterial color={colors.accent} />
            </mesh>
          </>
        )}

        {characterType === "archer" && (
          <>
            {/* Hood */}
            <mesh position={[0, headYOffset + 0.2, -0.2]} castShadow>
              <coneGeometry args={[0.45, 0.5, 8]} />
              <meshStandardMaterial color={colors.accent} />
            </mesh>
          </>
        )}

        {characterType === "rogue" && (
          <>
            {/* Mask */}
            <mesh position={[0, headYOffset, 0.42]} castShadow>
              <boxGeometry args={[0.45, 0.2, 0.05]} />
              <meshStandardMaterial color={colors.accent} />
            </mesh>
          </>
        )}
      </>
    );
  }
);
