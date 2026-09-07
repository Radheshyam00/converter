
"use client";

import { useEffect, useState } from "react";
import {
  compressImage,
  downloadBlob,
} from "@/lib/imageTools";

export default function ImageCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(70);
  const [loading, setLoading] = useState(false);

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
    setPreview(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getQualityLabel = () => {
    if (quality <= 30) return "Smallest";
    if (quality <= 50) return "Low";
    if (quality <= 70) return "Balanced";
    if (quality <= 85) return "High";
    return "Maximum";
  };

  const compress = async () => {
    if (!file) {
      alert("Please select an image.");
      return;
    }

    try {
      setLoading(true);

      const blob = await compressImage(
        file,
        quality / 100
      );

      const name = file.name.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        "_compressed.jpg"
      );

      downloadBlob(blob, name);
    } catch (error) {
      console.error(error);
      alert("Failed to compress image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header + Upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Compress Image
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reduce image file size while maintaining good visual quality.
          </p>
        </div> */}

        {!file ? (
          <label
            htmlFor="image-compress-upload"
            className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
          >
            {/* Upload Icon */}
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
                  d="M4 16l4-4 3 3 4-5 5 6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 19h16M4 5h16v14H4z"
                />
              </svg>
            </div>

            <p className="font-semibold text-slate-700 dark:text-slate-200">
              Click to upload an image
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              JPG, PNG, WebP and other common image formats
            </p>

            <span className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-blue-700">
              Choose Image
            </span>

            <input
              id="image-compress-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          /* Selected Image */
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Preview */}
              <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-28 sm:w-36 dark:border-slate-700 dark:bg-slate-800">
                {preview && (
                  <img
                    src={preview}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* File Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="truncate font-semibold text-slate-800 dark:text-slate-200"
                      title={file.name}
                    >
                      {file.name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {file.type.split("/")[1]?.toUpperCase() || "IMAGE"}
                      </span>

                      <span>•</span>

                      <span>{formatSize(file.size)}</span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={loading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/30"
                    aria-label="Remove image"
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

                {/* Original Size */}
                <div className="mt-5 flex items-center justify-between border-t border-blue-200 pt-3 dark:border-blue-900/50">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Original size
                  </span>

                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {formatSize(file.size)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quality Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Compression Quality
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Lower quality creates a smaller file.
            </p>
          </div>

          <div className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            {quality}%
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="10"
          max="100"
          value={quality}
          onChange={(e) =>
            setQuality(Number(e.target.value))
          }
          disabled={loading}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 disabled:cursor-not-allowed dark:bg-slate-700"
        />

        {/* Slider Labels */}
        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>Smaller file</span>

          <span className="font-medium text-slate-600 dark:text-slate-300">
            {getQualityLabel()}
          </span>

          <span>Better quality</span>
        </div>

        {/* Presets */}
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { value: 30, label: "Small" },
            { value: 50, label: "Low" },
            { value: 70, label: "Balanced" },
            { value: 85, label: "High" },
            { value: 95, label: "Best" },
          ].map((preset) => {
            const selected = quality === preset.value;

            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setQuality(preset.value)}
                disabled={loading}
                className={`rounded-xl border px-3 py-3 text-center transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-blue-700"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {preset.label}
                </span>

                <span className="mt-1 block text-xs opacity-70">
                  {preset.value}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compression Info */}
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
                  Quality
                </p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {quality}% — {getQualityLabel()}
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
                    d="M4 12h16M12 4v16"
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

            Compressing Image...
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

            Compress Image
          </>
        )}
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400">
        Your image is processed locally in your browser.
      </p>
    </div>
  );
}

