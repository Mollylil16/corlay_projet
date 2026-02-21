import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const MissionsChart = ({ vehicles }) => {
  // Compter les missions par statut
  const data = [
    {
      name: 'En Transit',
      count: vehicles.filter(v => v.status === 'transit').length,
      color: '#f97316',
    },
    {
      name: 'Chargement',
      count: vehicles.filter(v => v.status === 'chargement').length,
      color: '#3b82f6',
    },
    {
      name: 'Livraison',
      count: vehicles.filter(v => v.status === 'livraison').length,
      color: '#10b981',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Missions en Cours par Statut</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MissionsChart;
