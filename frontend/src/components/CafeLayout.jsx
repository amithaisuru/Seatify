// import React from 'react';

// const CafeLayout = ({ tables = [], chairs = [],width = 100, height = 60  }) => {
//   return (
//     <div className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800"
//     // style={{ width: `${width}px`, height: `${height}px` }}
//     style={{ width:`${width}%` , height: `${height}vh` }}
//     >
      
//       {/* Render tables */}
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

//       {/* Render chairs */}
//       {chairs.map((chair, index) => (
//         <div
//           key={`chair-${index}`}
//           className={`absolute w-6 h-6 rounded-md text-xs text-white flex items-center justify-center 
//             ${chair.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'}`}
//           style={{
//             left: `${chair.x}px`,
//             top: `${chair.y}px`,
//           }}
//           title={`Chair ${chair.label}`}
//         >
//           {chair.label}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CafeLayout;

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
//   localChairs=[], setLocalChairs, localTables=[], setLocalTables, height = 60,editable = false }) => {

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

import { useEffect,useState } from 'react';
import { BASE_URL } from '../constants/config';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const CafeLayout = ({ tables = [], chairs = [], width = 100,  height = 60, editable= false }) => {
  const { token } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [localChairs, setLocalChairs] = useState([]);
  const [localTables, setLocalTables] = useState([]);
    
  useEffect(() => {
    setLocalTables(tables);
    setLocalChairs(chairs);
  }, [tables, chairs]);

  const handleChairClick = (index) => {
    setLocalChairs((prev) =>
      prev.map((chair, i) =>
        i === index
          ? { ...chair, status: chair.status === 'occupied' ? 'available' : 'occupied' }
          : chair
      )
    );
  };

  // handle save occupancy setting manually
  const handleSave = async () => {
    try{
        const response = await fetch(`${BASE_URL}/cafeLayoutUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
          body: JSON.stringify({
            tables: localTables,
            chairs: localChairs,
          }),
        });

      if (response.ok) {
        setMessage('Layout saved successfully!');
      } else {
        if (data.error === "Token has expired!") {
          console.error('Token expired. Redirecting to login...');
          setMessage('Token expired. Please log in again.');
          delayLogout(); // Call the delayLogout function             
        } 
        else if (data.error === "Authorization header is missing!") {
          console.error('No token found. Redirecting to login...');
          setMessage('No token found. Please log in again.');
          delayLogout(); // Call the delayLogout function
        }
        else if (data.error === "Invalid token!") {
          console.error('Invalid token found. Redirecting to login...');
          setMessage('Invalid token. Please log in again.');
          delayLogout(); // Call the delayLogout function
        } 
        else {
          // Handle other errors
          setMessage('Failed to save layout. Please try again.');
          console.error('Failed to fetch user profile details:', data.error);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage('Server error. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800"
        style={{ width: `${width}%`, height: `${height}vh` }}
      >
        {/* Tables */}
        {localTables.map((table, index) => (
          <div
            key={`table-${index}`}
            className="absolute w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm"
            style={{ left: `${table.x}px`, top: `${table.y}px` }}
            title={`Table ${table.label}`}
          >
            {table.label}
          </div>
        ))}

        {/* Chairs */}
        {localChairs.map((chair, index) => (
          <div
            key={`chair-${index}`}
            onClick={editable? () => handleChairClick(index) : undefined}
            className={`absolute w-6 h-6 rounded-md text-xs text-white cursor-pointer flex items-center justify-center 
              ${chair.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'} hover:opacity-80 transition`}
            style={{ left: `${chair.x}px`, top: `${chair.y}px` }}
            title={`Chair ${chair.label} - ${chair.status}`}
          >
            {chair.label}
          </div>
        ))}
      </div>

      {/* Save Button */}
      {editable && (
        <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-dark hover:bg-primary-light text-white rounded-md transition"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
        {message && <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>}
      </div>
      )}
      
    </div>
  );
};

export default CafeLayout;