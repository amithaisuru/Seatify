// import { useContext, useEffect, useState } from 'react';
// // import { AuthContext } from '../context/AuthContext';

// function AnalyticsDashboard() {
// //   const { token } = useContext(AuthContext);
// const [message, setMessage] = useState('');

// return (
// <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
//     <main className="grow">
//         <div className="mb-4 sm:mb-0">
//             <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">Analytics Dashboard</h1>
//         </div>
//         <div className='bg-gray-200 dark:bg-gray-800 rounded-md p-4'>
//         </div>
//     </main>
// </div>
//     );
// }

// export default AnalyticsDashboard;

import { useState } from "react";
import OccupancyLineChart from "../../components/LineChart";
import OccupancyBarChart from "../../components/BarChart";

function AnalyticsDashboard() {
  const [occupancyData, setOccupancyData] = useState([
    { time: "8 AM", count: 5 },
    { time: "9 AM", count: 8 },
    { time: "10 AM", count: 15 },
    { time: "11 AM", count: 25 },
    { time: "12 PM", count: 35 },
    { time: "1 PM", count: 45 },
    { time: "2 PM", count: 30 },
    { time: "3 PM", count: 20 },
    { time: "4 PM", count: 15 },
    { time: "5 PM", count: 10 },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
      <main className="grow">
        <div className="mb-4 sm:mb-0">
          <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">
            Analytics Dashboard
          </h1>
        </div>

        <OccupancyLineChart
          data={occupancyData}
          title="Occupancy Trend (People Count)"
        />
        <OccupancyBarChart
          data={occupancyData}
          title="Hourly Occupancy Bar Chart"
        />
      </main>
    </div>
  );
}

export default AnalyticsDashboard;
