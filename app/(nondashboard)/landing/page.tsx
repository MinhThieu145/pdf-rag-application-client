'use client';

import React from 'react';
import Link from 'next/link';

const features = [
  { 
    href: '/landing/page_1', 
    title: 'Layout Demo', 
    description: 'Explore our modern layout system' 
  },
  { 
    href: '/landing/page_2', 
    title: 'Features Demo', 
    description: 'Discover platform features' 
  },
  { 
    href: '/landing/page_3', 
    title: 'PDF Upload', 
    description: 'Upload and manage your documents' 
  },
  { 
    href: '/landing/page_4', 
    title: 'PDF Viewer', 
    description: 'View and interact with PDFs' 
  },
  { 
    href: '/landing/page_5', 
    title: 'Knowledge Graph', 
    description: 'Visualize document connections' 
  },
  { 
    href: '/landing/page_6', 
    title: 'PDF Chat', 
    description: 'Chat with your documents' 
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 mb-6">
            Learning Management System
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A modern platform for managing and interacting with your learning materials.
            Upload PDFs, view content, explore knowledge graphs, and engage in conversations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link 
              key={feature.href} 
              href={feature.href}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}