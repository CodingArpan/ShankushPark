import React, { useState, useEffect } from "react";
import { Bell, User, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Header = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("");
  const [userData, setUserData] = useState({
    name: "Admin User",
    role: "Administrator",
  });

  useEffect(() => {
    // Set page title based on path
    const path = location.pathname;
    if (path.includes("/dashboard")) {
      setPageTitle("Dashboard");
    } else if (path.includes("/visitors/verify")) {
      setPageTitle("Verify Visitor");
    } else if (path.includes("/visitors")) {
      setPageTitle("Visitor Management");
    } else if (path.includes("/bookings")) {
      setPageTitle("Bookings");
    } else if (path.includes("/reports")) {
      setPageTitle("Reports & Analytics");
    } else if (path.includes("/settings")) {
      setPageTitle("Settings");
    } else if (path.includes("/ui/examples/badge")) {
      setPageTitle("Badge Component");
    } else {
      setPageTitle("Amusement Park Admin");
    }

    // Fetch user data (if needed)
    // This is a placeholder - in a real app, you would fetch user data from an API
    const token = localStorage.getItem("token");
    if (token) {
      // Example API call:
      // axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      //   .then(response => setUserData(response.data))
      //   .catch(error => console.error("Error fetching user data:", error));
    }
  }, [location]);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-xl font-semibold">{pageTitle}</h1>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
          />
        </div>

        <div className="relative">
          <button className="rounded-full p-1.5 hover:bg-accent">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0">
              3
            </Badge>
          </button>
        </div>

        <div className="flex items-center space-x-2 border-l pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium">{userData.name}</div>
            <div className="text-xs text-muted-foreground">{userData.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
