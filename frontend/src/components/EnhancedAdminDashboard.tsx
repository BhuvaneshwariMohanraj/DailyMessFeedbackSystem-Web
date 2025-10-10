import React, { useState } from 'react';
import { User } from '../App';
import AdminDashboard from './AdminDashboard';
import AIInsights from './AIInsights';

interface EnhancedAdminDashboardProps {
  user: User;
}

const EnhancedAdminDashboard = ({ user }: EnhancedAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-insights'>('ai-insights');

  const tabs = [
    {
      id: 'ai-insights' as const,
      name: '🤖 AI Insights',
      description: 'AI-powered feedback analysis and alerts'
    },
    {
      id: 'dashboard' as const,
      name: '📊 Traditional Dashboard',
      description: 'Standard feedback statistics and management'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage and analyze mess feedback with AI-powered insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'ai-insights' && <AIInsights user={user} />}
          {activeTab === 'dashboard' && <AdminDashboard user={user} />}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
