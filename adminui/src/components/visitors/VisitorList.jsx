import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Check, X, Search, RefreshCw } from "lucide-react";

const VisitorList = () => {
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVisitors, setFilteredVisitors] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/visitors/today"
      );

      if (response.data.success) {
        setVisitors(response.data.data);
        setFilteredVisitors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchVisitors, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter visitors based on search term
    if (searchTerm.trim() === "") {
      setFilteredVisitors(visitors);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = visitors.filter(
        (visitor) =>
          visitor.visitorName.toLowerCase().includes(term) ||
          visitor.ticketNumber.toLowerCase().includes(term)
      );
      setFilteredVisitors(filtered);
    }

    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchTerm, visitors]);

  const formatTime = (dateStr) => {
    return format(new Date(dateStr), "h:mm a");
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVisitors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRecordExit = async (entryId) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/visitors/exit/${entryId}`
      );

      if (response.data.success) {
        // Update local state
        const updatedVisitors = visitors.map((visitor) =>
          visitor._id === entryId
            ? { ...visitor, isExited: true, exitTime: new Date() }
            : visitor
        );
        setVisitors(updatedVisitors);
      }
    } catch (error) {
      console.error("Error recording exit:", error);
      alert("Failed to record exit. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Visitors</CardTitle>
              <CardDescription>
                {filteredVisitors.length} visitors recorded today
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ticket"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchVisitors}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="mb-2">No visitors found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search criteria</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Visitor Name</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((visitor) => (
                    <TableRow key={visitor._id}>
                      <TableCell className="font-medium font-mono">
                        {visitor.ticketNumber}
                      </TableCell>
                      <TableCell>{visitor.visitorName}</TableCell>
                      <TableCell>{formatTime(visitor.entryTime)}</TableCell>
                      <TableCell>
                        {visitor.exitTime ? formatTime(visitor.exitTime) : "-"}
                      </TableCell>
                      <TableCell>
                        {visitor.isExited ? (
                          <div className="flex items-center">
                            <Check className="h-3 w-3 mr-1 text-green-500" />
                            <Badge variant="secondary">Exited</Badge>
                          </div>
                        ) : (
                          <Badge variant="info">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!visitor.isExited && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecordExit(visitor._id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Record Exit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {filteredVisitors.length > itemsPerPage && (
          <CardFooter className="flex justify-center">
            <div className="flex space-x-1">
              {[
                ...Array(Math.ceil(filteredVisitors.length / itemsPerPage)),
              ].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(i + 1)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VisitorList;
