"use client";

import { useState, useEffect, useRef } from "react";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { MessageCircle, Send, X } from "lucide-react";

interface ChatMessage {
  playerId: string;
  message: string;
  timestamp: number;
  username?: string;
}

/**
 * Chat UI Component
 * Provides chat interface for multiplayer communication
 */
export function ChatUI() {
  const { isConnected, sendChat, room, players, myPlayerId } = useMultiplayerStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Setup chat message listener
  useEffect(() => {
    if (!room) return;

    const handleChatMessage = (message: ChatMessage) => {
      // Get sender username from players map
      const sender = players.get(message.playerId);
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          username: sender?.username || "Unknown",
        },
      ]);
    };

    room.onMessage("chat", handleChatMessage);

    // Cleanup function - Colyseus will handle removal on disconnect
    return () => {
      // No cleanup needed - room handles this automatically
    };
  }, [room, players]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    // Add own message to local state immediately
    const myPlayer = myPlayerId ? players.get(myPlayerId) : null;
    setMessages((prev) => [
      ...prev,
      {
        playerId: myPlayerId || "",
        message: inputMessage,
        timestamp: Date.now(),
        username: myPlayer?.username || "You",
      },
    ]);

    // Send to server
    sendChat(inputMessage);
    setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-4 right-4 z-10 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
          title="Open Chat"
        >
          <MessageCircle className="w-6 h-6" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute bottom-4 right-4 z-10 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Chat
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                ไม่มีข้อความ
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.playerId === myPlayerId;
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      isOwn ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`text-xs text-gray-600 dark:text-gray-400 mb-1 ${
                        isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.username || "Unknown"}
                    </div>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg ${
                        isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm wrap-break-word">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-md transition-colors disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
