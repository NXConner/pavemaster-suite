import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              PaveMaster Suite
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Enterprise Dashboard
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};