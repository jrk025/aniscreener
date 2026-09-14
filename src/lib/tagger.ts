const SPACE_URL = "https://smilingwolf-wd-tagger.hf.space";
const MODEL_REPO = "SmilingWolf/wd-eva02-large-tagger-v3";
const GENERAL_THRESHOLD = 0.35;
const CHARACTER_THRESHOLD = 0.4;
const REQUEST_TIMEOUT_MS = 45_000;

interface LabelEntry {
  label: string;
  confidence: number;
}

interface GradioLabelOutput {
  label: string;
  confidences: LabelEntry[];
}

export interface TaggerResult {
  characterTags: LabelEntry[];
  generalTags: LabelEntry[];
}

function authHeaders(): Record<string, string> {
  const token = process.env.HF_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface NormalizedImage {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

async function uploadImage(image: NormalizedImage): Promise<string> {
  const form = new FormData();
  form.append("files", new Blob([new Uint8Array(image.buffer)], { type: image.mimeType }), image.filename);

  const res = await fetch(`${SPACE_URL}/gradio_api/upload`, {
    method: "POST",
    body: form,
    headers: authHeaders(),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Tagger upload failed (${res.status})`);

  const paths = (await res.json()) as string[];
  const path = paths[0];
  if (!path) throw new Error("Tagger upload returned no file path.");
  return path;
}

function parseSSE(raw: string): { event: string; data: string }[] {
  return raw
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event:"));
      const dataLine = lines.find((l) => l.startsWith("data:"));
      return {
        event: eventLine ? eventLine.slice(6).trim() : "message",
        data: dataLine ? dataLine.slice(5).trim() : "",
      };
    });
}

// The space queues predictions over SSE; we submit, then read the stream
// until the "complete" event carrying the final output array shows up.
async function callPredict(serverPath: string, image: NormalizedImage): Promise<unknown[]> {
  const submitRes = await fetch(`${SPACE_URL}/gradio_api/call/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      data: [
        {
          path: serverPath,
          url: null,
          orig_name: image.filename,
          mime_type: image.mimeType,
          meta: { _type: "gradio.FileData" },
        },
        MODEL_REPO,
        GENERAL_THRESHOLD,
        false,
        CHARACTER_THRESHOLD,
        false,
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!submitRes.ok) throw new Error(`Tagger request failed (${submitRes.status})`);

  const { event_id: eventId } = (await submitRes.json()) as { event_id?: string };
  if (!eventId) throw new Error("Tagger did not return an event id.");

  const streamRes = await fetch(`${SPACE_URL}/gradio_api/call/predict/${eventId}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!streamRes.ok) throw new Error(`Tagger result stream failed (${streamRes.status})`);

  const events = parseSSE(await streamRes.text());
  const errorEvent = events.find((e) => e.event === "error");
  if (errorEvent) throw new Error(`Tagger returned an error: ${errorEvent.data}`);

  const completeEvent = events.find((e) => e.event === "complete");
  if (!completeEvent) throw new Error("Tagger stream ended without a result.");

  return JSON.parse(completeEvent.data) as unknown[];
}

function toLabelEntries(output: GradioLabelOutput | undefined): LabelEntry[] {
  if (!output?.confidences) return [];
  return [...output.confidences].sort((a, b) => b.confidence - a.confidence);
}

export async function tagImage(image: NormalizedImage): Promise<TaggerResult> {
  const serverPath = await uploadImage(image);
  const data = await callPredict(serverPath, image);
  const [, , characterRes, generalRes] = data as [
    string,
    GradioLabelOutput,
    GradioLabelOutput,
    GradioLabelOutput,
  ];

  return {
    characterTags: toLabelEntries(characterRes),
    generalTags: toLabelEntries(generalRes),
  };
}
