
"use client";

import { DragEvent, useEffect, useState } from "react";
import { removeImageBackground } from "@/lib/backgroundRemove";
import { downloadBlob } from "@/lib/imageTools";

export default function BackgroundRemove() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Create preview for selected image
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Cleanup generated result URL
  useEffect(() => {
    return () => {
      if (result) {
        URL.revokeObjectURL(result);
      }
    };
  }, [result]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleFile = (selected?: File) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    // Revoke previous result URL before replacing it
    if (result) {
      URL.revokeObjectURL(result);
    }

    setFile(selected);
    setResult(null);
    setResultBlob(null);
  };

  const removeFile = () => {
    if (loading) return;

    if (result) {
      URL.revokeObjectURL(result);
    }

    setFile(null);
    setPreview(null);
    setResult(null);
    setResultBlob(null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const removeBackground = async () => {
    if (!file) {
      alert("Please select an image.");
      return;
    }

    try {
      setLoading(true);

      // Remove background
      const blob = await removeImageBackground(file);

      // Create preview URL
      const resultUrl = URL.createObjectURL(blob);

      // Store result for preview and manual download
      setResult(resultUrl);
      setResultBlob(blob);
    } catch (error) {
      console.error("Background removal error:", error);

      alert(
        "Failed to remove background. Please try another image."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob || !file) {
      return;
    }

    const filename = file.name.replace(
      /\.(jpg|jpeg|png|webp|gif|bmp|avif)$/i,
      "_no_background.png"
    );

    downloadBlob(resultBlob, filename);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
              />
              <path d="m3 16 5-5 4 4 3-3 6 6" />
              <path d="M15 8h.01" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Remove Image Background
            </h2>

            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Automatically remove the background and create
              a transparent PNG.
            </p>
          </div>
        </div>
      </div>

      {/* Upload / Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Original Image */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Original Image
              </h3>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Source image
              </p>
            </div>

            {file && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ready
              </span>
            )}
          </div>

          {!preview ? (
            <label
              htmlFor="background-image-upload"
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => {
                setDragging(false);
              }}
              onDrop={handleDrop}
              className={`group flex min-h-\[320px\] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition ${
                dragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
              }`}
            >
              <input
                id="background-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleFile(event.target.files?.[0])
                }
              />

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-105 dark:bg-blue-950/50 dark:text-blue-400">
                <svg
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                  />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <path d="m3 16 5-5 4 4 3-3 6 5" />
                </svg>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {dragging
                  ? "Drop your image here"
                  : "Drop your image here"}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                or choose an image from your device
              </p>

              <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-blue-700">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>

                Choose Image
              </span>

              <p className="mt-4 text-xs text-slate-400">
                JPG, PNG, WEBP, GIF and other image formats
              </p>
            </label>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex min-h-\[320px\] items-center justify-center p-4">
                <img
                  src={preview}
                  alt="Original image"
                  className="max-h-\[320px\] max-w-full object-contain"
                />
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {file?.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {file
                        ? formatSize(file.size)
                        : "Image"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={loading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Result
              </h3>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Transparent background
              </p>
            </div>

            {result && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
                Done
              </span>
            )}
          </div>

          {/* Transparent checkerboard preview */}
          <div
            className="flex min-h-\[320px\] items-center justify-center overflow-hidden rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
              backgroundSize: "24px 24px",
              backgroundPosition:
                "0 0, 0 12px, 12px -12px, -12px 0px",
            }}
          >
            {result ? (
              <img
                src={result}
                alt="Background removed result"
                className="max-h-\[320px\] max-w-full object-contain"
              />
            ) : (
              <div className="px-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-slate-400 shadow-sm dark:bg-slate-900/80 dark:text-slate-500">
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                    />
                    <path d="m3 16 5-5 4 4 3-3 6 6" />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Result will appear here
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  The background will be replaced with
                  transparency.
                </p>
              </div>
            )}
          </div>

          {/* Manual Download */}
          {resultBlob && (
            <button
              type="button"
              onClick={downloadResult}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>

              Download PNG
            </button>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Automatic Removal */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 3v18M3 12h18" />
                <path d="m7 7 5-4 5 4M7 17l5 4 5-4" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Automatic Removal
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI-powered background removal
              </p>
            </div>
          </div>
        </div>

        {/* Local Processing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Local Processing
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your image stays in the browser
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action */}
      <button
        type="button"
        onClick={removeBackground}
        disabled={!file || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
              />

              <path
                className="opacity-90"
                fill="currentColor"
                d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
              />
            </svg>

            Removing Background...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>

            Remove Background
          </>
        )}
      </button>

      {/* Privacy Footer */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
          />

          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>

        Background removal runs locally in your browser.
        No files are uploaded to a server.
      </div>
    </div>
  );
}
