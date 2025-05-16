import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

const VisitorChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Calculate date range for the last 7 days
        const endDate = new Date();
        const startDate = subDays(endDate, 6); // Last 7 days including today

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stats/daily`,
          {
            params: {
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
            },
            timeout: 8000, // Add timeout to prevent infinite loading
          }
        );

        if (response.data && response.data.success) {
          // Transform data for chart
          const chartData = response.data.data.map((stat) => ({
            date: stat.date,
            visitors: stat.visitorCount || 0,
            tickets: stat.ticketsSold || 0,
            revenue: stat.revenue || 0,
          }));

          // If some days are missing, fill with zeros
          const filledData = [];
          for (let i = 0; i <= 6; i++) {
            const currentDate = subDays(endDate, 6 - i);
            const currentDateStr = currentDate.toISOString().split("T")[0];

            const existingData = chartData.find((item) => {
              const itemDate = new Date(item.date).toISOString().split("T")[0];
              return itemDate === currentDateStr;
            });

            if (existingData) {
              filledData.push(existingData);
            } else {
              filledData.push({
                date: currentDate.toISOString(),
                visitors: 0,
                tickets: 0,
                revenue: 0,
              });
            }
          }

          setData(filledData);

          // Check if there's any visitor data
          const totalVisitors = filledData.reduce(
            (sum, item) => sum + item.visitors,
            0
          );
          if (totalVisitors === 0) {
            setError("No visitor data available for the last 7 days");
          }
        } else {
          console.error("Invalid response format:", response.data);
          setError("Failed to load visitor data");
          setEmptyData(endDate);
        }
      } catch (error) {
        console.error("Error fetching visitor data:", error);
        setError("Failed to fetch visitor data");

        // Initialize with empty data for the last 7 days
        const endDate = new Date();
        setEmptyData(endDate);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const setEmptyData = (endDate) => {
    const emptyData = [];
    for (let i = 0; i <= 6; i++) {
      emptyData.push({
        date: subDays(endDate, 6 - i).toISOString(),
        visitors: 0,
        tickets: 0,
        revenue: 0,
      });
    }
    setData(emptyData);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return format(parseISO(dateStr), "MMM dd");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

      <ResponsiveContainer width="100%" height={error ? "90%" : "100%"}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 10 }}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value) => [`${value}`, "Visitors"]}
            labelFormatter={formatDate}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisitorChart;
