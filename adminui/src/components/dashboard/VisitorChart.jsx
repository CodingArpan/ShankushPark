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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Calculate date range for the last 7 days
        const endDate = new Date();
        const startDate = subDays(endDate, 6); // Last 7 days including today

        const response = await axios.get(
          `http://localhost:3000/api/stats/daily`,
          {
            params: {
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
            },
          }
        );

        if (response.data.success) {
          // Transform data for chart
          const chartData = response.data.data.map((stat) => ({
            date: stat.date,
            visitors: stat.visitorCount,
            tickets: stat.ticketsSold,
            revenue: stat.revenue,
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
        }
      } catch (error) {
        console.error("Error fetching visitor data:", error);
        // Initialize with empty data for the last 7 days
        const emptyData = [];
        for (let i = 0; i <= 6; i++) {
          emptyData.push({
            date: subDays(new Date(), 6 - i).toISOString(),
            visitors: 0,
            tickets: 0,
            revenue: 0,
          });
        }
        setData(emptyData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <ResponsiveContainer width="100%" height="100%">
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
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${value} visitors`, "Visitors"]}
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
