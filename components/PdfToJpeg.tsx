
"use client";

import { useState } from "react";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfToJpeg() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(1.5);
  const [progress, setProgress] = useState(0);

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          PDF → JPEG
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Convert every page of a PDF document into a JPEG image.
        </p>
      </div>

      {/* File Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Select PDF
        </label>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setProgress(0);
          }}
          className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        />
      </div>

      {/* Selected File */}
      {file && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selected file
          </p>

          <p className="mt-1 font-medium text-slate-900 dark:text-white">
            {file.name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {/* JPEG Quality */}
      <div>
        <div className="mb-2 flex justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            JPEG Quality
          </label>

          <span className="text-sm font-semibold text-blue-600">
            {Math.round(quality * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0.3"
          max="1"
          step="0.05"
          value={quality}
          onChange={(event) => {
            setQuality(Number(event.target.value));
          }}
          className="w-full"
        />

        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>Lower size</span>
          <span>Higher quality</span>
        </div>
      </div>

      {/* Resolution */}
      <div>
        <div className="mb-2 flex justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Resolution
          </label>

          <span className="text-sm font-semibold text-blue-600">
            {scale}x
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.25"
          value={scale}
          onChange={(event) => {
            setScale(Number(event.target.value));
          }}
          className="w-full"
        />

        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>1x</span>
          <span>3x</span>
        </div>
      </div>

      {/* Progress */}
      {loading && (
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Converting...
            </span>

            <span className="font-medium text-blue-600">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Convert Button */}
      <button
        type="button"
        onClick={convert}
        disabled={!file || loading}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? `Converting... ${progress}%`
          : "Convert PDF to JPEG"}
      </button>
    </div>
  );
}
