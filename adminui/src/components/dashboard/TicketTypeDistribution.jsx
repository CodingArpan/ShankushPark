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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/stats/ticket-types"
        );

        if (response.data.success) {
          const ticketData = response.data.data;

          // Transform data for pie chart
          const chartData = [
            {
              name: "Individual",
              value: ticketData.ticketCounts.individual,
              revenue: ticketData.revenueDistribution.individual,
            },
            {
              name: "Meal Package",
              value: ticketData.ticketCounts.meal,
              revenue: ticketData.revenueDistribution.meal,
            },
            {
              name: "Family Pack",
              value: ticketData.ticketCounts.family,
              revenue: ticketData.revenueDistribution.family,
            },
            {
              name: "Group Package",
              value: ticketData.ticketCounts.group,
              revenue: ticketData.revenueDistribution.group,
            },
          ];

          // Remove zero values to avoid empty pie segments
          setData(chartData.filter((item) => item.value > 0));
        }
      } catch (error) {
        console.error("Error fetching ticket distribution data:", error);
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
    index,
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

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        No ticket data available
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
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
              if (name === "value") {
                return [`${value} tickets`, "Count"];
              }
              if (name === "revenue") {
                return [formatCurrency(value), "Revenue"];
              }
              return [value, name];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketTypeDistribution;
