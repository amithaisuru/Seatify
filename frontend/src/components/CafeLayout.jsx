import React from 'react';

const CafeLayout = ({ tables = [], chairs = [] }) => {
  return (
    <div className="relative w-[600px] h-[400px] border bg-gray-100 rounded-md overflow-hidden dark:bg-gray-800">
      
      {/* Render tables */}
      {tables.map((table, index) => (
        <div
          key={`table-${index}`}
          className="absolute w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm"
          style={{
            left: `${table.x}px`,
            top: `${table.y}px`,
          }}
          title={`Table ${table.label}`}
        >
          {table.label}
        </div>
      ))}

      {/* Render chairs */}
      {chairs.map((chair, index) => (
        <div
          key={`chair-${index}`}
          className={`absolute w-6 h-6 rounded-md text-xs text-white flex items-center justify-center 
            ${chair.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'}`}
          style={{
            left: `${chair.x}px`,
            top: `${chair.y}px`,
          }}
          title={`Chair ${chair.label}`}
        >
          {chair.label}
        </div>
      ))}
    </div>
  );
};

export default CafeLayout;
