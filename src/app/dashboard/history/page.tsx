"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Message {
  _id: string;
  message: string;
  link?: string;
  isPinned: boolean;
  isSent: boolean;
  scheduledAt?: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/messages/admin/history");
      const messagesData = res.data?.data?.messages ?? [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch {
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Messages from the last 2 days — {messages.length} record
          {messages.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistory}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={`mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading history...</p>
      ) : !Array.isArray(messages) || messages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No messages in the last 2 days</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg._id}
              className={msg.isPinned ? "border-yellow-400" : ""}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {msg.isPinned && (
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-400"
                    >
                      📌 Pinned
                    </Badge>
                  )}
                  {msg.isSent ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      ✅ Sent
                    </Badge>
                  ) : msg.scheduledAt ? (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      🕐 Scheduled
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      ⚡ Instant
                    </Badge>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-sm text-gray-800">{msg.message}</p>

                {msg.link && (
                  <a
                    href={msg.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                  >
                    <LinkIcon size={12} />
                    {msg.link}
                  </a>
                )}

                {msg.scheduledAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    Scheduled for: {new Date(msg.scheduledAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
