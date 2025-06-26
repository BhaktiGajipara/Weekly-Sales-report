import React from 'react';
import { Info } from 'lucide-react';

export const ExpectedFormat: React.FC = () => {
  const expectedColumns = [
    'Sales Rep First/Last Name',
    'Order Number, Project Name, Client',
    'Order Date, In-Hands Date',
    'Subtotal, Taxes, Total',
    'Booked Margin Subtotal, Amount, and Percentage',
    'Project Billed information',
    'Shipping information'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Expected CSV Format
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your CSV file should contain the following columns:
            </p>
            <ul className="space-y-2">
              {expectedColumns.map((column, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-blue-700 font-medium">{column}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};