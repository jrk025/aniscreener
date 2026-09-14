"use client";

import { useRef, useState } from "react";
import type { IdentifyResponse } from "@/lib/types";
import ResultPanel from "@/components/ResultPanel";
import { UploadIcon, XIcon } from "@/components/icons";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function Screener() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFile(candidate: File) {
    if (!candidate.type.startsWith("image/")) {
      setLocalError("Please choose an image file.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setLocalError("Image is larger than 10MB.");
      return;
    }
    setLocalError(null);
    setResult(null);
    setFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function identify() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setLocalError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/identify", { method: "POST", body: formData });
      const data = (await res.json()) as IdentifyResponse;
      setResult(data);
    } catch {
      setLocalError("Couldn't reach the recognition service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) selectFile(dropped);
        }}
        className={`flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-accent bg-accent/5" : "border-border hover:border-muted"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const chosen = e.target.files?.[0];
            if (chosen) selectFile(chosen);
          }}
        />

        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Selected character"
            className="max-h-56 rounded-xl object-contain"
          />
        ) : (
          <>
            <UploadIcon className="h-8 w-8 text-muted" />
            <div>
              <p className="text-lg font-medium">Drop an anime character image here</p>
              <p className="text-sm text-muted">or click to browse — PNG, JPG, WebP up to 10MB</p>
            </div>
          </>
        )}
      </div>

      {localError && <p className="text-sm text-red-400">{localError}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={identify}
          disabled={!file || loading}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Identify anime"}
        </button>
        {file && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {result && <ResultPanel result={result} />}
    </div>
  );
}
