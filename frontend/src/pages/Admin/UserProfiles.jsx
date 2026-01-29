import { useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import Toast from "../../components/Toast";
import Table1 from "../../components/Table";
import { BASE_URL } from "../../constants/config";

function AdminUserProfiles() {
  const { token } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);

  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  // store fetched users
  const [customerUsers, setCustomerUsers] = useState([]);
  const [cafeUsers, setCafeUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  const delayLogout = () => {
    setTimeout(() => {
      logout();
    }, 2000);
  };

  const fetchUsers = async (e) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/getUsers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCustomerUsers(data.customer_users);
        setCafeUsers(data.cafe_users);
        setAdminUsers(data.admin_users);
        setToast({
          show: true,
          type: "success",
          message: "Users fetched successfully!",
        });
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
            message: "Failed to fetch users. Please try again.",
          });
          console.error("Failed to fetch users:", data.error);
        }
      }
    } catch (error) {
      // Handle network errors or other unexpected errors
      setToast({ show: true, type: "error", message: "Error fetching users" });
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <main className="grow">
          <div className="mb-4 sm:mb-0">
            <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">
              User Profiles
            </h1>
          </div>
          <div>
            <div className="p-2">
              <Table1
                cafes={adminUsers}
                tableTopic={"Admin"}
                fetchUsers={fetchUsers}
              />
            </div>
          </div>
          <div>
            <div className="p-2">
              <Table1
                cafes={customerUsers}
                tableTopic={"Customers"}
                fetchUsers={fetchUsers}
              />
            </div>
          </div>
          <div>
            <div className="p-2">
              <Table1
                cafes={cafeUsers}
                tableTopic={"Cafe"}
                fetchUsers={fetchUsers}
              />
            </div>
          </div>
        </main>
      </div>
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}

export default AdminUserProfiles;
