import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, UserX, UserCheck, Ticket } from "lucide-react";
import { format } from "date-fns";

const VerifyVisitor = () => {
  const [ticketNumber, setTicketNumber] = useState("");
  const [verifierName, setVerifierName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!ticketNumber.trim()) {
      setError("Please enter a ticket number");
      return;
    }

    if (!verifierName.trim()) {
      setError("Please enter verifier name");
      return;
    }

    try {
      setIsVerifying(true);
      setError("");
      setVerificationResult(null);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/visitors/verify`,
        {
          ticketNumber: ticketNumber.trim(),
          verifiedBy: verifierName.trim(),
        }
      );

      if (response.data.success) {
        setVerificationResult({
          status: "success",
          message: "Visitor entry verified successfully",
          details: response.data.data,
        });
        // Clear ticket number for next verification
        setTicketNumber("");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setVerificationResult({
          status: "error",
          message: error.response.data.message || "Verification failed",
          errorCode: error.response.status,
        });
      } else {
        setVerificationResult({
          status: "error",
          message: "Network error. Please try again.",
          errorCode: "NETWORK_ERROR",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateStr) => {
    return format(new Date(dateStr), "PPpp"); // Format: Mar 15, 2023, 3:25 PM
  };

  return (
    <div className="container mx-auto py-6 max-w-xl">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Visitor Verification
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Verify Ticket</CardTitle>
          <CardDescription>
            Enter the ticket number to verify visitor entry
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-number">Ticket Number</Label>
              <Input
                id="ticket-number"
                placeholder="e.g. TKT-20230315-1234"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="font-mono"
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verifier-name">Verified By</Label>
              <Input
                id="verifier-name"
                placeholder="Your name"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTicketNumber("");
                setVerificationResult(null);
                setError("");
              }}
            >
              Clear
            </Button>
            <Button type="submit" disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify Ticket"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {verificationResult && (
        <Card
          className={`mt-6 ${
            verificationResult.status === "success"
              ? "border-green-500"
              : "border-red-500"
          }`}
        >
          <CardHeader
            className={`${
              verificationResult.status === "success"
                ? "bg-green-50"
                : "bg-red-50"
            }`}
          >
            <CardTitle className="flex items-center">
              {verificationResult.status === "success" ? (
                <>
                  <Check className="h-5 w-5 mr-2 text-green-500" />
                  <span className="text-green-700">
                    Verification Successful
                  </span>
                  <Badge variant="success" className="ml-2">
                    Success
                  </Badge>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  <span className="text-red-700">Verification Failed</span>
                  <Badge variant="destructive" className="ml-2">
                    Error
                  </Badge>
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <p className="mb-4">{verificationResult.message}</p>

            {verificationResult.status === "success" &&
              verificationResult.details && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-500 mr-2">Visitor:</span>
                    <span className="font-medium">
                      {verificationResult.details.visitorName}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Ticket className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-500 mr-2">Ticket Type:</span>
                    <span className="font-medium">
                      {verificationResult.details.ticketType}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <UserX className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-500 mr-2">Visitors:</span>
                    <span className="font-medium">
                      {verificationResult.details.numberOfVisitors}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 001.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-500 mr-2">Entry Time:</span>
                    <span className="font-medium">
                      {formatDate(verificationResult.details.entryTime)}
                    </span>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerifyVisitor;
