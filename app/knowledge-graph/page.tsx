'use client';

import React, { useState } from 'react';
import { FiSearch, FiFilter, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function KnowledgeGraph() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Knowledge Graph
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Visualize connections between your documents
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Controls */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search nodes..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-50"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                  <FiFilter className="h-5 w-5 mr-2" />
                  Filter
                </button>
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  {isFullscreen ? (
                    <FiMinimize2 className="h-5 w-5 mr-2" />
                  ) : (
                    <FiMaximize2 className="h-5 w-5 mr-2" />
                  )}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
              </div>
            </div>
          </div>

          {/* Graph Display */}
          <div className={`${isFullscreen ? 'h-screen' : 'h-[600px]'} bg-gray-50 dark:bg-gray-900 p-8`}>
            {/* Placeholder for graph visualization */}
            <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Knowledge graph visualization will appear here
                </p>
                <div className="flex justify-center space-x-4">
                  {['Documents', 'Topics', 'Connections'].map((item) => (
                    <div 
                      key={item}
                      className="flex items-center space-x-2"
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        item === 'Documents' ? 'bg-blue-500' :
                        item === 'Topics' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Stats */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">24</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
              </div>
              <div className="p-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">156</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Topics</div>
              </div>
              <div className="p-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">483</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Connections</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
