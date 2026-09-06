"use client";

import { useState } from "react";
import { mergePDFs } from "@/lib/pdfMerge";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const merge = async () => {
    if (files.length < 2) {
      alert("Select at least two PDF files.");
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
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        Merge PDF
      </h2>

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={(e) =>
          setFiles(Array.from(e.target.files || []))
        }
        className="block w-full rounded-lg border p-3"
      />

      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="rounded-lg bg-slate-100 p-3"
          >
            {index + 1}. {file.name}
          </div>
        ))}
      </div>

      <button
        onClick={merge}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Merging..."
          : "Merge PDFs"}
      </button>
    </div>
  );
}