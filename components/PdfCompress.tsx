
"use client";

import { useState } from "react";
import { compressPDF } from "@/lib/pdfCompress";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  const compress = async () => {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }

    try {
      setLoading(true);

      const result = await compressPDF(file);

      const blob = new Blob(
        [result.buffer as ArrayBuffer],
        {
          type: "application/pdf",
        }
      );

      const name = file.name.replace(
        /\.pdf$/i,
        "_compressed.pdf"
      );

      downloadBlob(blob, name);
    } catch (error) {
      console.error(error);
      alert("Failed to compress PDF.");
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
            Compress PDF
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reduce the size of your PDF while keeping it easy to share.
          </p>
        </div> */}

        {/* Upload Area */}
        {!file ? (
          <label
            htmlFor="pdf-compress-upload"
            className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
          >
            {/* Icon */}
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
              Click to upload a PDF
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select one PDF file to compress
            </p>

            <span className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-blue-700">
              Choose PDF
            </span>

            <input
              id="pdf-compress-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          /* Selected File */
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-4">
              {/* PDF Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
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
                    d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 3v6h6M8 15h8M8 18h5"
                  />
                </svg>
              </div>

              {/* File Details */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate font-semibold text-slate-800 dark:text-slate-200"
                  title={file.name}
                >
                  {file.name}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>PDF</span>
                  <span>•</span>
                  <span>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/30"
                aria-label="Remove PDF"
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

            {/* File Size */}
            <div className="mt-4 flex items-center justify-between border-t border-blue-200 pt-4 text-sm dark:border-blue-900/50">
              <span className="text-slate-500 dark:text-slate-400">
                Original size
              </span>

              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Compression Information */}
      {file && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
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
                    d="M4 7h16M4 12h10M4 17h7"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  File type
                </p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  PDF Document
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
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
                    d="M12 3v18M3 12h18"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Processing
                </p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Browser based
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compress Button */}
      <button
        type="button"
        onClick={compress}
        disabled={loading || !file}
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

            Compressing PDF...
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
                d="M4 12h16M12 4v16"
              />
            </svg>

            Compress PDF
          </>
        )}
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400">
        Your PDF is processed locally in your browser.
      </p>
    </div>
  );
}

