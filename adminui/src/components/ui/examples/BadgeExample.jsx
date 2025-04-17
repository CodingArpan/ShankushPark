import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BadgeExample = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Badge Component</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>
            Different style variants available for the Badge component.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Badge Usage Examples</CardTitle>
          <CardDescription>
            Examples of how badges can be used in common UI patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status Indicators</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant="success">Completed</Badge>
              <Badge variant="info">In Progress</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="destructive">Failed</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">With Count</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span>Notifications</span>
                <Badge variant="default">5</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Messages</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Alerts</span>
                <Badge variant="destructive">3</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Feature Labels</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">New</Badge>
              <Badge variant="secondary">Updated</Badge>
              <Badge variant="outline">Beta</Badge>
              <Badge variant="info">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Styling</CardTitle>
          <CardDescription>
            Examples of custom styling using additional className props.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-purple-500 text-white hover:bg-purple-600">
              Custom Purple
            </Badge>
            <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0">
              Gradient
            </Badge>
            <Badge className="border-2 border-dashed">Dashed Border</Badge>
            <Badge className="rounded-sm">Square Corners</Badge>
            <Badge className="text-base px-4 py-1">Larger Badge</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeExample;
