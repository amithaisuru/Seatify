import React from 'react';

const CafeLayout = ({ tables = [], chairs = [],width = 100, height = 60  }) => {
  return (
    <div className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800"
    // style={{ width: `${width}px`, height: `${height}px` }}
    style={{ width:`${width}%` , height: `${height}vh` }}
    
    >
      
      {/* Render tables */}
      {/* {tables.map((table, index) => (
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
      ))} */}

      {/* Render chairs */}
      {/* {chairs.map((chair, index) => (
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
      ))} */}
    </div>
  );
};

export default CafeLayout;
