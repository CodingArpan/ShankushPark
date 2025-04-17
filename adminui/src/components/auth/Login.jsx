import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Eye, EyeOff } from "lucide-react";

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setIsLoading(true);

      // For demo purposes, we're using a hardcoded login
      // In a real application, you would use a proper API call:

      // const response = await axios.post("http://localhost:3000/api/auth/login", {
      //   username,
      //   password,
      // });

      // if (response.data.success) {
      //   localStorage.setItem("token", response.data.token);
      //   setIsAuthenticated(true);
      //   navigate("/dashboard");
      // }

      // Mock successful login for demo
      setTimeout(() => {
        // Using admin/admin as demo credentials
        if (username === "admin" && password === "admin") {
          localStorage.setItem("token", "demo-token-12345");
          setIsAuthenticated(true);
          navigate("/dashboard");
        } else {
          setError("Invalid username or password");
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Login failed");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">AmusePark Admin</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo credentials: admin / admin</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
