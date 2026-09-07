
"use client";

import { useState } from "react";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfToJpeg() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(1.5);
  const [progress, setProgress] = useState(0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getQualityLabel = () => {
    const value = Math.round(quality * 100);

    if (value <= 40) return "Smallest";
    if (value <= 60) return "Balanced";
    if (value <= 80) return "High";
    return "Maximum";
  };

  const getResolutionLabel = () => {
    if (scale <= 1) return "Standard";
    if (scale <= 1.5) return "Good";
    if (scale <= 2) return "High";
    return "Very High";
  };

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setProgress(0);
  };

  const removeFile = () => {
    if (loading) return;

    setFile(null);
    setProgress(0);
  };

  const convert = async () => {
    if (!file) {
      alert("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      // Load PDF.js only in the browser
      const pdfjsLib = await import("pdfjs-dist");

      // Configure PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      // Read PDF
      const buffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
      }).promise;

      const baseName = file.name.replace(/\.pdf$/i, "");

      // Convert each PDF page
      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale,
        });

        // Create canvas
        const canvas = document.createElement("canvas");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Unable to create canvas context.");
        }

        // PDF.js render
        const renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;

        // Convert canvas to JPEG
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            (result) => resolve(result),
            "image/jpeg",
            quality
          );
        });

        if (!blob) {
          throw new Error(
            `Failed to create JPEG for page ${pageNumber}.`
          );
        }

        // Download page
        downloadBlob(
          blob,
          `${baseName}_page_${pageNumber}.jpg`
        );

        // Update progress
        setProgress(
          Math.round(
            (pageNumber / pdf.numPages) * 100
          )
        );

        // Release PDF page resources
        page.cleanup();
      }

      alert("PDF converted to JPEG successfully!");
    } catch (error) {
      console.error("PDF to JPEG error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to convert PDF to JPEG."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      {/* <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          PDF to JPEG
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Convert every page of a PDF document into
          high-quality JPEG images.
        </p>
      </div> */}

      {/* Upload Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!file ? (
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                handleFile(event.target.files?.[0])
              }
              className="hidden"
            />

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <path d="M14 2v6h6" />
                <path d="M8 13h8M8 17h6" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Upload a PDF
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select the PDF you want to convert
            </p>

            <span className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-blue-700">
              Choose PDF
            </span>
          </label>
        ) : (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex items-center gap-4">
              {/* PDF Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8M8 17h5" />
                </svg>
              </div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PDF Document • {formatSize(file.size)}
                </p>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                aria-label="Remove PDF"
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
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conversion Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Conversion Settings
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Adjust image quality and rendering resolution.
          </p>
        </div>

        <div className="space-y-7">
          {/* Quality */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  JPEG Quality
                </label>

                <p className="mt-0.5 text-xs text-slate-400">
                  Balance image quality and file size
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                {Math.round(quality * 100)}%
              </div>
            </div>

            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={quality}
              onChange={(event) =>
                setQuality(Number(event.target.value))
              }
              disabled={loading}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 disabled:cursor-not-allowed dark:bg-slate-700"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Smaller file</span>

              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getQualityLabel()}
              </span>

              <span>Higher quality</span>
            </div>

            {/* Quality Presets */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { value: 0.4, label: "40%" },
                { value: 0.6, label: "60%" },
                { value: 0.8, label: "80%" },
                { value: 0.95, label: "95%" },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setQuality(preset.value)}
                  disabled={loading}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    Math.abs(quality - preset.value) < 0.001
                      ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Rendering Resolution
                </label>

                <p className="mt-0.5 text-xs text-slate-400">
                  Higher values produce larger images
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                {scale}x
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="3"
              step="0.25"
              value={scale}
              onChange={(event) =>
                setScale(Number(event.target.value))
              }
              disabled={loading}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 disabled:cursor-not-allowed dark:bg-slate-700"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>1x</span>

              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getResolutionLabel()}
              </span>

              <span>3x</span>
            </div>

            {/* Resolution Presets */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { value: 1, label: "1x" },
                { value: 1.5, label: "1.5x" },
                { value: 2, label: "2x" },
                { value: 3, label: "3x" },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setScale(preset.value)}
                  disabled={loading}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    Math.abs(scale - preset.value) < 0.001
                      ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
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
                <path d="M4 4h16v16H4z" />
                <path d="M8 16l3-3 2 2 3-4 2 3" />
                <circle cx="9" cy="9" r="1.5" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                JPEG Output
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                One JPG image per PDF page
              </p>
            </div>
          </div>
        </div>

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
                <path d="M12 3v18M3 12h18" />
                <path d="M7 7l5-4 5 4M7 17l5 4 5-4" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Browser Processing
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                PDF is processed locally
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {loading && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 animate-spin text-blue-600"
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

              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Converting PDF pages...
              </span>
            </div>

            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {progress}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950/60">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Each PDF page is converted and downloaded as a
            separate JPEG file.
          </p>
        </div>
      )}

      {/* Convert Button */}
      <button
        type="button"
        onClick={convert}
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

            Converting... {progress}%
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

            Convert PDF to JPEG
          </>
        )}
      </button>

      {/* Privacy */}
      <p className="text-center text-xs text-slate-400">
        🔒 Your PDF is processed locally in your browser.
        No files are uploaded to a server.
      </p>
    </div>
  );
}
