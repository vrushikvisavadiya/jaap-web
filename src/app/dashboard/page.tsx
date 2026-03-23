"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Pin,
  Send,
  Clock,
  Smartphone,
  Apple,
} from "lucide-react";
import api from "@/lib/api";

interface MessageStats {
  total: number;
  pinned: number;
  sent: number;
  scheduled: number;
}

interface DeviceStats {
  total: number;
  active: number;
  android: number;
  ios: number;
}

export default function DashboardPage() {
  const [messageStats, setMessageStats] = useState<MessageStats>({
    total: 0,
    pinned: 0,
    sent: 0,
    scheduled: 0,
  });

  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    total: 0,
    active: 0,
    android: 0,
    ios: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch message stats
        const messagesRes = await api.get("/api/messages");
        const messages = messagesRes.data?.data?.messages ?? [];

        setMessageStats({
          total: messages.length,
          pinned: messages.filter((m: any) => m.isPinned).length,
          sent: messages.filter((m: any) => m.isSent).length,
          scheduled: messages.filter((m: any) => m.scheduledAt && !m.isSent)
            .length,
        });

        // Fetch device stats
        const devicesRes = await api.get("/api/devices/stats");
        const deviceData = devicesRes.data?.data;

        if (deviceData) {
          setDeviceStats({
            total: deviceData.total ?? 0,
            active: deviceData.active ?? 0,
            android: deviceData.byPlatform?.android ?? 0,
            ios: deviceData.byPlatform?.ios ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Messages",
      value: messageStats.total,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pinned Messages",
      value: messageStats.pinned,
      icon: Pin,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Sent Messages",
      value: messageStats.sent,
      icon: Send,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Scheduled",
      value: messageStats.scheduled,
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Devices",
      value: deviceStats.active,
      icon: Smartphone,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Devices",
      value: deviceStats.total,
      icon: Smartphone,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
    },
    {
      title: "Android Devices",
      value: deviceStats.android,
      icon: Smartphone,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "iOS Devices",
      value: deviceStats.ios,
      icon: Apple,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's a quick overview of your messages and devices.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Message Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Message Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards
                .slice(0, 4)
                .map(({ title, value, icon: Icon, color, bgColor }) => (
                  <Card key={title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon size={18} className={color} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{value}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Device Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Device Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards
                .slice(4, 8)
                .map(({ title, value, icon: Icon, color, bgColor }) => (
                  <Card key={title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon size={18} className={color} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{value}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
