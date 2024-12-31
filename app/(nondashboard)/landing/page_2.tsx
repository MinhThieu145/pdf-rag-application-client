'use client';

import React from 'react';
import { FiUpload, FiSearch, FiMessageCircle, FiBook, FiShare2, FiSettings } from 'react-icons/fi';

const features = [
  {
    icon: <FiUpload className="w-6 h-6" />,
    title: 'PDF Upload',
    description: 'Easily upload and manage your PDF documents'
  },
  {
    icon: <FiSearch className="w-6 h-6" />,
    title: 'Smart Search',
    description: 'Quickly find content within your documents'
  },
  {
    icon: <FiMessageCircle className="w-6 h-6" />,
    title: 'Interactive Chat',
    description: 'Chat with your documents using AI'
  },
  {
    icon: <FiBook className="w-6 h-6" />,
    title: 'Knowledge Graph',
    description: 'Visualize connections between documents'
  },
  {
    icon: <FiShare2 className="w-6 h-6" />,
    title: 'Easy Sharing',
    description: 'Share documents and insights with others'
  },
  {
    icon: <FiSettings className="w-6 h-6" />,
    title: 'Customization',
    description: 'Customize your learning experience'
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Demo Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-6">
            Interactive Demo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200">
                Try PDF Upload
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                Test Search
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                Start Chat
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-300">
                Demo preview will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}