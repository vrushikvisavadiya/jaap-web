"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pin, Trash2, Plus, Link as LinkIcon, Clock } from "lucide-react";
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

const defaultForm = {
  title: "",
  message: "",
  link: "",
  scheduledAt: "",
  deviceType: "both" as "android" | "ios" | "both",
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/api/messages");
      const messagesData = res.data?.data?.messages ?? [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        title: form.title,
        body: form.message,
        deviceType: form.deviceType,
      };
      if (form.link) payload.link = form.link;
      if (form.scheduledAt)
        payload.scheduledAt = new Date(form.scheduledAt).toISOString();

      const res = await api.post("/api/messages/send-notification", payload);

      if (res.data?.data?.scheduled) {
        const deviceTypeText =
          form.deviceType === "both" ? "all" : form.deviceType.toUpperCase();
        toast.success(
          `Message scheduled for ${new Date(form.scheduledAt).toLocaleString()} (${deviceTypeText} devices)`,
        );
      } else if (res.data?.data?.success) {
        const notification = res.data.data.notification;
        const deviceTypeText =
          form.deviceType === "both" ? "all" : form.deviceType.toUpperCase();
        toast.success(
          `Notification sent to ${notification?.successCount || 0} ${deviceTypeText} devices!`,
        );
      } else {
        toast.warning(res.data?.data?.error || "Message created but not sent");
      }

      setForm(defaultForm);
      setOpen(false);
      fetchMessages();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to send notification",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/messages/${id}`);
      toast.success("Message deleted");
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handlePin = async (id: string) => {
    try {
      const res = await api.put(`/api/messages/${id}/pin`);
      toast.success(res.data?.message ?? "Pin status updated");
      fetchMessages();
    } catch {
      toast.error("Failed to update pin status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? "s" : ""} total
        </p>

        {/* Create Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus size={16} className="mr-2" />
            New Message
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Notification title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Description *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message description..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link">Link (optional)</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="deviceType">Send To *</Label>
                <select
                  id="deviceType"
                  value={form.deviceType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deviceType: e.target.value as "android" | "ios" | "both",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="both">Both (Android & iOS)</option>
                  <option value="android">Android Only</option>
                  <option value="ios">iOS Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="scheduledAt">Schedule At (optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm({ ...form, scheduledAt: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      ) : !Array.isArray(messages) || messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No messages yet. Create one!
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg._id}
              className={msg.isPinned ? "border-yellow-400 gap-2" : "gap-2"}
            >
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
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
                      Sent
                    </Badge>
                  ) : msg.scheduledAt ? (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      Scheduled
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Instant
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePin(msg._id)}
                    title={msg.isPinned ? "Unpin" : "Pin"}
                    className={
                      msg.isPinned ? "text-yellow-500" : "text-gray-400"
                    }
                  >
                    <Pin size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(msg._id)}
                    title="Delete"
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
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

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {msg.scheduledAt
                    ? `Scheduled: ${new Date(msg.scheduledAt).toLocaleString()}`
                    : `Created: ${new Date(msg.createdAt).toLocaleString()}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
