"use client";

import { useState } from "react";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { Users, ChevronDown, ChevronUp, User, Crown } from "lucide-react";

/**
 * Player List Panel Component
 * Shows list of all connected players
 */
export function PlayerListPanel() {
  const { isConnected, players, myPlayerId } = useMultiplayerStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isConnected) {
    return null;
  }

  const playerList = Array.from(players.values());
  const totalPlayers = playerList.length;

  return (
    <div className="absolute top-20 right-4 z-10 w-64">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">ผู้เล่น ({totalPlayers})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {/* Player List */}
        {isExpanded && (
          <div className="max-h-80 overflow-y-auto">
            {totalPlayers === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                ไม่มีผู้เล่นในห้อง
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {playerList.map((player) => {
                  const isMe = player.id === myPlayerId;
                  return (
                    <div
                      key={player.id}
                      className={`px-4 py-3 flex items-center gap-3 transition-colors ${
                        isMe
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isMe
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {isMe ? (
                          <Crown className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium truncate ${
                              isMe
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {player.username}
                          </p>
                          {isMe && (
                            <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">
                              You
                            </span>
                          )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              player.isMoving
                                ? "bg-green-500 animate-pulse"
                                : "bg-gray-400 dark:bg-gray-500"
                            }`}
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {player.isMoving ? "กำลังเคลื่อนที่" : "หยุดอยู่"}
                          </p>
                        </div>

                        {/* Position */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          ({player.x.toFixed(1)}, {player.z.toFixed(1)})
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer Stats */}
        {isExpanded && totalPlayers > 0 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {playerList.filter((p) => p.isMoving).length} กำลังเคลื่อนที่
              </span>
              <span>
                {playerList.filter((p) => !p.isMoving).length} หยุดอยู่
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
