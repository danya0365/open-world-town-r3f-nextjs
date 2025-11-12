"use client";

import { useState, useEffect } from "react";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { Users, Wifi, WifiOff, Loader2, RefreshCw } from "lucide-react";

/**
 * Connection UI Component
 * Provides UI for connecting/disconnecting to multiplayer server
 */
export function ConnectionUI() {
  const {
    isConnected,
    isConnecting,
    error,
    players,
    myPlayerId,
    connect,
    disconnect,
  } = useMultiplayerStore();

  const [username, setUsername] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [savedUsername, setSavedUsername] = useState("");

  const handleConnect = async () => {
    if (!username.trim()) {
      alert("กรุณากรอกชื่อผู้เล่น");
      return;
    }

    setSavedUsername(username); // Save for reconnection
    await connect(username, {}); // Empty options for backward compatibility
    setShowUsernameInput(false);
  };

  const handleReconnect = async () => {
    if (!savedUsername) return;
    
    setIsReconnecting(true);
    try {
      await connect(savedUsername, {});
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setUsername("");
    // Keep savedUsername for reconnection
  };

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (error && savedUsername && !isConnecting && !isReconnecting) {
      console.log("🔄 Connection lost, attempting to reconnect...");
      const timer = setTimeout(() => {
        handleReconnect();
      }, 3000); // Wait 3 seconds before reconnecting

      return () => clearTimeout(timer);
    }
  }, [error, savedUsername, isConnecting, isReconnecting]);

  const playerCount = players.size;
  const otherPlayersCount = myPlayerId ? playerCount - 1 : playerCount;

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[280px]">
        {/* Connection Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Connected
                </span>
              </>
            ) : isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Connecting...
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Offline
                </span>
              </>
            )}
          </div>

          {/* Player Count */}
          {isConnected && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{playerCount}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400 mb-2">
              {error}
            </div>
            {savedUsername && (
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isReconnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเชื่อมต่อใหม่...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>เชื่อมต่อใหม่</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Connection Controls */}
        {!isConnected && !isConnecting && (
          <>
            {showUsernameInput ? (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    ชื่อผู้เล่น
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleConnect();
                      }
                    }}
                    placeholder="กรอกชื่อของคุณ"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleConnect}
                    disabled={!username.trim() || isConnecting}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                  >
                    เชื่อมต่อ
                  </button>
                  <button
                    onClick={() => {
                      setShowUsernameInput(false);
                      setUsername("");
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowUsernameInput(true)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                เข้าร่วมเกม
              </button>
            )}
          </>
        )}

        {/* Disconnect Button */}
        {isConnected && (
          <div className="space-y-3">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {otherPlayersCount > 0 ? (
                <span>มีผู้เล่นอื่น {otherPlayersCount} คน</span>
              ) : (
                <span>ไม่มีผู้เล่นอื่นในห้อง</span>
              )}
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              ออกจากเกม
            </button>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && !showUsernameInput && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              เชื่อมต่อเพื่อเล่นกับผู้เล่นคนอื่นแบบ realtime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
