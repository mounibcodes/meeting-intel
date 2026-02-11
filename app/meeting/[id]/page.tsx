import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { EmailDraft } from "@/components/email-draft";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Clock, 
  Calendar,
  CheckCircle2,
  Copy,
  Loader2
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const sentimentColors: Record<string, string> = {
  POSITIVE: "bg-green-100 text-green-800",
  NEUTRAL: "bg-gray-100 text-gray-800",
  NEGATIVE: "bg-red-100 text-red-800",
  CONCERNED: "bg-yellow-100 text-yellow-800",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const meeting = await prisma.meeting.findFirst({
    where: {
      id,
      user: { clerkId: userId },
    },
    include: {
      user: true,
    },
  });

  if (!meeting) {
    notFound();
  }

  const actionItems = (meeting.actionItems as Array<{
    task: string;
    owner?: string;
    deadline?: string;
    priority: string;
  }>) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {meeting.createdAt.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(meeting.duration)}
                </span>
                {meeting.sentiment && (
                  <Badge className={sentimentColors[meeting.sentiment]}>
                    {meeting.sentiment.toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>

            <Badge
              variant={meeting.status === "COMPLETED" ? "default" : "secondary"}
            >
              {meeting.status === "PROCESSING" && (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              )}
              {meeting.status === "COMPLETED" && (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              )}
              {meeting.status}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="actions">Action Items</TabsTrigger>
            <TabsTrigger value="email">Follow-up Email</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-3">Meeting Summary</h2>
              {meeting.summary ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {meeting.summary}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  {meeting.status === "PROCESSING"
                    ? "Analysis in progress..."
                    : "No summary available. Complete the recording to generate analysis."}
                </p>
              )}
            </div>
          </TabsContent>

          {/* Action Items Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-3">Action Items</h2>
              {actionItems.length > 0 ? (
                <ul className="space-y-3">
                  {actionItems.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.task}</p>
                        <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                          {item.owner && <span>Owner: {item.owner}</span>}
                          {item.deadline && <span>Due: {item.deadline}</span>}
                          <Badge
                            variant={
                              item.priority === "high"
                                ? "destructive"
                                : item.priority === "medium"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">
                  No action items identified.
                </p>
              )}
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <EmailDraft
              meetingId={meeting.id}
              initialEmail={meeting.followUpEmail}
              hasSummary={!!meeting.summary}
            />
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="space-y-4">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Full Transcript</h2>
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              {meeting.transcript ? (
                <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm">
                    {meeting.transcript}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No transcript available.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
