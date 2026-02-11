"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Meeting {
  id: string;
  title: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "PROCESSING" | "COMPLETED" | "FAILED";
  duration: number | null;
  sentiment: string | null;
  createdAt: string;
  startedAt: string | null;
}

interface MeetingsListProps {
  initialMeetings: Meeting[];
}

const statusConfig = {
  SCHEDULED: {
    label: "Scheduled",
    icon: Clock,
    variant: "secondary" as const,
  },
  IN_PROGRESS: {
    label: "Recording",
    icon: Mic,
    variant: "destructive" as const,
  },
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    variant: "secondary" as const,
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "default" as const,
  },
  FAILED: {
    label: "Failed",
    icon: AlertCircle,
    variant: "destructive" as const,
  },
};

const sentimentEmoji: Record<string, string> = {
  POSITIVE: "😊",
  NEUTRAL: "😐",
  NEGATIVE: "😟",
  CONCERNED: "🤔",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MeetingsList({ initialMeetings }: MeetingsListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || meeting.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMeetings((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search meetings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          {["all", "SCHEDULED", "IN_PROGRESS", "PROCESSING", "COMPLETED"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All" : statusConfig[status as keyof typeof statusConfig]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No meetings found</p>
          <Button asChild className="mt-4">
            <Link href="/meeting/new">Start your first meeting</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMeetings.map((meeting) => {
            const config = statusConfig[meeting.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/meeting/${meeting.id}`}
                      className="font-medium hover:underline truncate block"
                    >
                      {meeting.title}
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(meeting.duration)}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(meeting.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {meeting.sentiment && (
                        <span>{sentimentEmoji[meeting.sentiment]}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={config.variant} className="gap-1">
                    <StatusIcon
                      className={`w-3 h-3 ${
                        meeting.status === "PROCESSING" ? "animate-spin" : ""
                      }`}
                    />
                    {config.label}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/meeting/${meeting.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(meeting.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
