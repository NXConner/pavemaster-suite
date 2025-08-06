import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ComputerVisionEngineComponent as ComputerVisionEngine } from '../components/ai/ComputerVisionEngine';

const ComputerVision: React.FC = () => {
  return (
    <div className="min-h-screen bg-card dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 mt-16 p-6">
          <ComputerVisionEngine />
        </main>
      </div>
    </div>
  );
};

export default ComputerVision;