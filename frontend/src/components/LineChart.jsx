import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function OccupancyLineChart({ data, title = "Occupancy Trend" }) {
  return (
    <div className="bg-gray-200 text-sm dark:bg-gray-800 rounded-md p-4">
      <h2 className="text-md font-semibold mb-4 text-primary-dark dark:text-primary-light">
        {title}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#90AEACFF" />
          <YAxis stroke="#90AEACFF" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              color: "#333",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#199384FF"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OccupancyLineChart;
