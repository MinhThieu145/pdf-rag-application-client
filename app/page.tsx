'use client';

import React from 'react';
import Link from 'next/link';
import { type Route } from 'next';

const features = [
  { 
    href: '/layout-demo' as Route, 
    title: 'Layout Demo', 
    description: 'Explore our modern layout system' 
  },
  { 
    href: '/features-demo' as Route, 
    title: 'Features Demo', 
    description: 'Discover platform features' 
  },
  { 
    href: '/pdf-upload' as Route, 
    title: 'PDF Upload', 
    description: 'Upload and manage your documents' 
  },
  { 
    href: '/pdf-viewer' as Route, 
    title: 'PDF Viewer', 
    description: 'View and interact with PDFs' 
  },
  { 
    href: '/knowledge-graph' as Route, 
    title: 'Knowledge Graph', 
    description: 'Visualize document connections' 
  },
  { 
    href: '/pdf-chat' as Route, 
    title: 'PDF Chat', 
    description: 'Chat with your documents' 
  },
  { 
    href: '/document-editor' as Route, 
    title: 'Document Editor', 
    description: 'Interactive drag-and-drop document editor' 
  },
  { 
    href: '/evidence-extraction' as Route, 
    title: 'Evidence Extraction', 
    description: 'Extract and analyze evidence from documents' 
  }
];

export default function HomePage() {
  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
