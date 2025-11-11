"use client";

import { howItWorks } from "@/src/data/landing-data";
import * as LucideIcons from "lucide-react";

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started in just 5 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {howItWorks.map((step, index) => {
            const Icon = (LucideIcons as unknown as Record<string, typeof LucideIcons.Circle>)[step.icon] || LucideIcons.Circle;
            const isLast = index === howItWorks.length - 1;

            return (
              <div key={step.step} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800 -mb-6"></div>
                )}

                <div className="flex items-start gap-6 mb-12">
                  {/* Step Number & Icon */}
                  <div className="shrink-0">
                    <div className="relative w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-10">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Step {step.step}
                      </span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
