"use client";

import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { Wifi, WifiOff, WifiLow } from "lucide-react";

/**
 * Connection Quality Indicator Component
 * Shows network connection quality
 */
export function ConnectionQualityIndicator() {
  const { isConnected, connectionQuality } = useMultiplayerStore();

  if (!isConnected) {
    return null;
  }

  const getQualityIcon = () => {
    switch (connectionQuality) {
      case "excellent":
        return <Wifi className="w-5 h-5 text-green-500" />;
      case "good":
        return <Wifi className="w-5 h-5 text-yellow-500" />;
      case "poor":
        return <WifiLow className="w-5 h-5 text-orange-500" />;
      case "disconnected":
        return <WifiOff className="w-5 h-5 text-red-500" />;
      default:
        return <Wifi className="w-5 h-5 text-gray-500" />;
    }
  };

  const getQualityText = () => {
    switch (connectionQuality) {
      case "excellent":
        return "ดีเยี่ยม";
      case "good":
        return "ดี";
      case "poor":
        return "แย่";
      case "disconnected":
        return "ขาดการเชื่อมต่อ";
      default:
        return "ไม่ทราบ";
    }
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case "excellent":
        return "text-green-600 dark:text-green-400";
      case "good":
        return "text-yellow-600 dark:text-yellow-400";
      case "poor":
        return "text-orange-600 dark:text-orange-400";
      case "disconnected":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {getQualityIcon()}
      <span className={`text-sm font-medium ${getQualityColor()}`}>
        {getQualityText()}
      </span>
    </div>
  );
}
