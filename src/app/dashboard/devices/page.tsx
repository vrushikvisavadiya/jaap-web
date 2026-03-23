"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Smartphone, Trash2, RefreshCw, Apple } from "lucide-react";
import api from "@/lib/api";

interface Device {
  _id: string;
  fcmToken: string;
  deviceType: "android" | "ios";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeviceStats {
  total: number;
  active: number;
  inactive: number;
  byPlatform: {
    android: number;
    ios: number;
  };
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/devices/active");
      const devicesData = res.data?.data?.devices ?? [];
      setDevices(Array.isArray(devicesData) ? devicesData : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/api/devices/stats");
      setStats(res.data?.data ?? null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchStats();
  }, []);

  const handleDeactivate = async (fcmToken: string) => {
    if (!confirm("Are you sure you want to deactivate this device?")) return;

    try {
      await api.delete(`/api/devices/${encodeURIComponent(fcmToken)}`);
      toast.success("Device deactivated successfully");
      fetchDevices();
      fetchStats();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to deactivate device",
      );
    }
  };

  const handleRefresh = () => {
    fetchDevices();
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registered Devices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all registered devices for push notifications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || statsLoading}
        >
          <RefreshCw
            size={14}
            className={`mr-2 ${loading || statsLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : (stats?.total ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Devices
            </CardTitle>
            <Smartphone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? "..." : (stats?.active ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Android</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : (stats?.byPlatform?.android ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">iOS</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : (stats?.byPlatform?.ios ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading devices...</p>
          ) : !Array.isArray(devices) || devices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active devices registered</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Type</TableHead>
                    <TableHead>FCM Token</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {device.deviceType === "ios" ? (
                            <Apple size={16} className="text-gray-600" />
                          ) : (
                            <Smartphone size={16} className="text-green-600" />
                          )}
                          <span className="capitalize">
                            {device.deviceType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {device.fcmToken.substring(0, 20)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={device.isActive ? "default" : "secondary"}
                          className={
                            device.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : ""
                          }
                        >
                          {device.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(device.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(device.fcmToken)}
                          title="Deactivate Device"
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
