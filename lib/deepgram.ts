import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

export interface TranscriptResult {
  text: string;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: number;
  }>;
  isFinal: boolean;
  confidence: number;
  speaker?: number;
}

export interface DeepgramStreamOptions {
  onTranscript: (result: TranscriptResult) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

export class DeepgramTranscriber {
  private client: ReturnType<typeof createClient>;
  private connection: ReturnType<ReturnType<typeof createClient>["listen"]["live"]> | null = null;
  private isConnected = false;

  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPGRAM_API_KEY is not set");
    }
    this.client = createClient(apiKey);
  }

  async startStreaming(options: DeepgramStreamOptions): Promise<void> {
    const { onTranscript, onError, onClose } = options;

    try {
      this.connection = this.client.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        punctuate: true,
        diarize: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true,
        encoding: "webm",
        sample_rate: 48000,
      });

      this.connection.on(LiveTranscriptionEvents.Open, () => {
        this.isConnected = true;
        console.log("Deepgram connection opened");
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel?.alternatives?.[0];
        if (!transcript) return;

        const result: TranscriptResult = {
          text: transcript.transcript || "",
          words: transcript.words?.map((w: { word: string; start: number; end: number; confidence: number; speaker?: number }) => ({
            word: w.word,
            start: w.start,
            end: w.end,
            confidence: w.confidence,
            speaker: w.speaker,
          })) || [],
          isFinal: data.is_final || false,
          confidence: transcript.confidence || 0,
          speaker: transcript.words?.[0]?.speaker,
        };

        if (result.text.trim()) {
          onTranscript(result);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error("Deepgram error:", error);
        onError(new Error(String(error)));
      });

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        this.isConnected = false;
        console.log("Deepgram connection closed");
        onClose();
      });

    } catch (error) {
      console.error("Failed to start Deepgram streaming:", error);
      throw error;
    }
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (this.connection && this.isConnected) {
      // Convert to Uint8Array which is compatible with WebSocket
      const uint8Array = new Uint8Array(audioData);
      this.connection.send(uint8Array.buffer as ArrayBuffer);
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      this.connection.requestClose();
      this.connection = null;
      this.isConnected = false;
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton for reuse
let transcriber: DeepgramTranscriber | null = null;

export function getDeepgramTranscriber(): DeepgramTranscriber {
  if (!transcriber) {
    transcriber = new DeepgramTranscriber();
  }
  return transcriber;
}
