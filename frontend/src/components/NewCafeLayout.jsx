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

  // Update local tables when props change
  useEffect(() => {
    setLocalTables(tables || []);
  }, [tables]);

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

  // Use fixed positions and sizes
  const getFixedPosition = (x, y) => ({ left: `${x}px`, top: `${y}px` });
  const getFixedSize = (size) => size;

  // Generate chairs around each table
  const generateChairsForTable = (table, tableIndex) => {
    const chairs = [];
    const tableSize = getFixedSize(48); // px
    const radius = tableSize / 2 + 18; // px
    const angleStep = (2 * Math.PI) / table.chair_count;
    for (let i = 0; i < table.chair_count; i++) {
      const angle = i * angleStep;
      const chairX = table.x + 10 + radius * Math.cos(angle);
      const chairY = table.y + 10 + radius * Math.sin(angle);
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
        className="relative border bg-gray-200 rounded-md overflow-hidden dark:bg-gray-800"
        style={{
          minHeight: "600px",
          width: "800px",
          height: "675px",
          aspectRatio: "4/3",
        }}
      >
        {/* Tables */}
        {localTables.map((table, tableIndex) => {
          const tableSize = getFixedSize(48);
          const position = getFixedPosition(table.x, table.y);
          // Generate chairs for this table
          const chairs = generateChairsForTable(table, tableIndex);
          return (
            <React.Fragment key={`table-group-${tableIndex}`}>
              {/* Chairs for this table */}
              {chairs.map((chair, chairIndex) => {
                const chairSize = getFixedSize(24);
                const chairPos = getFixedPosition(chair.x, chair.y);
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
                      fontSize: `${Math.max(chairSize / 3, 8)}px`,
                    }}
                    title={`Chair ${chair.label} - ${
                      table.status === "reserved" ? "reserved" : chair.status
                    }${chair.personId ? ` (Person ${chair.personId})` : ""}${
                      editable ? " (Click to toggle)" : ""
                    }`}
                    onClick={() => handleChairClick(tableIndex, chairIndex)}
                  >
                    {chair.label}
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
                  fontSize: `${Math.max(tableSize / 5, 10)}px`,
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

      {/* Save button and message */}
      {editable && (
        <div className="flex items-center gap-4">
          <button
            onClick={saveTables}
            disabled={saving}
            className="px-4 py-2 bg-primary-dark hover:bg-primary-light text-white rounded-md transition"
          >
            {saving ? "Save Layout" : "Save Layout"}
          </button>
          {message && (
            <div
              className={`text-sm ${
                message.includes("Error")
                  ? "text-red-600"
                  : "text-sm text-gray-700 dark:text-gray-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Legend */}
          {/* <div className="flex items-center gap-4"> */}
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
            <span>Reserved Table/Chair</span>
          </div>
          {editable && (
            <div className="text-sm text-gray-600 ml-4">
              Click on chairs to toggle occupied/available • Click on tables to
              toggle reservation
            </div>
          )}
          {/* </div> */}
        </div>
      )}
    </div>
  );
};

export default NewCafeLayout;
