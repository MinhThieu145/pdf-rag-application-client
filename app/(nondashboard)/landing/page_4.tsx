'use client';

import React, { useState } from 'react';
import { FiZoomIn, FiZoomOut, FiDownload, FiShare2 } from 'react-icons/fi';

export default function PDFViewer() {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            PDF Viewer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View and interact with your PDF documents
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  <FiZoomOut className="h-5 w-5" />
                </button>
                <span className="text-gray-900 dark:text-gray-50">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  <FiZoomIn className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                  <FiDownload className="h-5 w-5 mr-2" />
                  Download
                </button>
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                  <FiShare2 className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* PDF Display Area */}
          <div className="p-8">
            <div className="aspect-[8.5/11] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                PDF preview will appear here
              </p>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-4 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((page) => (
                <div
                  key={page}
                  className="flex-shrink-0 w-24 aspect-[8.5/11] bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:ring-2 ring-gray-900 dark:ring-gray-50 transition-all duration-200"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Page {page}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
