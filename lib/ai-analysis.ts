import Groq from "groq-sdk";
import { z } from "zod";

// Zod schema for AI analysis response
export const AnalysisResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string().optional(),
      deadline: z.string().optional(),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
  nextSteps: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative", "concerned"]),
  talkRatio: z.record(z.string(), z.number()).optional(),
  keyDecisions: z.array(z.string()),
  concerns: z.array(z.string()),
  opportunities: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

const ANALYSIS_PROMPT = `You are an expert meeting analyst. Analyze the following meeting transcript and provide structured insights.

Your response MUST be valid JSON matching this exact structure (no markdown, just raw JSON):
{
  "title": "A short, descriptive, professional title for this meeting (e.g. 'Marketing Q3 Review', 'Project Alpha Kickoff')",
  "summary": "2-3 paragraph summary of the meeting",
  "keyPoints": ["key point 1", "key point 2"],
  "actionItems": [
    {
      "task": "description of the task",
      "owner": "person responsible (or 'Unassigned')",
      "deadline": "mentioned deadline or 'Not specified'",
      "priority": "high"
    }
  ],
  "nextSteps": "What should happen next",
  "sentiment": "positive",
  "keyDecisions": ["decision 1", "decision 2"],
  "concerns": ["concern 1"],
  "opportunities": ["opportunity 1"]
}

Focus on:
- Generating a concise, relevant TITLE based on the main topic discussed
- Identifying actionable tasks with clear owners
- Extracting key decisions made during the meeting
- Noting any concerns or risks mentioned
- Highlighting opportunities discussed
- Providing an accurate sentiment assessment (positive, neutral, negative, or concerned)

TRANSCRIPT:
`;

export async function analyzeTranscript(
  transcript: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  if (!transcript || transcript.trim().length < 50) {
    throw new Error("Transcript too short for meaningful analysis");
  }

  const client = new Groq({ apiKey });

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: ANALYSIS_PROMPT + transcript,
      },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from Groq");
  }

  try {
    const parsed = JSON.parse(content);
    return AnalysisResultSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse analysis results");
  }
}

// Follow-up email generator
const EMAIL_PROMPT = `You are a professional assistant who writes follow-up emails after meetings.

Based on the meeting information below, write a professional follow-up email that:
- Thanks participants for their time
- Briefly recaps key discussion points (2-3 sentences)
- Lists action items with owners and deadlines
- Suggests next steps
- Sounds natural and personalized (not robotic)
- Uses appropriate tone based on sentiment

MEETING INFO:
Title: {title}
Date: {date}
Summary: {summary}
Key Points: {keyPoints}
Action Items: {actionItems}
Next Steps: {nextSteps}
Sentiment: {sentiment}
Tone: {tone}

Write only the email body (no subject line). Start with the greeting.`;

export interface EmailInput {
  title: string;
  date: string;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    task: string;
    owner?: string;
    deadline?: string;
  }>;
  nextSteps: string;
  sentiment: string;
  tone: "formal" | "casual" | "friendly";
}

export async function generateFollowUpEmail(input: EmailInput): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const client = new Groq({ apiKey });

  const prompt = EMAIL_PROMPT
    .replace("{title}", input.title)
    .replace("{date}", input.date)
    .replace("{summary}", input.summary)
    .replace("{keyPoints}", input.keyPoints.join(", "))
    .replace(
      "{actionItems}",
      input.actionItems
        .map((a) => `- ${a.task} (Owner: ${a.owner || "TBD"}, Due: ${a.deadline || "TBD"})`)
        .join("\n")
    )
    .replace("{nextSteps}", input.nextSteps)
    .replace("{sentiment}", input.sentiment)
    .replace("{tone}", input.tone);

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from Groq");
  }

  return content;
}
