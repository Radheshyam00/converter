
"use client";

import { useState } from "react";
import {
  resizeImage,
  downloadBlob,
} from "@/lib/imageTools";

export default function ImageResize() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setWidth("");
    setHeight("");
  };

  const resize = async () => {
    if (!file) {
      alert("Please select an image.");
      return;
    }

    const targetWidth = Number(width);
    const targetHeight = height
      ? Number(height)
      : undefined;

    if (!targetWidth || targetWidth <= 0) {
      alert("Enter a valid width.");
      return;
    }

    if (
      !maintainRatio &&
      (!targetHeight || targetHeight <= 0)
    ) {
      alert("Enter a valid height.");
      return;
    }

    try {
      setLoading(true);

      const blob = await resizeImage(
        file,
        targetWidth,
        targetHeight,
        maintainRatio
      );

      const name = file.name.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        "_resized.jpg"
      );

      downloadBlob(blob, name);
    } catch (error) {
      console.error(error);
      alert("Failed to resize image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      {/* <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Resize Image
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Resize your image to custom dimensions while
          preserving quality and aspect ratio.
        </p>
      </div> */}

      {/* Upload Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!file ? (
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFile(e.target.files?.[0])
              }
              className="hidden"
            />

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <svg
                className="h-7 w-7"
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
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Upload an image
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              JPG, JPEG, PNG, or WebP
            </p>

            <span className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-blue-700">
              Choose Image
            </span>
          </label>
        ) : (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex items-center gap-4">
              {/* Image Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
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
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {file.type.split("/")[1]?.toUpperCase() ||
                    "IMAGE"}{" "}
                  • {formatSize(file.size)}
                </p>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={removeFile}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                aria-label="Remove image"
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

      {/* Resize Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Resize Settings
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter the target dimensions for your image.
          </p>
        </div>

        {/* Dimensions */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Width */}
          <div>
            <label
              htmlFor="image-width"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Width
              <span className="ml-1 text-slate-400">
                (px)
              </span>
            </label>

            <div className="relative">
              <input
                id="image-width"
                type="number"
                min="1"
                value={width}
                onChange={(e) =>
                  setWidth(e.target.value)
                }
                placeholder="1920"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                px
              </span>
            </div>
          </div>

          {/* Height */}
          <div>
            <label
              htmlFor="image-height"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Height
              <span className="ml-1 text-slate-400">
                (px)
              </span>
            </label>

            <div className="relative">
              <input
                id="image-height"
                type="number"
                min="1"
                value={height}
                onChange={(e) =>
                  setHeight(e.target.value)
                }
                placeholder="1080"
                disabled={maintainRatio}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                px
              </span>
            </div>
          </div>
        </div>

        {/* Maintain Ratio */}
        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-800">
          <input
            type="checkbox"
            checked={maintainRatio}
            onChange={(e) =>
              setMaintainRatio(e.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
          />

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Maintain aspect ratio
            </p>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Automatically preserve the original image
              proportions.
            </p>
          </div>
        </label>
      </div>

      {/* Info */}
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
                <path d="M4 4h6v6H4zM14 14h6v6h-6z" />
                <path d="M14 4h6M14 10V4M4 14v6M10 14H4" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Custom Dimensions
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set width and height in pixels
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
                <path d="m7 7 5-4 5 4M7 17l5 4 5-4" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Aspect Ratio
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preserve image proportions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={resize}
        disabled={loading || !file}
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
            Resizing...
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
              <path d="M4 4h6M4 4v6M20 20h-6M20 20v-6" />
              <path d="M4 10V4h6M20 14v6h-6" />
              <path d="M9 15l-3 3 3 3M15 9l3-3-3-3" />
            </svg>
            Resize Image
          </>
        )}
      </button>

      {/* Privacy */}
      <p className="text-center text-xs text-slate-400">
        🔒 Your image is processed locally in your browser.
        No files are uploaded to a server.
      </p>
    </div>
  );
}
