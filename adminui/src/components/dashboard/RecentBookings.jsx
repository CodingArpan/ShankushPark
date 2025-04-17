import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { TicketIcon } from "lucide-react";

const RecentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/bookings?limit=5"
        );

        if (response.data.success) {
          setBookings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching recent bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    return format(new Date(dateStr), "MMM dd, yyyy");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
        <TicketIcon className="h-12 w-12 mb-2 opacity-20" />
        <p>No recent bookings</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="flex items-center space-x-4 border-b border-border pb-3"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <TicketIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium truncate">{booking.name}</p>
              <span className="text-xs text-muted-foreground">
                {formatDate(booking.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {booking.ticketType} - {booking.numberOfVisitors}{" "}
                {booking.numberOfVisitors === 1 ? "person" : "people"}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  booking.paymentStatus === "completed"
                    ? "bg-green-100 text-green-800"
                    : booking.paymentStatus === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {booking.paymentStatus.charAt(0).toUpperCase() +
                  booking.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">
              {formatCurrency(booking.totalAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(booking.visitDate)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentBookings;
