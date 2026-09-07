
"use client";

import { useState } from "react";
import { downloadBlob } from "@/lib/imageTools";
import { imagesToPdf } from "@/lib/jpegToPdf";

export default function JpegToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] =
    useState<"A4" | "A3" | "A5" | "LETTER" | "LEGAL">("A4");
  const [loading, setLoading] = useState(false);

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const convert = async () => {
    if (!files.length) {
      alert("Please select at least one image.");
      return;
    }

    try {
      setLoading(true);

      const pdf = await imagesToPdf(files, {
        pageSize,
        margin: 20,
        fitToPage: true,
      });

      const blob = new Blob([pdf.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      downloadBlob(blob, "images.pdf");
    } catch (error) {
      console.error(error);
      alert("Failed to create PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Upload Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            JPEG / Image to PDF
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Convert JPG, PNG, and WebP images into a single PDF file.
          </p>
        </div> */}

        <label
          htmlFor="image-upload"
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
                d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>

          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Click to upload images
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            JPG, PNG or WebP • Multiple images supported
          </p>

          <span className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-blue-700">
            Choose Images
          </span>

          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              handleFiles(Array.from(e.target.files || []));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Selected Images */}
      {files.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Selected Images
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {files.length} image{files.length !== 1 ? "s" : ""} selected
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-32 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>

                <div className="p-2">
                  <p
                    className="truncate text-xs font-medium text-slate-700 dark:text-slate-200"
                    title={file.name}
                  >
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
          PDF Settings
        </h3>

        <div>
          <label
            htmlFor="page-size"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Page Size
          </label>

          <select
            id="page-size"
            value={pageSize}
            onChange={(e) =>
              setPageSize(
                e.target.value as
                  | "A4"
                  | "A3"
                  | "A5"
                  | "LETTER"
                  | "LEGAL"
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="A4">A4 — Standard</option>
            <option value="A3">A3 — Large</option>
            <option value="A5">A5 — Small</option>
            <option value="LETTER">Letter — US</option>
            <option value="LEGAL">Legal — US</option>
          </select>
        </div>
      </div>

      {/* Convert Button */}
      <button
        type="button"
        onClick={convert}
        disabled={loading || files.length === 0}
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

            Creating PDF...
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
                d="M12 16V4m0 12l-4-4m4 4l4-4M5 20h14"
              />
            </svg>

            Convert {files.length > 0 ? `${files.length} Images` : "Images"}{" "}
            to PDF
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Your images are processed locally in your browser.
      </p>
    </div>
  );
}

