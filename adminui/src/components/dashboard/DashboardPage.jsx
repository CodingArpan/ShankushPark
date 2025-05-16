import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsOverview from "./StatsOverview";
import VisitorChart from "./VisitorChart";
import RevenueChart from "./RevenueChart";
import TicketTypeDistribution from "./TicketTypeDistribution";
import RecentBookings from "./RecentBookings";

const DashboardPage = () => {
  const [todayStats, setTodayStats] = useState({
    currentVisitorsInPark: 0,
    expectedVisitors: 0,
    ticketsSold: 0,
    revenue: 0,
    visitorCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stats/today`,
          { timeout: 10000 } // Add timeout to prevent infinite loading
        );

        if (response.data && response.data.success) {
          setTodayStats(response.data.data);
        } else {
          console.error("Invalid response format:", response.data);
          setError("Invalid server response");
        }
      } catch (error) {
        console.error("Error fetching today stats:", error);
        setError("Failed to fetch current statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayStats();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchTodayStats, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StatsOverview stats={todayStats} isLoading={isLoading} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visitor Trends</CardTitle>
                <CardDescription>
                  Daily visitor count for the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VisitorChart />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ticket Distribution</CardTitle>
                <CardDescription>
                  Breakdown of ticket types sold this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TicketTypeDistribution />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest ticket bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentBookings />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed visitor and revenue analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics features coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate custom reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reporting features coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
