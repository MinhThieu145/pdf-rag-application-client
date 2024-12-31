'use client';

import React from 'react';
import { FiBook, FiUpload, FiSearch, FiMessageCircle, FiShare2, FiGrid } from 'react-icons/fi';

const features = [
  {
    icon: FiBook,
    title: 'Document Management',
    description: 'Organize and manage your learning materials efficiently'
  },
  {
    icon: FiUpload,
    title: 'Easy Upload',
    description: 'Upload PDFs and documents with simple drag and drop'
  },
  {
    icon: FiSearch,
    title: 'Smart Search',
    description: 'Find content quickly with intelligent search capabilities'
  },
  {
    icon: FiMessageCircle,
    title: 'Interactive Chat',
    description: 'Chat with your documents using advanced AI'
  },
  {
    icon: FiShare2,
    title: 'Sharing',
    description: 'Share documents and insights with team members'
  },
  {
    icon: FiGrid,
    title: 'Knowledge Graph',
    description: 'Visualize connections between your documents'
  }
];

export default function FeaturesDemo() {
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Features Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore the powerful features of our learning management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
              >
                <Icon className="h-8 w-8 text-gray-900 dark:text-gray-50 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
            Interactive Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try out our features in this interactive demonstration area
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Interactive demo content will be added here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
