import React from 'react';
import { Upload, Settings, BarChart3 } from 'lucide-react';

interface NavigationProps {
  activeTab: 'upload' | 'process' | 'report';
  onTabChange: (tab: 'upload' | 'process' | 'report') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'process' as const, label: 'Process', icon: Settings },
    { id: 'report' as const, label: 'Report', icon: BarChart3 }
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};