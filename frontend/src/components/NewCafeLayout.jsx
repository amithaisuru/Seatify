import { useEffect, useState, useRef } from "react";
import { BASE_URL } from "../constants/config";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const NewCafeLayout = ({
  width = 100,
  height = 60,
  editable = false,
  fetchCafeLayout,
}) => {
  const { token } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  // Hardcoded tables data
  const hardcodedTables = [
    {
      x: 53.54457572502685,
      y: 358.9129892794814,
      table_id: "T1",
      chair_count: 5,
      seated_persons_count: 2,
      assigned_chairs_IDs: [1, 2, 3, 6, 7],
      assigned_people_IDs: [4, 5],
    },
    {
      x: 253.54457572502685,
      y: 258.9129892794814,
      table_id: "T12",
      chair_count: 6,
      seated_persons_count: 2,
      assigned_chairs_IDs: [8, 9, 12, 13, 14],
      assigned_people_IDs: [10, 11],
    },
  ];
  const [localTables, setLocalTables] = useState(hardcodedTables);
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
            <>
              {/* Chairs for this table */}
              {chairs.map((chair, chairIndex) => {
                const chairSize = getFixedSize(24);
                const chairPos = getFixedPosition(chair.x, chair.y);
                return (
                  <div
                    key={`table-${tableIndex}-chair-${chairIndex}`}
                    className={`absolute rounded-md text-white flex items-center justify-center font-medium transition-all duration-200
                      ${
                        chair.status === "occupied"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }
                      cursor-default hover:opacity-90`}
                    style={{
                      ...chairPos,
                      width: `${chairSize}px`,
                      height: `${chairSize}px`,
                      fontSize: `${Math.max(chairSize / 3, 8)}px`,
                    }}
                    title={`Chair ${chair.label} - ${chair.status}${
                      chair.personId ? ` (Person ${chair.personId})` : ""
                    }`}
                  >
                    {chair.label}
                  </div>
                );
              })}
              <div
                key={`table-${tableIndex}`}
                className="absolute bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold"
                style={{
                  ...position,
                  width: `${tableSize}px`,
                  height: `${tableSize}px`,
                  fontSize: `${Math.max(tableSize / 5, 10)}px`,
                }}
                title={`Table ${table.table_id}`}
              >
                {table.table_id}
              </div>
            </>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 rounded-sm h-4 bg-red-500" />
          <span>Occupied Chair</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 rounded-sm h-4 bg-green-500" />
          <span>Available Chair</span>
        </div>
      </div>
    </div>
  );
};

export default NewCafeLayout;
