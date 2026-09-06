
"use client";

import { useState } from "react";

interface DownloadButtonProps {
  markdown: string;
  fileName: string;
}

export default function DownloadButton({
  markdown,
  fileName,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    if (!markdown.trim()) {
      alert("Please upload or enter Markdown content first.");
      return;
    }

    const element = document.getElementById("pdf-content");

    if (!element) {
      alert("Preview content not found.");
      return;
    }

    try {
      setLoading(true);

      // Load html2pdf only in the browser
      const module = await import("html2pdf.js");

      const html2pdf = module.default;

      const outputName = fileName
        .replace(/\.md$/i, "")
        .replace(/\s+/g, "_");

      // Use a plain JavaScript object
      const options: any = {
        margin: 15,

        filename: `${outputName}.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },

        pagebreak: {
          mode: ["css", "legacy"],
        },
      };

      await html2pdf()
        .set(options)
        .from(element)
        .save();

    } catch (error) {
      console.error("PDF generation error:", error);

      alert(
        "Failed to generate PDF. Please check the browser console."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      disabled={loading || !markdown.trim()}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Generating PDF...
        </>
      ) : (
        <>
          📥 Convert & Download PDF
        </>
      )}
    </button>
  );
}