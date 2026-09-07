
"use client";

import { useState } from "react";
import { mergePDFs } from "@/lib/pdfMerge";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    setFiles((prev) => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const merge = async () => {
    if (files.length < 2) {
      alert("Please select at least two PDF files.");
      return;
    }

    try {
      setLoading(true);

      const result = await mergePDFs(files);

      const blob = new Blob(
        [result.buffer as ArrayBuffer],
        {
          type: "application/pdf",
        }
      );

      downloadBlob(blob, "merged.pdf");
    } catch (error) {
      console.error(error);
      alert("Failed to merge PDFs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Merge PDF Files
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Combine multiple PDF files into one PDF document.
          </p>
        </div> */}

        {/* Upload Area */}
        <label
          htmlFor="pdf-upload"
          className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition group-hover:scale-105 dark:bg-blue-900/40 dark:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 18a4.6 4.6 0 01-.9-9.1A5.5 5.5 0 0116.8 7.5 4 4 0 0118 15.4M12 12v8m0-8l-3 3m3-3l3 3"
              />
            </svg>
          </div>

          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Click to upload PDF files
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select two or more PDF files
          </p>

          <span className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-blue-700">
            Choose PDF Files
          </span>

          <input
            id="pdf-upload"
            type="file"
            multiple
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              handleFiles(Array.from(e.target.files || []));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Selected PDFs
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {files.length} PDF{" "}
                {files.length === 1 ? "file" : "files"} selected
              </p>
            </div>

            <button
              type="button"
              onClick={clearFiles}
              className="text-sm font-medium text-red-500 transition hover:text-red-600"
            >
              Clear all
            </button>
          </div>

          {/* File List */}
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
              >
                {/* Number */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  {index + 1}
                </div>

                {/* PDF Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 3v6h6M8 15h8M8 18h5"
                    />
                  </svg>
                </div>

                {/* File Information */}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-slate-800 dark:text-slate-200"
                    title={file.name}
                  >
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Merge Info */}
          {files.length === 1 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
              Please select at least one more PDF file to merge.
            </div>
          )}

          {files.length >= 2 && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400">
              {files.length} PDF files are ready to be merged.
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.7}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 13h6m-6 4h6M9 9h1m4 0h1M6 3h9l3 3v15H6V3z"
              />
            </svg>
          </div>

          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            No PDF files selected
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Upload at least two PDF files to get started.
          </p>
        </div>
      )}

      {/* Merge Button */}
      <button
        type="button"
        onClick={merge}
        disabled={loading || files.length < 2}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>

            Merging PDFs...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m-6-8h2m5-5h-4l-2 2H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V7l-3-3z"
              />
            </svg>

            Merge{" "}
            {files.length >= 2 ? `${files.length} PDFs` : "PDFs"}
          </>
        )}
      </button>

      {/* Footer Note */}
      <p className="text-center text-xs text-slate-400">
        Your PDF files are processed locally in your browser.
      </p>
    </div>
  );
}

