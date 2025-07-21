import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Toast from "../../components/Toast"; // Import your Toast component
import CafeLayout from "../../components/CafeLayout";
import { BASE_URL } from "../../constants/config";
import { MapPin, Phone, Map, Users, Landmark } from "lucide-react";

import cafeImage from "../../assets/restuarentimages/HotWok.jpeg";
import NewCafeLayout from "../../components/NewCafeLayout";

const imageModules = import.meta.glob(
  "../../assets/menuImages/*.{jpg,png,webp}",
  { eager: true }
);

const menuImages = Object.values(imageModules).map((mod) => mod.default);

function CafeDetails() {
  const { id } = useParams(); // Get cafe id from URL
  const { token } = useContext(AuthContext);
  const [cafe, setCafe] = useState(null);

  const [tables, setTables] = useState([]);
  const [chairs, setChairs] = useState([]);

  const [toast, setToast] = useState({ show: false, type: "", message: "" }); //toast messages
  const { logout } = useContext(AuthContext);
  const delayLogout = () => {
    setTimeout(() => {
      logout();
    }, 2000);
  };
  const [selectedImage, setSelectedImage] = useState(null);

  // const menuImages = [
  //   image1,
  //     image2,
  //     image3,

  // ];

  const fetchCafeDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cafes/${id}/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setCafe(data.cafe);
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
          console.error("Failed to fetch cafes:", data.error);
        }
      }
    } catch (error) {
      // Handle network errors or other unexpected errors
      setToast({
        show: true,
        type: "error",
        message: "An error occurred while fetching cafes.",
      });
      console.error("Error fetching cafes:", error);
    }
  };

  // fetch cafe layout details
  const fetchCafeLayoutDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cafes/${id}/layout`, {
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
            message: "Failed to fetch layout details. Please try again.",
          });
          console.error("Failed to fetch layout details:", data.error);
        }
      }
    } catch (error) {
      console.error("Error fetching cafe layout details:", error);
      setToast({
        show: true,
        type: "error",
        message: "An error occurred while fetching layout details.",
      });
    }
  };

  useEffect(() => {
    fetchCafeDetails();
    fetchCafeLayoutDetails();
  }, [id]);

  if (!cafe) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading cafe details...
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <main className="grow">
          <div className="mb-4 sm:mb-0">
            <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">
              Cafe
            </h1>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800 rounded-md p-4">
            <div className="max-w-screen mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 flex flex-col md:flex-row gap-6">
              {/* Left Side: Cafe Info */}
              <div className="flex-1 pl-8">
                <h1 className="text-lg font-bold text-primary-dark mb-4 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-primary-dark" />{" "}
                  {cafe.cafe_name}
                </h1>

                <p className="text-md mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <strong>Town:</strong> {cafe.location?.name}
                </p>

                <p className="text-md mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />{" "}
                  <strong>Contact:</strong> {cafe.contact_number}
                </p>

                <div className="text-md mb-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-gray-500" />
                    <strong>Location:</strong>
                    <span className="ml-1">{cafe.location?.name}</span>
                  </div>
                </div>

                <p className="text-md mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <strong>Seats Available:</strong> {cafe.seats_available}
                </p>
              </div>

              {/* Right Side: Image & Map Responsive */}
              <div className="w-full md:w-[600px] flex flex-col md:flex-row gap-4 flex-shrink-0 items-start">
                <img
                  src={cafeImage} // make sure this is a full URL or correct import
                  alt="Cafe"
                  className="w-full md:w-[280px] h-[180px] object-cover rounded-md shadow-md"
                />
                <div className="rounded-md overflow-hidden shadow-md w-full md:w-[300px] h-[180px]">
                  <iframe
                    title="Cafe Location Map"
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${
                      cafe.location?.latitude || 6.9271
                    },${
                      cafe.location?.longitude || 79.8612
                    }&hl=es;z=14&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* Display menus */}
          <div className="mt-4 ">
            <h2 className="text-lg font-bold text-primary-dark mb-4">Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-200 dark:bg-gray-800 rounded-md p-4 ">
              {menuImages.map((src, index) => (
                <div
                  key={index}
                  className="w-full overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800"
                >
                  <img
                    src={src}
                    alt={`Menu ${index + 1}`}
                    onClick={() => setSelectedImage(src)}
                    className="object-cover w-full h-64 sm:h-48 md:h-60 rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            {/* Modal for full-size image */}
            {selectedImage && (
              <div
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                onClick={() => setSelectedImage(null)}
              >
                <img
                  src={selectedImage}
                  alt="Full View"
                  className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-bold text-primary-dark mb-4">
              Seat Map
            </h2>
          </div>
          <div className="w-full max-w-[100%] overflow-auto">
            {/* <CafeLayout tables={tables} chairs={chairs} /> */}
            <NewCafeLayout tables={tables} editable={false} />
          </div>
          {/* Call to Make a Reservation Button */}
          <div className="flex items-center gap-4">
            <a
              // href={`tel:${cafe.contact_number}`}
              className="inline-block mt-2 px-4 py-2 bg-primary-dark text-white rounded shadow hover:bg-primary-light transition-colors duration-200"
              style={{ textDecoration: "none" }}
            >
              Call to Make a Reservation
            </a>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 rounded-sm h-4 bg-red-500" />
                <span>Occupied Chair</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 rounded-sm h-4 bg-green-500" />
                <span>Available Chair</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 rounded-sm h-4 bg-blue-500" />
                <span>Reserved Chair</span>
              </div>
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

export default CafeDetails;
