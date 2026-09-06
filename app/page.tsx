"use client";

import { useState } from "react";

import FileUploader from "@/components/FileUploader";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import DownloadButton from "@/components/DownloadButton";

import PdfToJpeg from "@/components/PdfToJpeg";
import JpegToPdf from "@/components/JpegToPdf";
import PdfMerge from "@/components/PdfMerge";
import PdfCompress from "@/components/PdfCompress";
import PdfResize from "@/components/PdfResize";
import ImageCompress from "@/components/ImageCompress";
import ImageResize from "@/components/ImageResize";

export default function Home() {
  const [activeTool, setActiveTool] = useState("markdown-to-pdf");

  // Markdown states
  const [markdown, setMarkdown] = useState("");
  const [fileName, setFileName] = useState("document.md");

  const handleFileUpload = (content: string, name: string) => {
    setMarkdown(content);
    setFileName(name);
  };

  const tools = [
    {
      id: "markdown-to-pdf",
      name: "Markdown → PDF",
    },
    {
      id: "pdf-to-jpeg",
      name: "PDF → JPEG",
    },
    {
      id: "jpeg-to-pdf",
      name: "JPEG/PNG → PDF",
    },
    {
      id: "pdf-merge",
      name: "Merge PDF",
    },
    {
      id: "pdf-compress",
      name: "Compress PDF",
    },
    {
      id: "pdf-resize",
      name: "Resize PDF",
    },
    {
      id: "image-compress",
      name: "Compress Image",
    },
    {
      id: "image-resize",
      name: "Resize Image",
    },
  ];

  // Markdown → PDF UI
  const renderMarkdownTool = () => {
    return (
      <>
        {/* Upload */}
        <div className="mb-6">
          <FileUploader onUpload={handleFileUpload} />
        </div>

        {/* File Information */}
        {markdown && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current file
              </p>

              <p className="font-medium text-slate-900 dark:text-white">
                {fileName}
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Markdown Loaded
            </span>
          </div>
        )}

        {/* Editor + Preview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MarkdownEditor
            value={markdown}
            onChange={setMarkdown}
          />

          <MarkdownPreview markdown={markdown} />
        </div>

        {/* Download */}
        <div className="mt-8 flex justify-center">
          <DownloadButton
            markdown={markdown}
            fileName={fileName}
          />
        </div>
      </>
    );
  };

  // Tool Renderer
  const renderTool = () => {
    switch (activeTool) {
      case "markdown-to-pdf":
        return renderMarkdownTool();

      case "pdf-to-jpeg":
        return <PdfToJpeg />;

      case "jpeg-to-pdf":
        return <JpegToPdf />;

      case "pdf-merge":
        return <PdfMerge />;

      case "pdf-compress":
        return <PdfCompress />;

      case "pdf-resize":
        return <PdfResize />;

      case "image-compress":
        return <ImageCompress />;

      case "image-resize":
        return <ImageResize />;

      default:
        return renderMarkdownTool();
    }
  };

  const activeToolName =
    tools.find((tool) => tool.id === activeTool)?.name ||
    "Markdown → PDF";

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            PDF & Image Tools
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Convert, edit, compress, resize and manage your files
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 md:px-6">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tools
            </h2>

            <div className="space-y-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    activeTool === tool.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Tool Selector */}
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <select
            value={activeTool}
            onChange={(e) => setActiveTool(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-lg outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {tools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <section className="min-w-0 flex-1">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Tool Header */}
            <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeToolName}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select your files and process them directly in your browser.
              </p>
            </div>

            {/* Tool Content */}
            <div className="p-6">
              {renderTool()}
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}