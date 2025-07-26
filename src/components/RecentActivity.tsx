import { CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "completed",
      title: "Parking Lot Resurfacing - Mall Plaza",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      id: 2,
      type: "pending",
      title: "Equipment Maintenance Due - Paver #3",
      time: "4 hours ago",
      icon: Clock,
      color: "text-warning"
    },
    {
      id: 3,
      type: "alert",
      title: "Weather Alert - Rain Expected Tomorrow",
      time: "6 hours ago",
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      id: 4,
      type: "document",
      title: "Quote Approved - Main Street Repairs",
      time: "1 day ago",
      icon: FileText,
      color: "text-info"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <activity.icon className={`mt-0.5 h-5 w-5 ${activity.color}`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}