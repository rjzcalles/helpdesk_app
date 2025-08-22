// client/src/components/MetricsCard.js
import React from 'react';

const MetricsCard = ({ title, value, colorClass }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className={`text-4xl font-bold mt-2 ${colorClass}`}>
        {value}
      </p>
    </div>
  );
};

export default MetricsCard;