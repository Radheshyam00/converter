"use client";

import { useEffect, useState } from "react";

import type {
  ChangeEvent,
  DragEvent,
} from "react";

import {
  editPDF,
  type PdfColor,
  type PdfEditItem,
} from "@/lib/pdfEdit";

import { downloadBlob } from "@/lib/imageTools";

type ToolMode =
  | "text"
  | "rectangle"
  | "highlight"
  | "whiteout"
  | "line"
  | "image";

type RGBColor = {
  r: number;
  g: number;
  b: number;
};

/*
 * A4 CSS size at 96 DPI
 * 210mm × 297mm
 * ≈ 794px × 1123px
 */
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const TOOL_CONFIG: Array<{
  id: ToolMode;
  name: string;
  icon: string;
  description: string;
}> = [
  {
    id: "text",
    name: "Text",
    icon: "T",
    description: "Add text",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    icon: "□",
    description: "Draw border",
  },
  {
    id: "highlight",
    name: "Highlight",
    icon: "▰",
    description: "Mark an area",
  },
  {
    id: "whiteout",
    name: "Whiteout",
    icon: "▱",
    description: "Hide content",
  },
  {
    id: "line",
    name: "Line",
    icon: "╱",
    description: "Draw a line",
  },
  {
    id: "image",
    name: "Image",
    icon: "▣",
    description: "Insert image",
  },
];

const DEFAULT_TEXT_COLOR: RGBColor = {
  r: 0,
  g: 0,
  b: 0,
};

const DEFAULT_RECT_COLOR: RGBColor = {
  r: 0.12,
  g: 0.38,
  b: 0.95,
};

const DEFAULT_HIGHLIGHT_COLOR: RGBColor = {
  r: 1,
  g: 0.9,
  b: 0,
};

const DEFAULT_LINE_COLOR: RGBColor = {
  r: 0.08,
  g: 0.08,
  b: 0.08,
};

