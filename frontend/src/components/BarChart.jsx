import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function OccupancyBarChart({
  data,
  title = "Occupancy by Hour",
  barColor = "#49DBC5FF",
  axisColor = "#90AEACFF",
  gridColor = "#ccc",
}) {
  return (
    <div className="bg-gray-200 text-sm dark:bg-gray-800 rounded-md p-4 shadow-md">
      <h2 className="text-md font-semibold mb-4 text-primary-dark dark:text-primary-light">
        {title}
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="time" stroke={axisColor} />
          <YAxis stroke={axisColor} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              color: "#333",
            }}
          />
          <Legend />
          <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OccupancyBarChart;
