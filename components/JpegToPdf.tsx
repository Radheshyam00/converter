"use client";

import { useState } from "react";
import {
  downloadBlob,
} from "@/lib/imageTools";
import {
  imagesToPdf,
} from "@/lib/jpegToPdf";

export default function JpegToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] =
    useState<"A4" | "A3" | "A5" | "LETTER" | "LEGAL">("A4");

  const [loading, setLoading] = useState(false);

  const convert = async () => {
    if (!files.length) {
      alert("Please select images.");
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
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        JPEG / Image → PDF
      </h2>

      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) =>
          setFiles(Array.from(e.target.files || []))
        }
        className="block w-full rounded-lg border p-3"
      />

      <select
        value={pageSize}
        onChange={(e) =>
          setPageSize(
            e.target.value as typeof pageSize
          )
        }
        className="rounded-lg border p-3"
      >
        <option value="A4">A4</option>
        <option value="A3">A3</option>
        <option value="A5">A5</option>
        <option value="LETTER">Letter</option>
        <option value="LEGAL">Legal</option>
      </select>

      <p className="text-sm text-slate-500">
        {files.length} image(s) selected
      </p>

      <button
        onClick={convert}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Creating PDF..."
          : "Convert to PDF"}
      </button>
    </div>
  );
}