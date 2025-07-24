import { useEffect, useState, useRef } from "react";
import React from "react";
import { BASE_URL } from "../constants/config";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const NewCafeLayout = ({
  tables,
  width = 100,
  height = 60,
  editable = false,
  fetchCafeLayout,
}) => {
  const { token } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [localTables, setLocalTables] = useState(tables || []);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 800
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update local tables when props change
  useEffect(() => {
    setLocalTables(tables || []);
  }, [tables]);

  // Calculate min/max values for coordinate normalization
  const getCoordinateBounds = (tables) => {
    if (!tables || tables.length === 0) {
      return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }

    const xValues = tables.map((table) => table.x);
    const yValues = tables.map((table) => table.y);

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
    };
  };

  // Normalize coordinates to fit within the layout area - responsive
  const normalizePosition = (x, y) => {
    const bounds = getCoordinateBounds(localTables);

    // Responsive layout dimensions using state - increased mobile width
    const layoutWidth = windowWidth < 640 ? 480 : 800; // Increased from 320 to 480
    const layoutHeight = windowWidth < 640 ? 480 : 675; // Increased from 400 to 600

    // Responsive table and chair sizes using state
    const tableSize = windowWidth < 640 ? 32 : 48;
    const chairRadius = windowWidth < 640 ? 12 : 18;
    const padding = tableSize + chairRadius * 2;

    // Available space for positioning
    const availableWidth = layoutWidth - padding * 2;
    const availableHeight = layoutHeight - padding * 2;

    // Normalize coordinates
    const xRange = bounds.maxX - bounds.minX || 1;
    const yRange = bounds.maxY - bounds.minY || 1;

    const normalizedX =
      bounds.minX === bounds.maxX
        ? availableWidth / 2
        : ((x - bounds.minX) / xRange) * availableWidth;

    const normalizedY =
      bounds.minY === bounds.maxY
        ? availableHeight / 2
        : ((y - bounds.minY) / yRange) * availableHeight;

    return {
      left: `${normalizedX + padding}px`,
      top: `${normalizedY + padding}px`,
    };
  };

  // Handle chair click to cycle through statuses
  const handleChairClick = (tableIndex, chairIndex) => {
    if (!editable) return;

    setLocalTables((prevTables) => {
      const newTables = [...prevTables];
      const table = newTables[tableIndex];
      const chairs = generateChairsForTable(table, tableIndex);
      const chair = chairs[chairIndex];

      // Cycle through chair statuses: available -> occupied -> available
      const newStatus = chair.status === "available" ? "occupied" : "available";

      // Update seated_persons_count based on chair status changes
      if (newStatus === "occupied" && chair.status === "available") {
        newTables[tableIndex].seated_persons_count = Math.min(
          newTables[tableIndex].seated_persons_count + 1,
          newTables[tableIndex].chair_count
        );
      } else if (newStatus === "available" && chair.status === "occupied") {
        newTables[tableIndex].seated_persons_count = Math.max(
          newTables[tableIndex].seated_persons_count - 1,
          0
        );
      }

      return newTables;
    });
  };

  // Handle table click to toggle reservation status
  const handleTableClick = (tableIndex) => {
    if (!editable) return;

    setLocalTables((prevTables) => {
      const newTables = [...prevTables];
      const currentStatus = newTables[tableIndex].status;

      // Toggle table reservation status
      newTables[tableIndex] = {
        ...newTables[tableIndex],
        status: currentStatus === "available" ? "reserved" : "available",
      };

      return newTables;
    });
  };

  // Responsive sizes using state
  const getResponsiveSize = (desktopSize, mobileSize) => {
    return windowWidth < 640 ? mobileSize : desktopSize;
  };

  // Generate chairs around each table - responsive
  const generateChairsForTable = (table, tableIndex) => {
    const chairs = [];
    const tableSize = getResponsiveSize(48, 32);
    const radius = tableSize / 2 + getResponsiveSize(18, 12);
    const angleStep = (2 * Math.PI) / table.chair_count;

    // Get normalized table position
    const tablePos = normalizePosition(table.x, table.y);
    const tableX = parseFloat(tablePos.left);
    const tableY = parseFloat(tablePos.top);

    for (let i = 0; i < table.chair_count; i++) {
      const angle = i * angleStep;
      const chairX = tableX + 10 + radius * Math.cos(angle);
      const chairY = tableY + 10 + radius * Math.sin(angle);

      // Use assigned_chairs_IDs for chair label and ID
      const chairId = table.assigned_chairs_IDs[i] ?? null;
      chairs.push({
        x: chairX,
        y: chairY,
        label: chairId ? `C${chairId}` : `C${i + 1}`,
        status: i < table.seated_persons_count ? "occupied" : "available",
        tableIndex,
        chairIndex: i,
        chairId,
        personId:
          i < table.seated_persons_count ? table.assigned_people_IDs[i] : null,
      });
    }
    return chairs;
  };

  // Save function to update tables in backend
  const saveTables = async () => {
    if (!editable || saving) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${BASE_URL}/cafeLayoutUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tables: localTables,
        }),
      });

      if (response.ok) {
        setMessage("Layout saved successfully!");
        setTimeout(() => {
          setMessage("");
          fetchCafeLayout(); // Refresh layout after saving
        }, 1000);
        // Refresh the layout data
      } else {
        const data = await response.json();
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
      setMessage(`Error saving layout: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="relative border border-gray-800 bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800 dark:border-gray-600 mx-auto"
        style={{
          minHeight: windowWidth < 640 ? "600px" : "600px", // Increased mobile height
          width: windowWidth < 640 ? "480px" : "800px", // Increased mobile width
          height: windowWidth < 640 ? "600px" : "675px", // Increased mobile height
          maxWidth: "100vw", // Ensure it doesn't exceed viewport
          aspectRatio: "4/3",
        }}
      >
        {/* tatables  */}
        {localTables.map((table, tableIndex) => {
          const tableSize = getResponsiveSize(48, 32);
          const position = normalizePosition(table.x, table.y);
          const chairs = generateChairsForTable(table, tableIndex);
          return (
            <React.Fragment key={`table-group-${tableIndex}`}>
              {/* Chairs for this table */}
              {chairs.map((chair, chairIndex) => {
                const chairSize = getResponsiveSize(24, 16);
                const chairPos = { left: `${chair.x}px`, top: `${chair.y}px` };
                return (
                  <div
                    key={`table-${tableIndex}-chair-${chairIndex}`}
                    className={`absolute rounded-md text-white flex items-center justify-center font-medium transition-all duration-200
                      ${
                        table.status === "reserved"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : chair.status === "occupied"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }
                      ${
                        editable ? "cursor-pointer" : "cursor-default"
                      } hover:opacity-90`}
                    style={{
                      ...chairPos,
                      width: `${chairSize}px`,
                      height: `${chairSize}px`,
                      fontSize: `${Math.max(chairSize / 3, 6)}px`,
                    }}
                    title={`Chair ${chair.label} - ${
                      table.status === "reserved" ? "reserved" : chair.status
                    }${chair.personId ? ` (Person ${chair.personId})` : ""}${
                      editable ? " (Click to toggle)" : ""
                    }`}
                    onClick={() => handleChairClick(tableIndex, chairIndex)}
                  >
                    {windowWidth < 640
                      ? chair.label.replace("C", "")
                      : chair.label}
                  </div>
                );
              })}
              <div
                key={`table-${tableIndex}`}
                className={`absolute rounded-full flex items-center justify-center text-white font-semibold transition-all duration-200
                  bg-gray-700
                  ${
                    editable
                      ? "cursor-pointer hover:opacity-80 hover:scale-105"
                      : "cursor-default"
                  }`}
                style={{
                  ...position,
                  width: `${tableSize}px`,
                  height: `${tableSize}px`,
                  fontSize: `${Math.max(tableSize / 5, 8)}px`,
                }}
                title={`Table ${table.table_id} - ${table.status}${
                  editable ? " (Click to toggle reservation)" : ""
                }`}
                onClick={() => handleTableClick(tableIndex)}
              >
                {table.tabel_id}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Save button and message - responsive */}
      {editable && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <button
            onClick={saveTables}
            disabled={saving}
            className="px-3 py-2 sm:px-4 bg-primary-dark hover:bg-primary-light text-white rounded-md transition text-sm sm:text-base"
          >
            {saving ? "Saving..." : "Make Reservation"}
          </button>
          {message && (
            <div
              className={`text-xs sm:text-sm ${
                message.includes("Error")
                  ? "text-red-600"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Legend - responsive */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-red-500" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-blue-500" />
              <span>Reserved</span>
            </div>
          </div>

          {editable && (
            <div className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-0 sm:ml-4">
              <span className="hidden sm:inline">
                Click on chairs to toggle occupied/available • Click on tables
                to toggle reservation
              </span>
              <span className="sm:hidden">
                Tap chairs/tables to toggle status
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewCafeLayout;
