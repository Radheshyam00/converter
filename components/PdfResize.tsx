"use client";

import { useState } from "react";
import {
  resizePDF,
  PdfPageSize,
} from "@/lib/pdfResize";
import { downloadBlob } from "@/lib/imageTools";

export default function PdfResize() {
  const [file, setFile] = useState<File | null>(null);

  const [size, setSize] =
    useState<PdfPageSize>("A4");

  const [loading, setLoading] = useState(false);

  const resize = async () => {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }

    try {
      setLoading(true);

      const result = await resizePDF(file, size);

      const blob = new Blob(
        [result.buffer as ArrayBuffer],
        {
          type: "application/pdf",
        }
      );

      const name = file.name.replace(
        /\.pdf$/i,
        `_${size}.pdf`
      );

      downloadBlob(blob, name);
    } catch (error) {
      console.error(error);
      alert("Failed to resize PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        Resize PDF
      </h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
        className="block w-full rounded-lg border p-3"
      />

      <select
        value={size}
        onChange={(e) =>
          setSize(e.target.value as PdfPageSize)
        }
        className="rounded-lg border p-3"
      >
        <option value="A4">A4</option>
        <option value="A3">A3</option>
        <option value="A5">A5</option>
        <option value="LETTER">Letter</option>
        <option value="LEGAL">Legal</option>
      </select>

      <button
        onClick={resize}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Resizing..."
          : "Resize PDF"}
      </button>
    </div>
  );
}