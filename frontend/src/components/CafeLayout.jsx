import { useEffect, useState, useRef } from "react";
import { BASE_URL } from "../constants/config";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const CafeLayout = ({
  tables = [],
  chairs = [],
  width = 100,
  height = 60,
  editable = false,
  fetchCafeLayout,
}) => {
  const { token } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [localChairs, setLocalChairs] = useState([]);
  const [localTables, setLocalTables] = useState([]);
  const layoutRef = useRef(null);
  const [layoutDimensions, setLayoutDimensions] = useState({
    width: 800,
    height: 600,
  });

  useEffect(() => {
    setLocalTables(tables);
    setLocalChairs(chairs);
  }, [tables, chairs]);

  // Handle responsive layout dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (layoutRef.current) {
        const rect = layoutRef.current.getBoundingClientRect();
        setLayoutDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate responsive positions and sizes
  const getResponsivePosition = (
    x,
    y,
    originalWidth = 800,
    originalHeight = 600
  ) => {
    const scaleX = layoutDimensions.width / originalWidth;
    const scaleY = layoutDimensions.height / originalHeight;

    return {
      left: `${x * scaleX}px`,
      top: `${y * scaleY}px`,
    };
  };

  const getResponsiveSize = (size, originalWidth = 800) => {
    const scale = layoutDimensions.width / originalWidth;
    return Math.max(size * scale, size * 0.5); // Minimum 50% of original size
  };

  const handleChairClick = (index) => {
    setLocalChairs((prev) =>
      prev.map((chair, i) =>
        i === index
          ? {
              ...chair,
              status:
                chair.status === "occupied" || chair.status === "reserved"
                  ? chair.status === "occupied"
                    ? "available"
                    : "occupied"
                  : "reserved",
            }
          : chair
      )
    );
  };

  // handle save occupancy setting manually
  const handleSave = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cafeLayoutUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tables: localTables,
          chairs: localChairs,
        }),
      });

      if (response.ok) {
        setMessage("Layout saved successfully!");
        setTimeout(() => {
          setMessage("");
          fetchCafeLayout(); // Refresh layout after saving
        }, 1000);
      } else {
        if (data.error === "Token has expired!") {
          console.error("Token expired. Redirecting to login...");
          setMessage("Token expired. Please log in again.");
          delayLogout(); // Call the delayLogout function
        } else if (data.error === "Authorization header is missing!") {
          console.error("No token found. Redirecting to login...");
          setMessage("No token found. Please log in again.");
          delayLogout(); // Call the delayLogout function
        } else if (data.error === "Invalid token!") {
          console.error("Invalid token found. Redirecting to login...");
          setMessage("Invalid token. Please log in again.");
          delayLogout(); // Call the delayLogout function
        } else {
          // Handle other errors
          setMessage("Failed to save layout. Please try again.");
          console.error("Failed to fetch user profile details:", data.error);
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage("Server error. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={layoutRef}
        className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800 w-full"
        style={{
          minHeight: "300px",
          height: "clamp(300px, 50vh, 600px)",
          aspectRatio: "4/3",
        }}
      >
        {/* Tables */}
        {localTables.map((table, index) => {
          const tableSize = getResponsiveSize(64); // 64px = w-16 h-16
          const position = getResponsivePosition(table.x, table.y);

          return (
            <div
              key={`table-${index}`}
              className="absolute bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold"
              style={{
                ...position,
                width: `${tableSize}px`,
                height: `${tableSize}px`,
                fontSize: `${Math.max(tableSize / 5, 10)}px`,
              }}
              title={`Table ${table.label}`}
            >
              {table.label}
            </div>
          );
        })}

        {/* Chairs */}
        {localChairs.map((chair, index) => {
          const chairSize = getResponsiveSize(24); // 24px = w-6 h-6
          const position = getResponsivePosition(chair.x, chair.y);

          return (
            <div
              key={`chair-${index}`}
              onClick={editable ? () => handleChairClick(index) : undefined}
              className={`absolute rounded-md text-white flex items-center justify-center font-medium transition-all duration-200
                ${
                  chair.status === "occupied" || chair.status === "available"
                    ? chair.status === "occupied"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } 
                ${
                  editable
                    ? "cursor-pointer hover:scale-110 hover:shadow-lg"
                    : "cursor-default"
                }
                hover:opacity-90`}
              style={{
                ...position,
                width: `${chairSize}px`,
                height: `${chairSize}px`,
                fontSize: `${Math.max(chairSize / 3, 8)}px`,
              }}
              title={`Chair ${chair.label} - ${chair.status}`}
            >
              {chair.label}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      {editable && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-dark hover:bg-primary-light text-white rounded-md transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Layout"}
          </button>
          {message && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          )}
          {/* display colors and meaning */}
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
      )}
    </div>
  );
};

export default CafeLayout;
