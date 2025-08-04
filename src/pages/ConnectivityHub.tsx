import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ConnectivityHub } from '../components/connectivity/ConnectivityHub';

const ConnectivityHubPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 mt-16 p-6">
          <ConnectivityHub />
        </main>
      </div>
    </div>
  );
};

export default ConnectivityHubPage;