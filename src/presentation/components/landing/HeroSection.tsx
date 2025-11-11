"use client";

import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
            Open Beta - Join Now
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Build Your Dream Town{" "}
            <span className="text-transparent bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text">
              Together
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            A top-down multiplayer sandbox where you can freely customize your town,
            interact with friends in real-time, and communicate via video chat.
            Inspired by GatherTown.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/play"
              className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Play Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-lg transition-all shadow hover:shadow-lg"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                100+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Players
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                50+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Towns Created
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                ∞
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Possibilities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            className="fill-white dark:fill-gray-800"
          />
        </svg>
      </div>
    </section>
  );
}