export default function PdfEdit() {
  const [file, setFile] =
    useState<File | null>(null);

  const [page, setPage] =
    useState(1);

  const [pageCount, setPageCount] =
    useState(1);

  const [tool, setTool] =
    useState<ToolMode>("text");

  const [items, setItems] =
    useState<PdfEditItem[]>([]);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  /* =========================
     TEXT
  ========================= */

  const [text, setText] =
    useState("Sample Text");

  const [fontSize, setFontSize] =
    useState(18);

  const [textColor, setTextColor] =
    useState<RGBColor>(
      DEFAULT_TEXT_COLOR
    );

  /* =========================
     POSITION
  ========================= */

  const [x, setX] =
    useState(50);

  const [y, setY] =
    useState(50);

  /* =========================
     SIZE
  ========================= */

  const [width, setWidth] =
    useState(200);

  const [height, setHeight] =
    useState(80);

  /* =========================
     RECTANGLE
  ========================= */

  const [rectangleColor, setRectangleColor] =
    useState<RGBColor>(
      DEFAULT_RECT_COLOR
    );

  const [borderWidth, setBorderWidth] =
    useState(2);

  /* =========================
     HIGHLIGHT
  ========================= */

  const [highlightColor, setHighlightColor] =
    useState<RGBColor>(
      DEFAULT_HIGHLIGHT_COLOR
    );

  const [highlightOpacity, setHighlightOpacity] =
    useState(0.35);

  /* =========================
     LINE
  ========================= */

  const [endX, setEndX] =
    useState(250);

  const [endY, setEndY] =
    useState(130);

  const [lineColor, setLineColor] =
    useState<RGBColor>(
      DEFAULT_LINE_COLOR
    );

  const [lineThickness, setLineThickness] =
    useState(2);

  /* =========================
     IMAGE
  ========================= */

  const [imageData, setImageData] =
    useState<string | null>(null);

  const [imageName, setImageName] =
    useState("");

  const [imageWidth, setImageWidth] =
    useState(200);

  const [imageHeight, setImageHeight] =
    useState(120);

  /* =========================
     UI
  ========================= */

  const [loading, setLoading] =
    useState(false);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [dragging, setDragging] =
    useState(false);

  const [zoom, setZoom] =
    useState(100);

  const [currentPreviewPage, setCurrentPreviewPage] =
    useState(1);

  /*
   * ============================
   * PAGE COUNT
   * ============================
   */

  useEffect(() => {
    if (!file) {
      setPageCount(1);
      return;
    }

    const currentFile = file;

    let cancelled = false;

    async function loadPageCount() {
      try {
        const { PDFDocument } =
          await import("pdf-lib");

        const bytes =
          await currentFile.arrayBuffer();

        const pdf =
          await PDFDocument.load(bytes);

        if (cancelled) return;

        const count =
          pdf.getPageCount();

        setPageCount(count);

        setPage((current) =>
          Math.min(
            Math.max(current, 1),
            count
          )
        );

        setCurrentPreviewPage(
          (current) =>
            Math.min(
              Math.max(current, 1),
              count
            )
        );
      } catch (error) {
        console.error(
          "Unable to read PDF:",
          error
        );

        if (!cancelled) {
          setPageCount(1);
        }
      }
    }

    loadPageCount();

    return () => {
      cancelled = true;
    };
  }, [file]);

  /*
   * ============================
   * FILE
   * ============================
   */

  function handleFile(
    selectedFile: File
  ) {
    const valid =
      selectedFile.type ===
        "application/pdf" ||
      selectedFile.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!valid) {
      alert(
        "Please select a valid PDF file."
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setItems([]);
    setSelectedIndex(null);

    setPage(1);
    setCurrentPreviewPage(1);

    setPreviewUrl(null);
  }

  function handleFileInput(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    if (!selected) return;

    handleFile(selected);

    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();

    setDragging(false);

    const dropped =
      event.dataTransfer.files?.[0];

    if (!dropped) return;

    handleFile(dropped);
  }

  /*
   * ============================
   * IMAGE
   * ============================
   */

  function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    if (!selected) return;

    const valid =
      selected.type === "image/png" ||
      selected.type === "image/jpeg" ||
      selected.type === "image/jpg";

    if (!valid) {
      alert(
        "Please upload a PNG or JPG image."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !==
        "string"
      ) {
        return;
      }

      setImageData(
        reader.result
      );

      setImageName(
        selected.name
      );

      const img =
        new Image();

      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 300;

        const ratio =
          img.width /
          img.height;

        let newWidth =
          Math.min(
            img.width,
            maxWidth
          );

        let newHeight =
          newWidth / ratio;

        if (
          newHeight >
          maxHeight
        ) {
          newHeight =
            maxHeight;

          newWidth =
            newHeight *
            ratio;
        }

        setImageWidth(
          Math.round(newWidth)
        );

        setImageHeight(
          Math.round(newHeight)
        );
      };

      img.src =
        reader.result;
    };

    reader.readAsDataURL(
      selected
    );

    event.target.value = "";
  }

  /*
   * ============================
   * ADD TEXT
   * ============================
   */

  function addText() {
    if (!file) return;

    const value =
      text.trim();

    if (!value) {
      alert(
        "Please enter some text."
      );
      return;
    }

    const newItem: PdfEditItem = {
      type: "text",
      page,
      text: value,
      x: safeNumber(x, 50),
      y: safeNumber(y, 50),
      size: safeNumber(
        fontSize,
        18
      ),
      color: textColor,
    };

    addNewItem(newItem);
  }

  /*
   * ============================
   * ADD RECTANGLE
   * ============================
   */

  function addRectangle() {
    if (!file) return;

    const newItem: PdfEditItem = {
      type: "rectangle",
      page,
      x: safeNumber(x, 50),
      y: safeNumber(y, 50),
      width: safePositive(
        width,
        200
      ),
      height: safePositive(
        height,
        80
      ),
      color: rectangleColor,
      borderWidth: safePositive(
        borderWidth,
        2
      ),
    };

    addNewItem(newItem);
  }

  /*
   * ============================
   * ADD HIGHLIGHT
   * ============================
   */

  function addHighlight() {
    if (!file) return;

    const newItem: PdfEditItem = {
      type: "highlight",
      page,
      x: safeNumber(x, 50),
      y: safeNumber(y, 50),
      width: safePositive(
        width,
        200
      ),
      height: safePositive(
        height,
        80
      ),
      color: highlightColor,
      opacity: highlightOpacity,
    };

    addNewItem(newItem);
  }

  /*
   * ============================
   * ADD WHITEOUT
   * ============================
   */

  function addWhiteout() {
    if (!file) return;

    const newItem: PdfEditItem = {
      type: "whiteout",
      page,
      x: safeNumber(x, 50),
      y: safeNumber(y, 50),
      width: safePositive(
        width,
        200
      ),
      height: safePositive(
        height,
        80
      ),
    };

    addNewItem(newItem);
  }

  /*
   * ============================
   * ADD LINE
   * ============================
   */

  function addLine() {
    if (!file) return;

    const newItem: PdfEditItem = {
      type: "line",
      page,
      x: safeNumber(x, 50),
      y: safeNumber(y, 50),
      endX: safeNumber(
        endX,
        250
      ),
      endY: safeNumber(
        endY,
        130
      ),
      color: lineColor,
      thickness: safePositive(
        lineThickness,
        2
      ),
    };

    addNewItem(newItem);
  }

  /*
   * ============================
   * ADD IMAGE
   * ============================
   */

  function addImage() {
    if (!file) return;

    if (!imageData) {
      alert(
        "Please upload an image first."
      );

      return;
    }

    const newItem: PdfEditItem = {
      type: "image",
      page,
      x: safeNumber(x, 50),
      y: safeNumber(y, 50),
      width: safePositive(
        imageWidth,
        200
      ),
      height: safePositive(
        imageHeight,
        120
      ),
      dataUrl: imageData,
    };

    addNewItem(newItem);
  }

  /*
   * ============================
   * ADD ITEM
   * ============================
   */

  function addItem() {
    switch (tool) {
      case "text":
        addText();
        break;

      case "rectangle":
        addRectangle();
        break;

      case "highlight":
        addHighlight();
        break;

      case "whiteout":
        addWhiteout();
        break;

      case "line":
        addLine();
        break;

      case "image":
        addImage();
        break;
    }
  }

  function addNewItem(
    item: PdfEditItem
  ) {
    setItems((prev) => {
      const next = [
        ...prev,
        item,
      ];

      setSelectedIndex(
        next.length - 1
      );

      return next;
    });
  }

  /*
   * ============================
   * DELETE
   * ============================
   */

  function removeItem(
    index: number
  ) {
    setItems((prev) =>
      prev.filter(
        (_, i) =>
          i !== index
      )
    );

    setSelectedIndex(
      (current) => {
        if (current === null) {
          return null;
        }

        if (current === index) {
          return null;
        }

        if (current > index) {
          return current - 1;
        }

        return current;
      }
    );
  }

  /*
   * ============================
   * DUPLICATE
   * ============================
   */

  function duplicateItem(
    index: number
  ) {
    setItems((prev) => {
      const original =
        prev[index];

      if (!original) {
        return prev;
      }

      const copy =
        duplicatePdfItem(
          original
        );

      const result = [
        ...prev.slice(
          0,
          index + 1
        ),
        copy,
        ...prev.slice(
          index + 1
        ),
      ];

      setSelectedIndex(
        index + 1
      );

      return result;
    });
  }

  /*
   * ============================
   * RESET
   * ============================
   */

  function resetEditor() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setItems([]);
    setSelectedIndex(null);

    setText(
      "Sample Text"
    );

    setFontSize(18);

    setTextColor(
      DEFAULT_TEXT_COLOR
    );

    setRectangleColor(
      DEFAULT_RECT_COLOR
    );

    setHighlightColor(
      DEFAULT_HIGHLIGHT_COLOR
    );

    setLineColor(
      DEFAULT_LINE_COLOR
    );

    setBorderWidth(2);

    setHighlightOpacity(
      0.35
    );

    setLineThickness(2);

    setPage(1);
    setCurrentPreviewPage(1);

    setX(50);
    setY(50);

    setWidth(200);
    setHeight(80);

    setEndX(250);
    setEndY(130);

    setImageData(null);
    setImageName("");

    setImageWidth(200);
    setImageHeight(120);

    setZoom(100);

    setPreviewUrl(null);
  }

  /*
   * ============================
   * REMOVE FILE
   * ============================
   */

  function removeFile() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setFile(null);
    setItems([]);
    setSelectedIndex(null);

    setPageCount(1);
    setPage(1);
    setCurrentPreviewPage(1);

    setPreviewUrl(null);
  }

  /*
   * ============================
   * LIVE PREVIEW
   * ============================
   */

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    let cancelled = false;

    const timer =
      window.setTimeout(
        async () => {
          try {
            setPreviewLoading(
              true
            );

            const blob =
              await editPDF(
                file,
                items
              );

            if (cancelled) {
              return;
            }

            const url =
              URL.createObjectURL(
                blob
              );

            setPreviewUrl(
              (previous) => {
                if (previous) {
                  URL.revokeObjectURL(
                    previous
                  );
                }

                return url;
              }
            );
          } catch (error) {
            console.error(
              "Preview generation failed:",
              error
            );
          } finally {
            if (!cancelled) {
              setPreviewLoading(
                false
              );
            }
          }
        },
        350
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timer
      );
    };
  }, [file, items]);

  /*
   * ============================
   * DOWNLOAD
   * ============================
   */

  async function save() {
    if (!file) return;

    try {
      setLoading(true);

      const blob =
        await editPDF(
          file,
          items
        );

      const outputName =
        file.name.replace(
          /\.pdf$/i,
          ""
        ) +
        "-edited.pdf";

      downloadBlob(
        blob,
        outputName
      );
    } catch (error) {
      console.error(
        "PDF export failed:",
        error
      );

      alert(
        "Unable to generate the edited PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================
   * PAGE NAVIGATION
   * ============================
   */

  function previousPage() {
    setCurrentPreviewPage(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }

  function nextPage() {
    setCurrentPreviewPage(
      (current) =>
        Math.min(
          pageCount,
          current + 1
        )
    );
  }

  function goToPage(
    value: number
  ) {
    if (!Number.isFinite(value)) {
      return;
    }

    const next =
      Math.max(
        1,
        Math.min(
          pageCount,
          Math.floor(value)
        )
      );

    setPage(next);
    setCurrentPreviewPage(
      next
    );
  }

  /*
   * ============================
   * ELEMENTS FOR PAGE
   * ============================
   */

  const pageItems =
    items
      .map(
        (item, index) => ({
          item,
          index,
        })
      )
      .filter(
        ({ item }) =>
          item.page === page
      );

  const previewItems =
    items.filter(
      (item) =>
        item.page ===
        currentPreviewPage
    );

  /*
   * ============================
   * EMPTY STATE
   * ============================
   */

  if (!file) {
    return (
      <main className="min-h-auto rounded-2xl bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              <span>✦</span>
              Browser PDF Editor
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Edit PDF Online
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Add text, highlight content,
              draw shapes, insert images,
              hide sensitive information
              and export your edited PDF.
            </p>
          </div> */}

          <label
            htmlFor="pdf-upload"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() =>
              setDragging(false)
            }
            onDrop={handleDrop}
            className={`group relative flex min-h-50 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              dragging
                ? "scale-[1.01] border-blue-500 bg-blue-50 shadow-xl shadow-blue-100 dark:bg-blue-950/30"
                : "border-slate-300 bg-white shadow-sm hover:border-blue-400 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                handleFileInput
              }
              className="hidden"
            />

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 transition group-hover:scale-105 dark:bg-red-950/40 dark:text-red-400">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <path d="M14 2v6h6" />
                <path d="M8 13h8M8 17h5" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Drop your PDF here
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or choose a PDF file from your device
            </p>

            <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-blue-700">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>

              Choose PDF
            </span>

            {/* <div className="mt-7 flex flex-wrap justify-center gap-2">
              {[
                "Text",
                "Highlight",
                "Images",
                "Shapes",
                "Whiteout",
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  {label}
                </span>
              ))}
            </div> */}

            {/* <p className="mt-6 text-xs text-slate-400">
              🔒 Files are processed locally
              in your browser.
            </p> */}
          </label>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon="T"
              title="Text"
              description="Add and customize text."
            />

            <FeatureCard
              icon="🖍"
              title="Highlight"
              description="Mark important content."
            />

            <FeatureCard
              icon="🖼"
              title="Images"
              description="Insert PNG and JPG files."
            />

            <FeatureCard
              icon="⬜"
              title="Whiteout"
              description="Cover private information."
            />
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================
   * EDITOR
   * ============================
   */

  return (
    <main className="min-h-screen rounded-2xl bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-[1700px] px-3 py-4 sm:px-5 lg:px-6">

        {/* HEADER */}

        <header className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20">
                ✎
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold">
                  PDF Editor
                </h1>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {file.name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  resetEditor
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
              >
                ↺ Reset
              </button>

              <button
                type="button"
                onClick={save}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Generating..."
                  : "↓ Download PDF"}
              </button>
            </div>
          </div>
        </header>

        {/* FILE INFO */}

        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg dark:bg-red-950/40">
              PDF
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {file.name}
              </p>

              <p className="text-xs text-slate-500">
                {(
                  file.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
                <span className="mx-1">
                  •
                </span>
                {pageCount}{" "}
                {pageCount === 1
                  ? "page"
                  : "pages"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              removeFile
            }
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Change PDF
          </button>
        </div>

        {/* EDITOR GRID */}

        <div className="grid gap-4 xl:grid-cols-[350px_minmax(0,1fr)]">

          {/* SIDEBAR */}

          <aside className="space-y-4">

            {/* TOOLS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4">
                <h2 className="font-bold">
                  Editing Tools
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Choose what you want to add
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TOOL_CONFIG.map(
                  (toolItem) => {
                    const active =
                      tool ===
                      toolItem.id;

                    return (
                      <button
                        key={
                          toolItem.id
                        }
                        type="button"
                        onClick={() =>
                          setTool(
                            toolItem.id
                          )
                        }
                        className={`group rounded-xl border p-3 text-left transition-all ${
                          active
                            ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-600 dark:bg-blue-950/40"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                              active
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800"
                            }`}
                          >
                            {
                              toolItem.icon
                            }
                          </span>

                          <span
                            className={`text-xs font-bold ${
                              active
                                ? "text-blue-700 dark:text-blue-300"
                                : ""
                            }`}
                          >
                            {
                              toolItem.name
                            }
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                          {
                            toolItem.description
                          }
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </section>

            {/* SETTINGS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Settings
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Configure selected tool
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {
                    TOOL_CONFIG.find(
                      (item) =>
                        item.id ===
                        tool
                    )?.name
                  }
                </span>
              </div>

              {/* PAGE */}

              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Target page
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        page - 1
                      )
                    }
                    disabled={
                      page <= 1
                    }
                    className="h-10 w-10 rounded-xl border border-slate-200 disabled:opacity-40 dark:border-slate-700"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={page}
                    onChange={(event) =>
                      goToPage(
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        page + 1
                      )
                    }
                    disabled={
                      page >=
                      pageCount
                    }
                    className="h-10 w-10 rounded-xl border border-slate-200 disabled:opacity-40 dark:border-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* TEXT */}

              {tool === "text" && (
                <div className="space-y-4">
                  <TextAreaField
                    label="Text"
                    value={text}
                    onChange={
                      setText
                    }
                  />

                  <NumberField
                    label="Font size"
                    value={
                      fontSize
                    }
                    setValue={
                      setFontSize
                    }
                    min={6}
                    max={120}
                  />

                  <ColorField
                    label="Text color"
                    value={
                      textColor
                    }
                    onChange={
                      setTextColor
                    }
                  />
                </div>
              )}

              {/* RECTANGLE */}

              {tool ===
                "rectangle" && (
                <div className="space-y-4">
                  <SizeSettings
                    width={
                      width
                    }
                    height={
                      height
                    }
                    setWidth={
                      setWidth
                    }
                    setHeight={
                      setHeight
                    }
                  />

                  <ColorField
                    label="Border color"
                    value={
                      rectangleColor
                    }
                    onChange={
                      setRectangleColor
                    }
                  />

                  <NumberField
                    label="Border width"
                    value={
                      borderWidth
                    }
                    setValue={
                      setBorderWidth
                    }
                    min={1}
                    max={20}
                  />
                </div>
              )}

              {/* HIGHLIGHT */}

              {tool ===
                "highlight" && (
                <div className="space-y-4">
                  <SizeSettings
                    width={
                      width
                    }
                    height={
                      height
                    }
                    setWidth={
                      setWidth
                    }
                    setHeight={
                      setHeight
                    }
                  />

                  <ColorField
                    label="Highlight color"
                    value={
                      highlightColor
                    }
                    onChange={
                      setHighlightColor
                    }
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Opacity
                      </label>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-slate-800">
                        {Math.round(
                          highlightOpacity *
                            100
                        )}
                        %
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={
                        highlightOpacity
                      }
                      onChange={(event) =>
                        setHighlightOpacity(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* WHITEOUT */}

              {tool ===
                "whiteout" && (
                <SizeSettings
                  width={
                    width
                  }
                  height={
                    height
                  }
                  setWidth={
                    setWidth
                  }
                  setHeight={
                    setHeight
                  }
                />
              )}

              {/* LINE */}

              {tool === "line" && (
                <div className="space-y-4">
                  <PositionSettings
                    x={x}
                    y={y}
                    setX={setX}
                    setY={setY}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="End X"
                      value={
                        endX
                      }
                      setValue={
                        setEndX
                      }
                    />

                    <NumberField
                      label="End Y"
                      value={
                        endY
                      }
                      setValue={
                        setEndY
                      }
                    />
                  </div>

                  <ColorField
                    label="Line color"
                    value={
                      lineColor
                    }
                    onChange={
                      setLineColor
                    }
                  />

                  <NumberField
                    label="Thickness"
                    value={
                      lineThickness
                    }
                    setValue={
                      setLineThickness
                    }
                    min={1}
                    max={20}
                  />
                </div>
              )}

              {/* IMAGE */}

              {tool === "image" && (
                <div className="space-y-4">
                  <label
                    htmlFor="image-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={
                        handleImageUpload
                      }
                      className="hidden"
                    />

                    <div className="mb-2 text-3xl">
                      🖼️
                    </div>

                    <p className="text-xs font-bold">
                      Upload Image
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      PNG or JPG
                    </p>
                  </label>

                  {imageData && (
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="bg-slate-100 p-2 dark:bg-slate-950">
                        <img
                          src={
                            imageData
                          }
                          alt="Selected image"
                          className="max-h-40 w-full object-contain"
                        />
                      </div>

                      <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-800">
                        <p className="truncate text-xs font-medium">
                          {
                            imageName
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  <SizeSettings
                    width={
                      imageWidth
                    }
                    height={
                      imageHeight
                    }
                    setWidth={
                      setImageWidth
                    }
                    setHeight={
                      setImageHeight
                    }
                  />
                </div>
              )}

              {/* POSITION */}

              {tool !== "line" && (
                <div className="mt-5">
                  <PositionSettings
                    x={x}
                    y={y}
                    setX={setX}
                    setY={setY}
                  />
                </div>
              )}

              {/* ADD */}

              <button
                type="button"
                onClick={
                  addItem
                }
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
              >
                + Add{" "}
                {
                  TOOL_CONFIG.find(
                    (item) =>
                      item.id ===
                      tool
                  )?.name
                }
              </button>
            </section>

            {/* ELEMENTS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Elements
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {items.length} total
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold dark:bg-slate-800">
                  {
                    pageItems.length
                  }{" "}
                  on page
                </span>
              </div>

              {pageItems.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                  <div className="text-2xl">
                    ✨
                  </div>

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    No elements on this page.
                  </p>
                </div>
              ) : (
                <div className="max-h-90 space-y-2 overflow-y-auto pr-1">
                  {pageItems.map(
                    ({
                      item,
                      index,
                    }) => {
                      const selected =
                        selectedIndex ===
                        index;

                      return (
                        <div
                          key={`${index}-${item.type}`}
                          onClick={() =>
                            setSelectedIndex(
                              index
                            )
                          }
                          className={`cursor-pointer rounded-xl border p-3 transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-start gap-2">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold dark:bg-slate-800">
                                {
                                  getToolIcon(
                                    item.type
                                  )
                                }
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold">
                                  {getItemLabel(
                                    item
                                  )}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-500">
                                  X{" "}
                                  {Math.round(
                                    item.x
                                  )}{" "}
                                  • Y{" "}
                                  {Math.round(
                                    item.y
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  duplicateItem(
                                    index
                                  );
                                }}
                                className="rounded-lg p-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Duplicate"
                              >
                                ⧉
                              </button>

                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  removeItem(
                                    index
                                  );
                                }}
                                className="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                title="Delete"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </aside>

          {/* PREVIEW */}

          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* PREVIEW HEADER */}

              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold">
                      Live Preview
                    </h2>

                    {previewLoading && (
                      <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                        Updating
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Page{" "}
                    {
                      currentPreviewPage
                    }{" "}
                    •{" "}
                    {
                      previewItems.length
                    }{" "}
                    elements
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setZoom(
                        (value) =>
                          Math.max(
                            50,
                            value -
                              10
                          )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    −
                  </button>

                  <span className="min-w-15 text-center text-xs font-bold">
                    {zoom}%
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setZoom(
                        (value) =>
                          Math.min(
                            200,
                            value +
                              10
                          )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setZoom(100)
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* =========================
                  A4 PDF PREVIEW
              ========================= */}

              <div className="relative min-h-180 overflow-auto bg-slate-100 p-4 dark:bg-slate-950 sm:p-8">

                {previewUrl ? (
                  <div className="flex min-w-max justify-center">

                    <div
                      className="relative overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-200"
                      style={{
                        width: `${A4_WIDTH * (zoom / 100)}px`,
                        height: `${A4_HEIGHT * (zoom / 100)}px`,
                      }}
                    >
                      <iframe
                        key={`${previewUrl}-${currentPreviewPage}-${zoom}`}
                        title="PDF Live Preview"
                        src={`${previewUrl}#page=${currentPreviewPage}&zoom=${zoom}&toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute left-0 top-0 border-0 bg-white"
                        style={{
                          width: `${A4_WIDTH}px`,
                          height: `${A4_HEIGHT}px`,
                          transform: `scale(${zoom / 100})`,
                          transformOrigin:
                            "top left",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-162.5 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow dark:bg-slate-900">
                        📄
                      </div>

                      <p className="mt-4 text-sm font-bold">
                        Preparing preview
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Your edited PDF will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="flex flex-col gap-3 border-t border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      previousPage
                    }
                    disabled={
                      currentPreviewPage <=
                      1
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    ← Previous
                  </button>

                  <span className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold dark:bg-slate-800">
                    {currentPreviewPage}{" "}
                    /{" "}
                    {pageCount}
                  </span>

                  <button
                    type="button"
                    onClick={
                      nextPage
                    }
                    disabled={
                      currentPreviewPage >=
                      pageCount
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Next →
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      currentPreviewPage
                    )
                  }
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold dark:bg-slate-800"
                >
                  Edit this page
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* SUMMARY */}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon="📄"
            title="Pages"
            value={pageCount}
            description="Total PDF pages"
          />

          <SummaryCard
            icon="✎"
            title="Elements"
            value={items.length}
            description="Added to document"
          />

          <SummaryCard
            icon="🔍"
            title="Zoom"
            value={`${zoom}%`}
            description="Preview zoom"
          />

          <SummaryCard
            icon="📐"
            title="Page Size"
            value="A4"
            description="794 × 1123 px"
          />
        </div>

        {/* EXPORT */}

        <div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">
                  ✓
                </span>

                <h3 className="font-bold">
                  Ready to export?
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                Generate your edited PDF directly
                in your browser.
              </p>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Generating PDF..."
                : "↓ Download Edited PDF"}
            </button>
          </div>
        </div>

        {/* PRIVACY */}

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm dark:bg-emerald-950/30">
            🔒
          </div>

          <div>
            <p className="text-xs font-bold">
              Your files stay private
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              PDF editing, preview generation and
              image embedding happen locally in
              your browser. Your PDF does not need
              to be uploaded to a server.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/*
 * ========================================
 * HELPERS
 * ========================================
 */

function safeNumber(
  value: number,
  fallback: number
): number {
  return Number.isFinite(value)
    ? value
    : fallback;
}

function safePositive(
  value: number,
  fallback: number
): number {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return fallback;
  }

  return value;
}

function duplicatePdfItem(
  item: PdfEditItem
): PdfEditItem {
  if (item.type === "line") {
    return {
      ...item,
      x: item.x + 20,
      y: item.y + 20,
      endX: item.endX + 20,
      endY: item.endY + 20,
    };
  }

  return {
    ...item,
    x: item.x + 20,
    y: item.y + 20,
  };
}

function getToolIcon(
  type: PdfEditItem["type"]
): string {
  switch (type) {
    case "text":
      return "T";

    case "rectangle":
      return "□";

    case "highlight":
      return "▰";

    case "whiteout":
      return "▱";

    case "line":
      return "╱";

    case "image":
      return "▣";

    default:
      return "•";
  }
}

function getItemLabel(
  item: PdfEditItem
): string {
  switch (item.type) {
    case "text":
      return `Text: ${item.text}`;

    case "rectangle":
      return "Rectangle";

    case "highlight":
      return "Highlight";

    case "whiteout":
      return "Whiteout";

    case "line":
      return "Line";

    case "image":
      return "Image";

    default:
      return "Element";
  }
}

/*
 * ========================================
 * FEATURE CARD
 * ========================================
 */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

/*
 * ========================================
 * NUMBER FIELD
 * ========================================
 */

function NumberField({
  label,
  value,
  setValue,
  min,
  max,
}: {
  label: string;
  value: number;
  setValue: (
    value: number
  ) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        {label}
      </label>

      <input
        type="number"
        value={
          Number.isFinite(value)
            ? value
            : ""
        }
        min={min}
        max={max}
        onChange={(event) => {
          const next =
            Number(
              event.target.value
            );

          if (
            Number.isFinite(next)
          ) {
            setValue(next);
          }
        }}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
      />
    </div>
  );
}

/*
 * ========================================
 * TEXTAREA
 * ========================================
 */

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
      />
    </div>
  );
}

/*
 * ========================================
 * POSITION
 * ========================================
 */

function PositionSettings({
  x,
  y,
  setX,
  setY,
}: {
  x: number;
  y: number;
  setX: (value: number) => void;
  setY: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        Position
      </label>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="X"
          value={x}
          setValue={setX}
          min={0}
        />

        <NumberField
          label="Y"
          value={y}
          setValue={setY}
          min={0}
        />
      </div>
    </div>
  );
}

/*
 * ========================================
 * SIZE
 * ========================================
 */

function SizeSettings({
  width,
  height,
  setWidth,
  setHeight,
}: {
  width: number;
  height: number;
  setWidth: (
    value: number
  ) => void;
  setHeight: (
    value: number
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        Size
      </label>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Width"
          value={width}
          setValue={setWidth}
          min={1}
        />

        <NumberField
          label="Height"
          value={height}
          setValue={setHeight}
          min={1}
        />
      </div>
    </div>
  );
}

/*
 * ========================================
 * COLOR FIELD
 * ========================================
 */

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PdfColor;
  onChange: (
    value: RGBColor
  ) => void;
}) {
  const cssColor =
    rgbToHex(value);

  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={cssColor}
          onChange={(event) =>
            onChange(
              hexToRgb(
                event.target.value
              )
            )
          }
          className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
        />

        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs uppercase dark:border-slate-700 dark:bg-slate-950">
          {cssColor}
        </div>

        <div
          className="h-9 w-9 rounded-lg border border-slate-200 shadow-inner dark:border-slate-700"
          style={{
            backgroundColor:
              cssColor,
          }}
        />
      </div>
    </div>
  );
}

/*
 * ========================================
 * COLOR HELPERS
 * ========================================
 */

function rgbToHex(
  color: PdfColor
): string {
  const r =
    Math.round(
      Math.max(
        0,
        Math.min(
          1,
          color.r
        )
      ) * 255
    );

  const g =
    Math.round(
      Math.max(
        0,
        Math.min(
          1,
          color.g
        )
      ) * 255
    );

  const b =
    Math.round(
      Math.max(
        0,
        Math.min(
          1,
          color.b
        )
      ) * 255
    );

  return (
    "#" +
    [r, g, b]
      .map(
        (value) =>
          value
            .toString(16)
            .padStart(
              2,
              "0"
            )
      )
      .join("")
  );
}

function hexToRgb(
  hex: string
): RGBColor {
  const clean =
    hex.replace(
      "#",
      ""
    );

  const value =
    clean.length === 3
      ? clean
          .split("")
          .map(
            (char) =>
              char + char
          )
          .join("")
      : clean;

  const number =
    parseInt(
      value,
      16
    );

  if (
    !Number.isFinite(number)
  ) {
    return {
      r: 0,
      g: 0,
      b: 0,
    };
  }

  return {
    r:
      ((number >> 16) & 255) /
      255,

    g:
      ((number >> 8) & 255) /
      255,

    b:
      (number & 255) /
      255,
  };
}

/*
 * ========================================
 * SUMMARY
 * ========================================
 */

function SummaryCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm dark:bg-slate-800">
          {icon}
        </span>

        <span className="text-lg font-bold">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-bold">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}