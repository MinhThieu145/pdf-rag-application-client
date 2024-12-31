'use client';

import React from 'react';

export default function LayoutDemo() {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Layout Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore our modern and responsive layout system
          </p>
        </div>

        <div className="space-y-8">
          {/* Grid Layout Example */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Grid Layout</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={item}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center"
                >
                  Grid Item {item}
                </div>
              ))}
            </div>
          </section>

          {/* Flex Layout Example */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Flex Layout</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                Flex Item 1
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                Flex Item 2
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                Flex Item 3
              </div>
            </div>
          </section>

          {/* Responsive Container Example */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Responsive Container</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Small Screen: 100% width</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Medium Screen: 75% width</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Large Screen: 50% width</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
