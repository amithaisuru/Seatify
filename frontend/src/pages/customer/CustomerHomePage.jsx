import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import Toast from "../../components/Toast"; // Import your Toast component
import { BASE_URL } from "../../constants/config";

function CustomerHome() {
  const { token } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);

  const [cafes, setCafes] = useState([]);
  const [hardcodedCafes, setHardcodedCafes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, type: "", message: "" }); //toast messages

  // Set hardcoded cafes
  useEffect(() => {
    const dummyCafes = [
      {
        id: 1,
        cafe_name: "Sunrise Cafe",
        seats_available: 8,
        location: { id: 1, name: "Downtown" },
        image:
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
      },
      {
        id: 2,
        cafe_name: "City Brew Lounge",
        seats_available: 0,
        location: { id: 2, name: "City Center" },
        image:
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      },
      {
        id: 3,
        cafe_name: "Oceanview Coffee",
        seats_available: 12,
        location: { id: 3, name: "Seaside" },
        image:
          "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
      },
      {
        id: 4,
        cafe_name: "Mountain Bean",
        seats_available: 2,
        location: { id: 4, name: "Hilltop" },
        image:
          "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400",
      },
      {
        id: 5,
        cafe_name: "The Night Owl",
        seats_available: 0,
        location: { id: 5, name: "Downtown" },
        image:
          "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400",
      },
    ];

    setHardcodedCafes(dummyCafes);
    console.log("Using hardcoded cafes:", dummyCafes);
  }, []);

  // API fetch for backend cafes
  const delayLogout = () => {
    setTimeout(() => {
      logout();
    }, 2000);
  };

  const fetchCafes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cafes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        // Add default images to cafes that don't have images
        const cafesWithImages = data.cafes.map((cafe, index) => ({
          ...cafe,
          image: cafe.image || getDefaultCafeImage(index),
        }));

        setCafes(cafesWithImages);
        console.log("Cafes:", cafesWithImages);
        setToast({
          show: true,
          type: "success",
          message: "Cafes fetched successfully!",
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

  // Function to get default cafe images
  const getDefaultCafeImage = (index) => {
    const defaultImages = [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400",
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    ];

    return defaultImages[index % defaultImages.length];
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  // Handle search and filter for combined cafe lists
  const allCafes = [...cafes, ...hardcodedCafes];

  const filteredCafes = allCafes.filter((cafe) => {
    const matchesSearch =
      cafe.cafe_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cafe.location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = filterAvailable
      ? cafe.seats_available > 0
      : true;
    return matchesSearch && matchesAvailability;
  });

  const CafeCard = ({ cafe }) => (
    <div
      key={cafe.id}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
      onClick={() => navigate(`/cafe/${cafe.id}`)}
    >
      {/* Cafe Image */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={cafe.image || "/placeholder-cafe.jpg"}
          alt={cafe.cafe_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/placeholder-cafe.jpg";
          }}
        />
      </div>

      {/* Cafe Content */}
      <div className="p-4">
        <h3 className="text-md font-bold mb-2 dark:text-white">
          {cafe.cafe_name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {cafe.location.name}
        </p>
        <span
          className={`inline-block px-3 py-1 text-xs rounded-full ${
            cafe.seats_available > 0
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {cafe.seats_available > 0 ? "Seats Available" : "Seats not Available"}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <main className="grow">
          <div className="mb-4 sm:mb-0">
            <h1 className="mb-6 text-sm md:text-xl text-primary-light dark:text-primary-dark font-bold">
              HomePage
            </h1>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800 rounded-md p-4">
            {/* Search and Filter */}
            <div className="flex text-sm flex-col md:flex-row items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by Location or Name"
                className="w-full md:w-1/2 p-2 rounded-md border shadow-sm dark:bg-gray-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterAvailable}
                  onChange={() => setFilterAvailable(!filterAvailable)}
                />
                <label className="text-gray-700 dark:text-gray-300">
                  Only show available cafes
                </label>
              </div>
            </div>

            {/* Combined Cafes Section */}
            {filteredCafes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Available Cafes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCafes.map((cafe, index) => (
                    <CafeCard key={`cafe-${cafe.id}-${index}`} cafe={cafe} />
                  ))}
                </div>
              </div>
            )}

            {/* No Cafes Found */}
            {filteredCafes.length === 0 && (
              <div className="text-center mt-10 text-gray-600 dark:text-gray-400">
                No cafes match your search criteria!
              </div>
            )}
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

export default CustomerHome;
