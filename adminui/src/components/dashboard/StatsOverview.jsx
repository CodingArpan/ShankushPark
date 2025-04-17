import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TicketIcon,
  DollarSign,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const StatsCard = ({
  title,
  value,
  description,
  icon,
  className,
  badgeText,
  badgeVariant,
}) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {badgeText && (
            <Badge variant={badgeVariant || "secondary"} className="ml-2">
              {badgeText}
            </Badge>
          )}
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const StatsOverview = ({ stats, isLoading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-4/5"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const occupancyRate =
    stats.expectedVisitors > 0
      ? Math.round((stats.visitorCount / stats.expectedVisitors) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Current Visitors"
        value={stats.currentVisitorsInPark}
        description={`${stats.expectedVisitors} expected today`}
        icon={<UserCheck className="h-4 w-4 text-blue-500" />}
        badgeText="Live"
        badgeVariant="info"
      />

      <StatsCard
        title="Total Visitors"
        value={stats.visitorCount}
        description={`${occupancyRate}% of expected visitors`}
        icon={<Users className="h-4 w-4 text-green-500" />}
        badgeText={`${occupancyRate}%`}
        badgeVariant="success"
      />

      <StatsCard
        title="Tickets Sold"
        value={stats.ticketsSold}
        description="Total tickets sold today"
        icon={<TicketIcon className="h-4 w-4 text-yellow-500" />}
      />

      <StatsCard
        title="Revenue"
        value={formatCurrency(stats.revenue)}
        description="Total revenue today"
        icon={<DollarSign className="h-4 w-4 text-red-500" />}
      />
    </div>
  );
};

export default StatsOverview;
