import React from 'react';

const CafeLayout = ({ tables = [], chairs = [],width = 100, height = 60  }) => {
  return (
    <div className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800"
    // style={{ width: `${width}px`, height: `${height}px` }}
    style={{ width:`${width}%` , height: `${height}vh` }}
    >
      
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

// import React, { useState, useEffect } from 'react';

// const CafeLayout = ({ tables = [], chairs = [], width = 100, height = 60 }) => {
//   // Clone chairs into local state to allow interaction
//   const [localChairs, setLocalChairs] = useState([]);

//   // Update local state if chairs prop changes
//   useEffect(() => {
//     setLocalChairs(chairs);
//   }, [chairs]);

//   const handleChairClick = (index) => {
//     setLocalChairs((prevChairs) =>
//       prevChairs.map((chair, i) =>
//         i === index
//           ? { ...chair, status: chair.status === 'occupied' ? 'available' : 'occupied' }
//           : chair
//       )
//     );
//   };

//   return (
//     <div
//       className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800"
//       style={{ width: `${width}%`, height: `${height}vh` }}
//     >
//       {/* Tables */}
//       {tables.map((table, index) => (
//         <div
//           key={`table-${index}`}
//           className="absolute w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm"
//           style={{
//             left: `${table.x}px`,
//             top: `${table.y}px`,
//           }}
//           title={`Table ${table.label}`}
//         >
//           {table.label}
//         </div>
//       ))}

//       {/* Chairs */}
//       {localChairs.map((chair, index) => (
//         <div
//           key={`chair-${index}`}
//           onClick={() => handleChairClick(index)}
//           className={`absolute w-6 h-6 rounded-md text-xs text-white cursor-pointer flex items-center justify-center 
//             ${chair.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'} hover:opacity-80 transition`}
//           style={{
//             left: `${chair.x}px`,
//             top: `${chair.y}px`,
//           }}
//           title={`Chair ${chair.label} - ${chair.status}`}
//         >
//           {chair.label}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CafeLayout;


// // _________________________________
// // component for editing

// import { useEffect } from 'react';

// const CafeLayout = ({ tables = [], chairs = [], width = 100, handleSave, message, saving,
//   localChairs, setLocalChairs, localTables, setLocalTables, height = 60,editable = false }) => {

//   useEffect(() => {
//     setLocalTables(tables);
//     setLocalChairs(chairs);
//   }, [tables, chairs]);

//   const handleChairClick = (index) => {
//     setLocalChairs((prev) =>
//       prev.map((chair, i) =>
//         i === index
//           ? { ...chair, status: chair.status === 'occupied' ? 'available' : 'occupied' }
//           : chair
//       )
//     );
//   };



//   return (
//     <div className="space-y-4">
//       <div
//         className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800"
//         style={{ width: `${width}%`, height: `${height}vh` }}
//       >
//         {/* Tables */}
//         {localTables.map((table, index) => (
//           <div
//             key={`table-${index}`}
//             className="absolute w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm"
//             style={{ left: `${table.x}px`, top: `${table.y}px` }}
//             title={`Table ${table.label}`}
//           >
//             {table.label}
//           </div>
//         ))}

//         {/* Chairs */}
//         {localChairs.map((chair, index) => (
//           <div
//             key={`chair-${index}`}
//             onClick={() => handleChairClick(index)}
//             className={`absolute w-6 h-6 rounded-md text-xs text-white cursor-pointer flex items-center justify-center 
//               ${chair.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'} hover:opacity-80 transition`}
//             style={{ left: `${chair.x}px`, top: `${chair.y}px` }}
//             title={`Chair ${chair.label} - ${chair.status}`}
//           >
//             {chair.label}
//           </div>
//         ))}
//       </div>

//       {/* Save Button */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={handleSave}
//           className="px-4 py-2 bg-primary-dark hover:bg-primary-light text-white rounded-md transition"
//           disabled={saving}
//         >
//           {saving ? 'Saving...' : 'Save Layout'}
//         </button>
//         {message && <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>}
//       </div>
//     </div>
//   );
// };

// export default CafeLayout;
