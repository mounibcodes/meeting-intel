// ===========================================
// Core Application Types
// ===========================================

/**
 * Subscription tiers for users
 */
export type SubscriptionTier = "FREE" | "PRO" | "ENTERPRISE";

/**
 * Meeting status states
 */
export type MeetingStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

/**
 * Sentiment analysis results
 */
export type SentimentType = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";

/**
 * Action item from meeting analysis
 */
export interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  dueDate?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  completed: boolean;
}

/**
 * User type matching Prisma schema
 */
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Meeting type matching Prisma schema
 */
export interface Meeting {
  id: string;
  userId: string;
  title: string;
  status: MeetingStatus;
  transcript: string | null;
  audioUrls: string[];
  duration: number | null;
  summary: string | null;
  actionItems: ActionItem[] | null;
  sentiment: SentimentType | null;
  followUpEmail: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Meeting with user relation
 */
export interface MeetingWithUser extends Meeting {
  user: User;
}

// ===========================================
// API Types
// ===========================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Create meeting input
 */
export interface CreateMeetingInput {
  title: string;
  scheduledAt?: Date;
}

/**
 * Update meeting input
 */
export interface UpdateMeetingInput {
  title?: string;
  status?: MeetingStatus;
  transcript?: string;
  summary?: string;
  actionItems?: ActionItem[];
  sentiment?: SentimentType;
  followUpEmail?: string;
}

// ===========================================
// WebSocket Types
// ===========================================

/**
 * WebSocket message types
 */
export type WebSocketMessageType =
  | "TRANSCRIPT_UPDATE"
  | "MEETING_STATUS"
  | "ANALYSIS_COMPLETE"
  | "ERROR";

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  meetingId: string;
  payload: T;
  timestamp: number;
}

/**
 * Transcript update payload
 */
export interface TranscriptUpdatePayload {
  text: string;
  speaker?: string;
  confidence: number;
  isFinal: boolean;
}

// ===========================================
// Component Props Types
// ===========================================

/**
 * Common component props with className
 */
export interface BaseProps {
  className?: string;
}

/**
 * Props for components with children
 */
export interface PropsWithChildren extends BaseProps {
  children: React.ReactNode;
}

/**
 * Meeting card props
 */
export interface MeetingCardProps extends BaseProps {
  meeting: Meeting;
  onSelect?: (meeting: Meeting) => void;
  onDelete?: (meetingId: string) => void;
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  totalMeetings: number;
  totalDuration: number;
  meetingsThisWeek: number;
  actionItemsCount: number;
}
