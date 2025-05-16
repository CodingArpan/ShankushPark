import React, { useState, useEffect } from "react";
import axios from "axios";
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

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}api/stats/monthly`,
          {
            params: { year },
            timeout: 10000, // Add timeout to prevent infinite loading
          }
        );

        if (response.data && response.data.success) {
          // Add months that have no data
          const fullYearData = [];
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          months.forEach((month, i) => {
            const monthData = response.data.data.find(
              (item) => item.month === i + 1
            );

            if (monthData) {
              fullYearData.push({
                name: month,
                month: i + 1,
                individual: monthData.individual || 0,
                meal: monthData.meal || 0,
                family: monthData.family || 0,
                group: monthData.group || 0,
                total: monthData.revenue || 0,
              });
            } else {
              fullYearData.push({
                name: month,
                month: i + 1,
                individual: 0,
                meal: 0,
                family: 0,
                group: 0,
                total: 0,
              });
            }
          });

          setData(fullYearData);

          // Check if there's any revenue data at all
          const totalRevenue = fullYearData.reduce(
            (sum, item) => sum + item.total,
            0
          );
          if (totalRevenue === 0) {
            setError(`No revenue data available for ${year}`);
          }
        } else {
          console.error("Invalid response format:", response.data);
          setError("Failed to load revenue data");
          setEmptyData();
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setError("Failed to fetch revenue data");
        setEmptyData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const setEmptyData = () => {
    // Set empty data
    const emptyData = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].map((month, i) => ({
      name: month,
      month: i + 1,
      individual: 0,
      meal: 0,
      family: 0,
      group: 0,
      total: 0,
    }));
    setData(emptyData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get current month to highlight it
  // const currentMonth = new Date().getMonth() + 1; // 1-indexed

  return (
    <div className="h-[300px] w-full">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Showing revenue for:
        </span>
        <select
          value={year}
          onChange={handleYearChange}
          className="bg-background border border-input rounded-md px-2 py-1 text-sm"
        >
          <option value={year - 2}>{year - 2}</option>
          <option value={year - 1}>{year - 1}</option>
          <option value={year}>{year}</option>
        </select>
      </div>

      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => value.substring(0, 3)}
          />
          <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value) => [formatCurrency(value), "Revenue"]}
            itemStyle={{ padding: "2px 0" }}
          />
          <Legend wrapperStyle={{ fontSize: "10px" }} />
          <Bar
            dataKey="individual"
            name="Individual"
            stackId="a"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="meal"
            name="Meal Package"
            stackId="a"
            fill="#82ca9d"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="family"
            name="Family Pack"
            stackId="a"
            fill="#ffc658"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="group"
            name="Group Package"
            stackId="a"
            fill="#ff8042"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
