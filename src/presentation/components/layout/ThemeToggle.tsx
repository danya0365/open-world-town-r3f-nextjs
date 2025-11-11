"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "dark":
        return <Moon className="w-5 h-5 text-blue-400" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      default:
        return "System Mode";
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative"
      aria-label={`Current theme: ${getLabel()}. Click to cycle themes.`}
      title={getLabel()}
    >
      <span className="block transition-transform group-hover:scale-110">
        {getIcon()}
      </span>
    </button>
  );
}
