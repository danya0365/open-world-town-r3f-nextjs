"use client";

import { useState, useEffect } from "react";
import { Sword, Wand2, Target, UserX } from "lucide-react";

export type CharacterType = "warrior" | "mage" | "archer" | "rogue";

interface CharacterInfo {
  type: CharacterType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CHARACTERS: CharacterInfo[] = [
  {
    type: "warrior",
    name: "นักรบ (Warrior)",
    description: "แข็งแกร่ง ทนทาน เหมาะสำหรับการต่อสู้ระยะประชิด",
    icon: <Sword size={48} />,
    color: "bg-red-600",
  },
  {
    type: "mage",
    name: "นักเวทย์ (Mage)",
    description: "ใช้เวทมนตร์ โจมตีระยะไกล พลังเวทมนตร์สูง",
    icon: <Wand2 size={48} />,
    color: "bg-blue-600",
  },
  {
    type: "archer",
    name: "นักธนู (Archer)",
    description: "แม่นยำ รวดเร็ว โจมตีระยะไกล",
    icon: <Target size={48} />,
    color: "bg-green-600",
  },
  {
    type: "rogue",
    name: "นักฆ่า (Rogue)",
    description: "คล่องแคล่ว ซ่อนตัว โจมตีอย่างรวดเร็ว",
    icon: <UserX size={48} />,
    color: "bg-purple-600",
  },
];

interface CharacterSelectionProps {
  onSelect: (character: CharacterType) => void;
  unavailableCharacters?: CharacterType[];
}

export function CharacterSelection({
  onSelect,
  unavailableCharacters = [],
}: CharacterSelectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [hoveredCharacter, setHoveredCharacter] = useState<CharacterType | null>(null);

  const handleSelect = (character: CharacterType) => {
    if (unavailableCharacters.includes(character)) return;
    setSelectedCharacter(character);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      onSelect(selectedCharacter);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full p-8 border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            เลือกตัวละครของคุณ
          </h1>
          <p className="text-gray-400">
            เลือกตัวละครที่คุณต้องการเล่น (แต่ละตัวละครสามารถมีผู้เล่นได้เพียง 1 คนเท่านั้น)
          </p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {CHARACTERS.map((character) => {
            const isUnavailable = unavailableCharacters.includes(character.type);
            const isSelected = selectedCharacter === character.type;
            const isHovered = hoveredCharacter === character.type;

            return (
              <button
                key={character.type}
                onClick={() => handleSelect(character.type)}
                onMouseEnter={() => setHoveredCharacter(character.type)}
                onMouseLeave={() => setHoveredCharacter(null)}
                disabled={isUnavailable}
                className={`
                  relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300
                  ${
                    isUnavailable
                      ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? `${character.color} border-white shadow-2xl scale-105`
                      : isHovered
                      ? `bg-gray-700 border-gray-500 scale-102`
                      : "bg-gray-800 border-gray-600 hover:border-gray-500"
                  }
                `}
              >
                {/* Icon */}
                <div className="flex justify-center mb-4 text-white">
                  {character.icon}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-white mb-2 text-center">
                  {character.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-300 text-center mb-4">
                  {character.description}
                </p>

                {/* Status Badge */}
                {isUnavailable && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    ถูกใช้แล้ว
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-2 right-2 bg-white text-gray-900 text-xs px-2 py-1 rounded font-bold">
                    เลือกแล้ว ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedCharacter}
            className={`
              px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300
              ${
                selectedCharacter
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {selectedCharacter
              ? "ยืนยันและเริ่มเกม"
              : "กรุณาเลือกตัวละคร"}
          </button>
        </div>
      </div>
    </div>
  );
}
