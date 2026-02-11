"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

interface UsageMeterProps {
  usedMinutes: number;
  limitMinutes: number;
  plan: string;
}

export function UsageMeter({ usedMinutes, limitMinutes, plan }: UsageMeterProps) {
  const percentage = Math.min((usedMinutes / limitMinutes) * 100, 100);
  const remaining = Math.max(limitMinutes - usedMinutes, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Recording Usage</CardTitle>
          <CardDescription>
            {plan} Plan • Resets monthly
          </CardDescription>
        </div>
        {plan === "Free" && (
          <Button asChild size="sm" variant="outline">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <span>{formatTime(usedMinutes)} used</span>
            <span className="text-muted-foreground">{formatTime(remaining)} remaining</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground text-right">
            {formatTime(limitMinutes)} total
          </p>
        </div>

        {percentage >= 80 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 shadow-sm">
            ⚠️ You've used {Math.round(percentage)}% of your monthly limit.{" "}
            <Link href="/pricing" className="underline font-medium hover:text-yellow-900">
              Upgrade now
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
