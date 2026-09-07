
"use client";

import { useState } from "react";
import {
  editPDF,
  PdfEditItem,
} from "@/lib/pdfEdit";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfEdit() {
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState("1");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState("18");
  const [items, setItems] = useState<PdfEditItem[]>([]);
  const [loading, setLoading] = useState(false);

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
    setItems([]);
  };

  const removeFile = () => {
    if (loading) return;

    setFile(null);
    setItems([]);
  };

  const addText = () => {
    if (!text.trim()) {
      alert("Enter some text.");
      return;
    }

    setItems((current) => [
      ...current,
      {
        type: "text",
        page: Number(page) || 1,
        text,
        x: 50,
        y: 80 + current.length * 30,
        size: Number(fontSize) || 18,
      },
    ]);

    setText("");
  };

  const addRectangle = () => {
    setItems((current) => [
      ...current,
      {
        type: "rectangle",
        page: Number(page) || 1,
        x: 50,
        y: 120 + current.length * 30,
        width: 200,
        height: 80,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const save = async () => {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }

    if (!items.length) {
      alert("Add at least one edit.");
      return;
    }

    try {
      setLoading(true);

      const blob = await editPDF(file, items);

      const name = file.name.replace(
        /\.pdf$/i,
        "_edited.pdf"
      );

      downloadBlob(blob, name);

      alert("PDF edited successfully!");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to edit PDF."
      );
    } finally {
      setLoading(false);
    }
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h4M8 17h6" />
              <path d="m16 13 1 1 3-3" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Edit PDF
            </h2>

            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Add text, rectangles, and annotations to your PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!file ? (
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-11 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) =>
                handleFile(e.target.files?.[0])
              }
            />

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 transition group-hover:scale-105 dark:bg-red-950/40 dark:text-red-400">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
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

      {/* Editing Tools */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Add Elements
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure an element and add it to your PDF.
          </p>
        </div>

        {/* Controls */}
        <div className="mt-5 grid gap-4 sm:grid-cols-6">
          {/* Page */}
          <div className="sm:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Page
            </label>

            <input
              type="number"
              min="1"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800"
            />
          </div>

          {/* Text */}
          <div className="sm:col-span-3">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Text
            </label>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addText();
              }}
              placeholder="Enter text to add"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800"
            />
          </div>

          {/* Font Size */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Font Size
            </label>

            <div className="relative">
              <input
                type="number"
                min="6"
                value={fontSize}
                onChange={(e) =>
                  setFontSize(e.target.value)
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-14 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                pt
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={addText}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 7V4h16v3" />
              <path d="M12 4v16" />
              <path d="M8 20h8" />
            </svg>

            Add Text
          </button>

          <button
            type="button"
            onClick={addRectangle}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="4" y="5" width="16" height="14" rx="1" />
              <path d="M8 9h8M8 13h5" />
            </svg>

            Add Rectangle
          </button>
        </div>
      </div>

      {/* Edit List */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Added Elements
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {items.length}{" "}
                {items.length === 1
                  ? "element"
                  : "elements"}{" "}
                ready to apply.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setItems([])}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>

              Clear All
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
              >
                {/* Element Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    item.type === "text"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                      : "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
                  }`}
                >
                  {item.type === "text" ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M4 7V4h16v3" />
                      <path d="M12 4v16" />
                      <path d="M8 20h8" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="4"
                        y="5"
                        width="16"
                        height="14"
                        rx="1"
                      />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.type === "text"
                        ? "Text"
                        : "Rectangle"}
                    </span>

                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      Page {item.page}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.type === "text"
                      ? `"${item.text}" • ${item.size} pt`
                      : `${item.width} × ${item.height} px`}
                  </p>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={loading}
                  aria-label={`Remove ${
                    item.type === "text"
                      ? "text"
                      : "rectangle"
                  }`}
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
            ))}
          </div>
        </div>
      )}

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
                <path d="M12 3v18M3 12h18" />
                <path d="M7 7l5-4 5 4M7 17l5 4 5-4" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {items.length}{" "}
                {items.length === 1
                  ? "Edit Added"
                  : "Edits Added"}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready to apply to your PDF
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
                Your PDF stays in the browser
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={save}
        disabled={!file || !items.length || loading}
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

            Saving PDF...
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

            Save Edited PDF
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

        Your PDF is processed locally in your browser.
        No files are uploaded to a server.
      </div>
    </div>
  );
}

