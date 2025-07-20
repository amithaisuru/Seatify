import { useContext, useEffect, useState } from "react";
import { BASE_URL } from "../../constants/config";
import Toast from "../../components/Toast";
import { AuthContext } from "../../context/AuthContext";
import CafeLayout from "../../components/CafeLayout";
import NewCafeLayout from "../../components/NewCafeLayout";

function CafeLayoutPage() {
  const { token } = useContext(AuthContext);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [tables, setTables] = useState([]);
  const [chairs, setChairs] = useState([]);

  const fetchCafeLayout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cafeLayout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();

        setTables(data.tables);
        // setChairs(data.chairs);
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
    fetchCafeLayout();
  }, []);

  return (
    <>
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <main className="flex-1">
          <div className="mb-4 sm:mb-6">
            <h1 className="mb-6 text-lg sm:text-xl md:text-2xl text-primary-light dark:text-primary-dark font-bold">
              Cafe Layout
            </h1>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="w-full">
              {/* <CafeLayout
                tables={tables}
                chairs={chairs}
                editable={true}
                fetchCafeLayout={fetchCafeLayout}
              /> */}
              <NewCafeLayout tables={tables} />
            </div>
          </div>
        </main>
      </div>
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: "", message: "" })}
        />
      )}
    </>
  );
}

export default CafeLayoutPage;
