import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const TicketTypeDistribution = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataType, setDataType] = useState("tickets"); // "tickets" or "revenue"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the current date for setting date range for this month
        const today = new Date();
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stats/ticket-types`,
          {
            params: {
              startDate: firstDayOfMonth.toISOString().split("T")[0],
              endDate: lastDayOfMonth.toISOString().split("T")[0],
            },
            timeout: 8000, // Add timeout to prevent infinite loading
          }
        );

        if (response.data && response.data.success) {
          const ticketData = response.data.data;

          if (!ticketData) {
            setError("No ticket data available");
            setData([]);
            return;
          }

          // Check if we have ticket counts
          const totalTickets =
            (ticketData.ticketCounts.individual || 0) +
            (ticketData.ticketCounts.meal || 0) +
            (ticketData.ticketCounts.family || 0) +
            (ticketData.ticketCounts.group || 0);

          // Check if we have revenue data
          const totalRevenue =
            (ticketData.revenueDistribution.individual || 0) +
            (ticketData.revenueDistribution.meal || 0) +
            (ticketData.revenueDistribution.family || 0) +
            (ticketData.revenueDistribution.group || 0);

          // Decide which data to show based on what's available
          let useDataType = dataType;
          if (totalTickets === 0 && totalRevenue > 0) {
            useDataType = "revenue";
            setDataType("revenue");
          } else if (totalTickets > 0) {
            useDataType = "tickets";
            setDataType("tickets");
          }

          // Transform data for pie chart
          const chartData = [
            {
              name: "Individual",
              value:
                useDataType === "tickets"
                  ? ticketData.ticketCounts.individual || 0
                  : ticketData.revenueDistribution.individual || 0,
              tickets: ticketData.ticketCounts.individual || 0,
              revenue: ticketData.revenueDistribution.individual || 0,
            },
            {
              name: "Meal Package",
              value:
                useDataType === "tickets"
                  ? ticketData.ticketCounts.meal || 0
                  : ticketData.revenueDistribution.meal || 0,
              tickets: ticketData.ticketCounts.meal || 0,
              revenue: ticketData.revenueDistribution.meal || 0,
            },
            {
              name: "Family Pack",
              value:
                useDataType === "tickets"
                  ? ticketData.ticketCounts.family || 0
                  : ticketData.revenueDistribution.family || 0,
              tickets: ticketData.ticketCounts.family || 0,
              revenue: ticketData.revenueDistribution.family || 0,
            },
            {
              name: "Group Package",
              value:
                useDataType === "tickets"
                  ? ticketData.ticketCounts.group || 0
                  : ticketData.revenueDistribution.group || 0,
              tickets: ticketData.ticketCounts.group || 0,
              revenue: ticketData.revenueDistribution.group || 0,
            },
          ];

          // Remove zero values to avoid empty pie segments
          const filteredData = chartData.filter((item) => item.value > 0);

          if (filteredData.length === 0) {
            setError("No ticket sales data for this month");
          }

          setData(filteredData);
        } else {
          console.error("Invalid response format:", response.data);
          setError("Error loading ticket distribution data");
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching ticket distribution data:", error);
        setError("Failed to fetch ticket distribution data");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        No ticket data available for this month
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <div className="text-sm text-muted-foreground mb-2 text-center">
        {dataType === "tickets" ? "Tickets Sold" : "Revenue Distribution"}
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              const entry = props.payload;
              if (dataType === "tickets") {
                return [`${entry.tickets} tickets`, entry.name];
              } else {
                return [formatCurrency(entry.revenue), entry.name];
              }
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketTypeDistribution;
