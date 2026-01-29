import { use, useState } from "react";
import OccupancyLineChart from "../../components/LineChart";
import OccupancyBarChart from "../../components/BarChart";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/config";

function AnalyticsDashboard() {
  const { token } = useContext(AuthContext);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const [occupancyDataHourly, setOccupancyDataHourly] = useState([]);

  const [occupancyDataDay, setOccupancyDataDay] = useState([]);

  const [pastOccupancyDataMonthly, setPastOccupancyDataMonthly] = useState([]);
  // predict occupancy data for the next 7 days
  const fetchDailyOccupancyPredictionData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/analyticsDashboard/dailyOccupancyPrediction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
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

  // Predict occupancy data for the next hours
  const fetchHourlyOccupancyPredictionData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/analyticsDashboard/hourlyOccupancyPrediction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Hourly Occupancy Data:", data);
        setOccupancyDataHourly(data);
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

  // Function to display past year occupancy data
  const fetchMonthlyOccupancyPastData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/analyticsDashboard/monthlyOccupancyPastData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Hourly Occupancy Data:", data);
        setPastOccupancyDataMonthly(data);
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
    fetchDailyOccupancyPredictionData();
    fetchHourlyOccupancyPredictionData();
    fetchMonthlyOccupancyPastData();
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
              data={occupancyDataHourly}
              title="Hourly Occupancy Trend Prediction"
            />
            <OccupancyLineChart
              data={occupancyDataDay}
              title="Daily Occupancy Trend Prediction"
            />
          </div>
          <OccupancyBarChart
            data={pastOccupancyDataMonthly}
            title="Monthly Occupancy Past Data"
          />
        </div>
      </main>
    </div>
  );
}

export default AnalyticsDashboard;
