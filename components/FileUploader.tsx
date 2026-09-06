"use client";

import { ChangeEvent, useRef } from "react";

interface FileUploaderProps {
  onUpload: (content: string, fileName: string) => void;
}

export default function FileUploader({
  onUpload,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".md")) {
      alert("Please select a Markdown (.md) file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;

      if (typeof content === "string") {
        onUpload(content, file.name);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div
      className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
      onClick={() => inputRef.current?.click()}
    >
      <div className="text-4xl">📁</div>

      <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
        Upload Markdown File
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Click here to select a .md file
      </p>

      <button
        type="button"
        className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Choose .md File
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".md,text/markdown"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}