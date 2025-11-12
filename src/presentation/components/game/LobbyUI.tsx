"use client";

import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import {
  GAME_MODES,
  MAP_NAMES,
  type GameMode,
  type MapName,
  type RoomFilterOptions,
  type RoomSortBy,
  type RoomSortOrder,
} from "@/src/domain/types/room";
import {
  ArrowRight,
  Filter,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Unlock,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Lobby UI Component
 * Shows available rooms and allows creating/joining rooms
 */
export function LobbyUI() {
  const {
    isConnected,
    connect,
    fetchRooms,
    availableRooms,
    isFetchingRooms,
  } = useMultiplayerStore();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("free_roam");
  const [mapName, setMapName] = useState<MapName>("town_square");
  const [roomPassword, setRoomPassword] = useState("");
  const [passwordToJoin, setPasswordToJoin] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<RoomFilterOptions>({
    showPrivate: true,
    showPasswordProtected: true,
    searchQuery: "",
  });
  const [sortBy, setSortBy] = useState<RoomSortBy>("players");
  const [sortOrder, setSortOrder] = useState<RoomSortOrder>("desc");

  const handleRefreshRooms = useCallback(async () => {
    try {
      await fetchRooms();
    } catch (error) {
      console.error("Failed to refresh rooms:", error);
    }
  }, [fetchRooms]);

  // Auto-refresh rooms every 5 seconds
  useEffect(() => {
    if (!isConnected) {
      handleRefreshRooms();
      const interval = setInterval(handleRefreshRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected, handleRefreshRooms]);

  // Filter and sort rooms
  const filteredAndSortedRooms = useCallback(() => {
    let filtered = [...availableRooms];

    // Apply filters
    if (!filters.showPrivate) {
      filtered = filtered.filter((room) => !room.metadata?.isPrivate);
    }

    if (!filters.showPasswordProtected) {
      filtered = filtered.filter((room) => !room.metadata?.hasPassword);
    }

    if (filters.gameMode) {
      filtered = filtered.filter(
        (room) => room.metadata?.mode === filters.gameMode
      );
    }

    if (filters.minPlayers !== undefined) {
      filtered = filtered.filter(
        (room) => room.clients >= (filters.minPlayers || 0)
      );
    }

    if (filters.maxPlayers !== undefined) {
      filtered = filtered.filter(
        (room) => room.clients <= (filters.maxPlayers || 100)
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          String(room.metadata?.roomName || "").toLowerCase().includes(query) ||
          String(room.name || "").toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "players":
          comparison = a.clients - b.clients;
          break;
        case "name":
          comparison = String(a.metadata?.roomName || a.name || "").localeCompare(
            String(b.metadata?.roomName || b.name || "")
          );
          break;
        case "created":
          comparison =
            Number(a.metadata?.createdAt || 0) - Number(b.metadata?.createdAt || 0);
          break;
        case "mode":
          comparison = String(a.metadata?.mode || "").localeCompare(
            String(b.metadata?.mode || "")
          );
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [availableRooms, filters, sortBy, sortOrder]);

  const handleCreateRoom = async () => {
    if (!username.trim() || !roomName.trim()) {
      alert("กรุณากรอกชื่อผู้เล่นและชื่อห้อง");
      return;
    }

    try {
      await connect(username, {
        create: true,
        roomName: roomName.trim(),
        maxClients: maxPlayers,
        isPrivate,
        additionalOptions: {
          mode: gameMode,
          mapName,
          password: roomPassword.trim() || undefined,
          hasPassword: !!roomPassword.trim(),
        },
      });
      setShowCreateRoom(false);
      setRoomName("");
      setRoomPassword("");
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("ไม่สามารถสร้างห้องได้");
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!username.trim()) {
      alert("กรุณากรอกชื่อผู้เล่น");
      return;
    }

    try {
      await connect(username, { roomId });
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("ไม่สามารถเข้าร่วมห้องได้");
    }
  };

  const handleQuickJoin = async () => {
    if (!username.trim()) {
      alert("กรุณากรอกชื่อผู้เล่น");
      return;
    }

    try {
      await connect(username);
    } catch (error) {
      console.error("Failed to quick join:", error);
      alert("ไม่สามารถเข้าร่วมห้องได้");
    }
  };

  // If already connected, don't show lobby
  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center z-50">
      <div className="max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🎮 Open World Town
          </h1>
          <p className="text-gray-300 text-lg">
            เลือกห้องหรือสร้างห้องใหม่เพื่อเริ่มเล่น
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          {/* Username Input */}
          {!showCreateRoom && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ชื่อผู้เล่น
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อของคุณ..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
              />
            </div>
          )}

          {/* Create Room Form */}
          {showCreateRoom ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  สร้างห้องใหม่
                </h2>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ชื่อผู้เล่น
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อของคุณ..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ชื่อห้อง
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="กรอกชื่อห้อง..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  จำนวนผู้เล่นสูงสุด: {maxPlayers}
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  โหมดเกม
                </label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as GameMode)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(GAME_MODES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.icon} {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  แผนที่
                </label>
                <select
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value as MapName)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(MAP_NAMES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.icon} {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  รหัสผ่าน (ถ้ามี)
                </label>
                <input
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="ไม่บังคับ..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="private"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  ห้องส่วนตัว
                </label>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>สร้างห้อง</span>
              </button>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleQuickJoin}
                  disabled={!username.trim()}
                  className="py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>เข้าเล่นด่วน</span>
                </button>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  disabled={!username.trim()}
                  className="py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>สร้างห้อง</span>
                </button>
              </div>

              {/* Filter and Search */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    placeholder="ค้นหาห้อง..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-1"
                  >
                    <Filter className="w-4 h-4" />
                    <span>ตัวกรอง</span>
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as RoomSortBy)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="players">จำนวนผู้เล่น</option>
                    <option value="name">ชื่อห้อง</option>
                    <option value="created">สร้างล่าสุด</option>
                    <option value="mode">โหมดเกม</option>
                  </select>

                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                </div>

                {showFilters && (
                  <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.showPrivate}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              showPrivate: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span>แสดงห้องส่วนตัว</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.showPasswordProtected}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              showPasswordProtected: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span>แสดงห้องมีรหัส</span>
                      </label>
                    </div>
                    <select
                      value={filters.gameMode || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          gameMode: e.target.value
                            ? (e.target.value as GameMode)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="">ทุกโหมดเกม</option>
                      {Object.entries(GAME_MODES).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.icon} {value.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Room List Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ห้องที่เปิดอยู่ ({filteredAndSortedRooms().length}/{availableRooms.length})
                </h2>
                <button
                  onClick={() => {
                    void handleRefreshRooms();
                  }}
                  disabled={isFetchingRooms}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="รีเฟรช"
                >
                  <RefreshCw
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${
                      isFetchingRooms ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Room List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isFetchingRooms ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    กำลังโหลด...
                  </div>
                ) : filteredAndSortedRooms().length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    ไม่มีห้องที่เปิดอยู่
                  </div>
                ) : (
                  filteredAndSortedRooms().map((room) => {
                    const isFull = room.clients >= room.maxClients;
                    const metadata = room.metadata as
                      | (Record<string, unknown> & {
                          isPrivate?: boolean;
                          mapName?: string;
                        })
                      | undefined;
                    const isPrivateRoom = metadata?.isPrivate;

                    return (
                      <div
                        key={room.roomId}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isPrivateRoom ? (
                            <Lock className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <Unlock className="w-5 h-5 text-green-500" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {metadata?.mapName ||
                                room.name ||
                                "Game Room"}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {room.clients}/{room.maxClients} ผู้เล่น
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinRoom(room.roomId)}
                          disabled={isFull || !username.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {isFull ? "เต็ม" : "เข้าร่วม"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>Powered by Colyseus • Next.js • React Three Fiber</p>
        </div>
      </div>
    </div>
  );
}
