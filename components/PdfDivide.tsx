
"use client";

import { useState } from "react";
import { splitPDF, SplitMode } from "@/lib/pdfDivide";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfDivide() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SplitMode>("pages");
  const [ranges, setRanges] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleFile = (selected?: File) => {
    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please select a valid PDF file.");
      return;
    }

    setFile(selected);
    setProgress(0);
  };

  const removeFile = () => {
    if (loading) return;

    setFile(null);
    setProgress(0);
    setRanges("");
  };

  const divide = async () => {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }

    if (mode !== "pages" && !ranges.trim()) {
      alert("Enter the page numbers or ranges.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      const blobs = await splitPDF(
        file,
        mode,
        ranges
      );

      const baseName = file.name.replace(
        /\.pdf$/i,
        ""
      );

      for (let i = 0; i < blobs.length; i++) {
        const suffix =
          mode === "pages"
            ? `_page_${i + 1}.pdf`
            : `_split.pdf`;

        downloadBlob(
          blobs[i],
          `${baseName}${suffix}`
        );

        setProgress(
          Math.round(
            ((i + 1) / blobs.length) * 100
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 100)
        );
      }

      alert("PDF divided successfully!");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to divide PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const splitOptions = [
    {
      value: "pages" as SplitMode,
      title: "Every Page",
      description: "Create a separate PDF for every page.",
      icon: (
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 3h12v18H6z" />
          <path d="M9 7h6M9 11h6M9 15h4" />
        </svg>
      ),
    },
    {
      value: "ranges" as SplitMode,
      title: "Page Range",
      description: "Extract a continuous range of pages.",
      icon: (
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      ),
    },
    {
      value: "selected" as SplitMode,
      title: "Selected Pages",
      description: "Extract specific pages from the PDF.",
      icon: (
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M5 4h14v16H5z" />
          <path d="m8 12 2 2 5-5" />
        </svg>
      ),
    },
  ];

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
              <path d="M6 3h12v7H6z" />
              <path d="M6 14h12v7H6z" />
              <path d="M9 10v4M15 10v4" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Divide PDF
            </h2>

            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Split your PDF into separate files or extract
              specific pages.
            </p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!file ? (
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-11 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                handleFile(event.target.files?.[0])
              }
              className="hidden"
            />

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 transition group-hover:scale-105 dark:bg-red-950/40 dark:text-red-400">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <path d="M14 2v6h6" />
                <path d="M8 13h8M8 17h5" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Drop your PDF here
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or choose a PDF file from your device
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

              Choose PDF
            </span>

            <p className="mt-4 text-xs text-slate-400">
              PDF files only
            </p>
          </label>
        ) : (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8M8 17h5" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {file.name}
                  </p>

                  <span className="hidden shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 sm:inline-flex dark:bg-emerald-950/50 dark:text-emerald-400">
                    Ready
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PDF Document
                  <span className="mx-1.5">•</span>
                  {formatSize(file.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                aria-label="Remove PDF"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
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
        )}
      </div>

      {/* Split Options */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Split Method
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose how you want to divide your PDF.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {splitOptions.map((option) => {
            const selected = mode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                disabled={loading}
                className={`group relative rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-950/30"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-slate-800"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {selected && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </div>
                )}

                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {option.icon}
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {option.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Range Input */}
        {mode !== "pages" && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 6h16M4 12h16M4 18h10" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Page Numbers
                </label>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter individual pages or ranges separated
                  by commas.
                </p>
              </div>
            </div>

            <div className="relative mt-4">
              <input
                type="text"
                value={ranges}
                onChange={(e) =>
                  setRanges(e.target.value)
                }
                disabled={loading}
                placeholder="1-3, 5, 8-10"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-white px-2.5 py-1.5 text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                Single: 5
              </span>

              <span className="rounded-md bg-white px-2.5 py-1.5 text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                Range: 1-3
              </span>

              <span className="rounded-md bg-white px-2.5 py-1.5 text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                Multiple: 1-3, 5, 8-10
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
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
                <path d="M6 3h12v18H6z" />
                <path d="M9 7h6M9 11h6M9 15h4" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Split Method
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === "pages"
                  ? "Every page"
                  : mode === "ranges"
                    ? "Page range"
                    : "Selected pages"}
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
                Local Processing
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your PDF stays in the browser
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
                Dividing PDF...
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
            Preparing your PDF files for download.
          </p>
        </div>
      )}

      {/* Action */}
      <button
        type="button"
        onClick={divide}
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

            Dividing PDF...
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
              <path d="M6 3h12v7H6z" />
              <path d="M6 14h12v7H6z" />
              <path d="M9 10v4M15 10v4" />
            </svg>

            Divide PDF
          </>
        )}
      </button>

      {/* Privacy */}
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

        Your PDF is processed locally in your browser.
        No files are uploaded to a server.
      </div>
    </div>
  );
}
