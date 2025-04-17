import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

// Layout Components
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// Page Components
import DashboardPage from "@/components/dashboard/DashboardPage";
import VerifyVisitor from "@/components/visitors/VerifyVisitor";
import VisitorList from "@/components/visitors/VisitorList";
import BadgeExample from "@/components/ui/examples/BadgeExample";

// Auth Components
import Login from "@/components/auth/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {isAuthenticated ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header setIsAuthenticated={setIsAuthenticated} />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/visitors">
                    <Route index element={<VisitorList />} />
                    <Route path="verify" element={<VerifyVisitor />} />
                  </Route>
                  <Route path="/ui/examples/badge" element={<BadgeExample />} />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Routes>
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
