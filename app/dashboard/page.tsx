import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { MeetingsList } from "@/components/meetings-list";
import { UsageMeter } from "@/components/usage-meter";
import { UpcomingMeetingsWrapper } from "@/components/upcoming-meetings-wrapper";
import { DashboardWidgets } from "@/components/dashboard-widgets";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Get or create user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // Create user if doesn't exist
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: "user@example.com", // Will be updated by webhook
      },
    });
  }

  // Get meetings
  const meetings = await prisma.meeting.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      duration: true,
      sentiment: true,
      createdAt: true,
      startedAt: true,
    },
  });

  // Stats
  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter((m) => m.status === "COMPLETED").length;
  const totalDuration = meetings.reduce((acc, m) => acc + (m.duration || 0), 0);
  
  // Usage
  const planKey = user.subscriptionTier as keyof typeof PLANS;
  const plan = PLANS[planKey] || PLANS.FREE;
  const usageMinutes = user.usageMinutes || 0;

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4 space-y-8">
        {/* Top Row: Usage + Upcoming Meetings */}
        <div className="grid gap-6 md:grid-cols-2">
          <UsageMeter 
            usedMinutes={usageMinutes}
            limitMinutes={plan.minutes}
            plan={plan.name}
          />
          <UpcomingMeetingsWrapper />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{totalMeetings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{completedMeetings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>Your Meetings</CardTitle>
          </CardHeader>
          <div className="p-0">
            <MeetingsList
              initialMeetings={meetings.map((m) => ({
                ...m,
                createdAt: m.createdAt.toISOString(),
                startedAt: m.startedAt?.toISOString() || null,
              }))}
            />
          </div>
        </Card>
      </main>

      {/* Floating widgets for all users (no extension needed) */}
      <DashboardWidgets />
    </div>
  );
}
