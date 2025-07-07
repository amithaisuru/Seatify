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

import { use, useState } from "react";
import OccupancyLineChart from "../../components/LineChart";
import OccupancyBarChart from "../../components/BarChart";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/config";

function AnalyticsDashboard() {
  const { token } = useContext(AuthContext);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

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

  const [occupancyDataDay, setOccupancyDataDay] = useState([
    // { time: "Monday", count: 5 },
    // { time: "Tuesday", count: 8 },
    // { time: "Wednesday", count: 15 },
    // { time: "Thursday", count: 25 },
    // { time: "Friday", count: 35 },
    // { time: "Saturday", count: 45 },
    // { time: "Sunday", count: 30 },
  ]);

  const [occupancyDataMonth, setOccupancyDataDayMonth] = useState([
    { time: "JAN", count: 5 },
    { time: "FEB", count: 8 },
    { time: "MAR", count: 15 },
    { time: "APR", count: 25 },
    { time: "MAY", count: 35 },
    { time: "JUN", count: 45 },
    { time: "JUL", count: 30 },
    { time: "AUG", count: 20 },
    { time: "SEP", count: 15 },
    { time: "OCT", count: 10 },
    { time: "NOV", count: 5 },
    { time: "DEC", count: 8 },
  ]);

  const fetchDailyOccupancyData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/analyticsDashboard/dailyOccupancyPrediction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Daily Occupancy Data:", data);
        setOccupancyDataDay(data);
      } else {
        if (data.error === "Token has expired!") {
          console.error("Token expired. Redirecting to login...");
          setToast({
            show: true,
            type: "error",
            message: "Token expired. Please log in again.",
          });
          delayLogout(); // Call the delayLogout function
        } else if (data.error === "Authorization header is missing!") {
          console.error("No token found. Redirecting to login...");
          setToast({
            show: true,
            type: "error",
            message: "No token found. Please log in again.",
          });
          delayLogout(); // Call the delayLogout function
        } else if (data.error === "Invalid token!") {
          console.error("Invalid token found. Redirecting to login...");
          setToast({
            show: true,
            type: "error",
            message: "Invalid token. Please log in again.",
          });
          delayLogout(); // Call the delayLogout function
        } else {
          // Handle other errors
          setToast({
            show: true,
            type: "error",
            message: "Failed to fetch cafes. Please try again.",
          });
          console.error("Failed to fetch user profile details:", data.error);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setToast({
        show: true,
        type: "error",
        message: "An error occurred while fetching profile data.",
      });
    }
  };

  useEffect(() => {
    fetchDailyOccupancyData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
      <main className="grow">
        <div className="mb-4 sm:mb-0">
          <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">
            Analytics Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OccupancyLineChart
              data={occupancyData}
              title="Hourly Occupancy Trend Prediction"
            />
            <OccupancyLineChart
              data={occupancyDataDay}
              title="Daily Occupancy Trend Prediction"
            />
          </div>
          <OccupancyBarChart
            data={occupancyDataMonth}
            title="Monthly Occupancy Past Data"
          />
        </div>
      </main>
    </div>
  );
}

export default AnalyticsDashboard;
