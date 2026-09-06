"use client";

import { useState } from "react";
import { compressPDF } from "@/lib/pdfCompress";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        Compress PDF
      </h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
        className="block w-full rounded-lg border p-3"
      />

      {file && (
        <p className="text-sm text-slate-500">
          Original size:{" "}
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      )}

      <button
        onClick={compress}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Compressing..."
          : "Compress PDF"}
      </button>
    </div>
  );
}