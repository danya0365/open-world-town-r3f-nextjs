"use client";

import { techStack } from "@/src/data/landing-data";

const categoryLabels = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  multiplayer: "Multiplayer",
  assets: "Assets",
};

const categoryColors = {
  frontend: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  backend: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  database: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  multiplayer: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  assets: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
};

export function TechStackSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built with Modern Technologies
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powered by cutting-edge tools and frameworks for optimal performance
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {techStack.map((tech) => (
            <div
              key={tech.id}
              className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:scale-105"
            >
              {/* Category Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    categoryColors[tech.category]
                  }`}
                >
                  {categoryLabels[tech.category]}
                </span>
              </div>

              {/* Tech Name */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {tech.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
