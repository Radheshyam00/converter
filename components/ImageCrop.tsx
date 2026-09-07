
"use client";

import { useEffect, useRef, useState } from "react";
import { cropImage } from "@/lib/imageCrop";
import { downloadBlob } from "@/lib/imageTools";

type CropMode = "rectangle" | "custom";

type Selection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function ImageCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [mode, setMode] = useState<CropMode>("rectangle");

  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [loading, setLoading] = useState(false);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [drawing, setDrawing] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewAreaRef = useRef<HTMLDivElement | null>(null);

  const drawStartRef = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (selected?: File) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setFile(selected);

    setX("0");
    setY("0");
    setWidth("");
    setHeight("");
    setSelection(null);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setX("0");
    setY("0");
    setWidth("");
    setHeight("");
    setSelection(null);
  };

  /*
   * Convert mouse/touch position to actual image pixels.
   */
  const getImageCoordinates = (
    clientX: number,
    clientY: number
  ) => {
    const image = imageRef.current;

    if (!image) return null;

    const rect = image.getBoundingClientRect();

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
      return null;
    }

    const scaleX = naturalWidth / rect.width;
    const scaleY = naturalHeight / rect.height;

    const localX = Math.max(
      0,
      Math.min(clientX - rect.left, rect.width)
    );

    const localY = Math.max(
      0,
      Math.min(clientY - rect.top, rect.height)
    );

    return {
      x: localX * scaleX,
      y: localY * scaleY,
      scaleX,
      scaleY,
    };
  };

  /*
   * Start drawing crop rectangle.
   */
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!file || !imageRef.current) return;

    const coordinates = getImageCoordinates(
      e.clientX,
      e.clientY
    );

    if (!coordinates) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    drawStartRef.current = {
      x: coordinates.x,
      y: coordinates.y,
    };

    setDrawing(true);

    setSelection({
      x: Math.round(coordinates.x),
      y: Math.round(coordinates.y),
      width: 0,
      height: 0,
    });
  };

  /*
   * Update rectangle while dragging.
   */
  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!drawing || !imageRef.current) return;

    const coordinates = getImageCoordinates(
      e.clientX,
      e.clientY
    );

    if (!coordinates) return;

    const startX = drawStartRef.current.x;
    const startY = drawStartRef.current.y;

    const currentX = coordinates.x;
    const currentY = coordinates.y;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);

    const cropWidth = Math.abs(currentX - startX);
    const cropHeight = Math.abs(currentY - startY);

    const newSelection = {
      x: Math.round(left),
      y: Math.round(top),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    };

    setSelection(newSelection);

    setX(String(newSelection.x));
    setY(String(newSelection.y));
    setWidth(String(newSelection.width));
    setHeight(String(newSelection.height));
  };

  /*
   * Finish drawing.
   */
  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!drawing) return;

    setDrawing(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Pointer may already have been released.
    }
  };

  /*
   * Clear drawn rectangle.
   */
  const clearSelection = () => {
    setSelection(null);
    setX("0");
    setY("0");
    setWidth("");
    setHeight("");
  };

  /*
   * Update selection from manual fields.
   */
  const updateSelectionFromInputs = (
    nextX: string,
    nextY: string,
    nextWidth: string,
    nextHeight: string
  ) => {
    const parsedX = Number(nextX);
    const parsedY = Number(nextY);
    const parsedWidth = Number(nextWidth);
    const parsedHeight = Number(nextHeight);

    if (
      Number.isFinite(parsedX) &&
      Number.isFinite(parsedY) &&
      Number.isFinite(parsedWidth) &&
      Number.isFinite(parsedHeight) &&
      parsedX >= 0 &&
      parsedY >= 0 &&
      parsedWidth > 0 &&
      parsedHeight > 0
    ) {
      setSelection({
        x: parsedX,
        y: parsedY,
        width: parsedWidth,
        height: parsedHeight,
      });
    }
  };

  const setPreset = (
    preset: "square" | "landscape" | "portrait" | "full"
  ) => {
    if (!file || !preview) return;

    const img = new Image();

    img.onload = () => {
      const imageWidth = img.naturalWidth;
      const imageHeight = img.naturalHeight;

      let newX = 0;
      let newY = 0;
      let newWidth = imageWidth;
      let newHeight = imageHeight;

      if (preset === "full") {
        newX = 0;
        newY = 0;
        newWidth = imageWidth;
        newHeight = imageHeight;
      }

      if (preset === "square") {
        const size = Math.min(imageWidth, imageHeight);

        newX = Math.floor((imageWidth - size) / 2);
        newY = Math.floor((imageHeight - size) / 2);
        newWidth = size;
        newHeight = size;
      }

      if (preset === "landscape") {
        const cropHeight = Math.floor(
          imageWidth * 9 / 16
        );

        if (cropHeight <= imageHeight) {
          newX = 0;
          newY = Math.floor(
            (imageHeight - cropHeight) / 2
          );
          newWidth = imageWidth;
          newHeight = cropHeight;
        } else {
          const cropWidth = Math.floor(
            imageHeight * 16 / 9
          );

          newX = Math.floor(
            (imageWidth - cropWidth) / 2
          );
          newY = 0;
          newWidth = cropWidth;
          newHeight = imageHeight;
        }
      }

      if (preset === "portrait") {
        const cropWidth = Math.floor(
          imageHeight * 4 / 5
        );

        if (cropWidth <= imageWidth) {
          newX = Math.floor(
            (imageWidth - cropWidth) / 2
          );
          newY = 0;
          newWidth = cropWidth;
          newHeight = imageHeight;
        } else {
          const cropHeight = Math.floor(
            imageWidth * 5 / 4
          );

          newX = 0;
          newY = Math.floor(
            (imageHeight - cropHeight) / 2
          );
          newWidth = imageWidth;
          newHeight = cropHeight;
        }
      }

      setX(String(newX));
      setY(String(newY));
      setWidth(String(newWidth));
      setHeight(String(newHeight));

      setSelection({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    };

    img.src = preview;
  };

  /*
   * Convert image-pixel selection to CSS preview coordinates.
   */
  const getSelectionStyle = () => {
    if (!selection || !imageRef.current) {
      return {};
    }

    const image = imageRef.current;
    const rect = image.getBoundingClientRect();

    const scaleX = rect.width / image.naturalWidth;
    const scaleY = rect.height / image.naturalHeight;

    return {
      left: selection.x * scaleX,
      top: selection.y * scaleY,
      width: selection.width * scaleX,
      height: selection.height * scaleY,
    };
  };

  const crop = async () => {
    if (!file) {
      alert("Please select an image.");
      return;
    }

    const cropX = Number(x);
    const cropY = Number(y);
    const cropWidth = Number(width);
    const cropHeight = Number(height);

    if (
      !Number.isFinite(cropX) ||
      !Number.isFinite(cropY) ||
      !Number.isFinite(cropWidth) ||
      !Number.isFinite(cropHeight) ||
      cropX < 0 ||
      cropY < 0 ||
      cropWidth <= 0 ||
      cropHeight <= 0
    ) {
      alert("Draw a rectangle or enter valid crop dimensions.");
      return;
    }

    if (imageRef.current) {
      const imageWidth = imageRef.current.naturalWidth;
      const imageHeight = imageRef.current.naturalHeight;

      if (
        cropX + cropWidth > imageWidth ||
        cropY + cropHeight > imageHeight
      ) {
        alert(
          `Crop area exceeds image bounds. Image size: ${imageWidth} × ${imageHeight}px.`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const blob = await cropImage(
        file,
        cropX,
        cropY,
        cropWidth,
        cropHeight
      );

      downloadBlob(
        blob,
        file.name.replace(
          /\.(jpg|jpeg|png|webp)$/i,
          "_cropped.png"
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to crop image.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  const selectionStyle = getSelectionStyle();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="M6 2v4M2 6h4M18 18h4M18 22v-4" />
              <path d="M7 7h10v10H7z" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Crop Image
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Draw a rectangle directly on the image or enter exact pixel coordinates.
            </p>
          </div>
        </div>
      </div>

      {/* Upload / Drawing Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!file ? (
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFile(e.target.files?.[0])
              }
            />

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-105 dark:bg-blue-950/50 dark:text-blue-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-8 w-8"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Upload an image
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              JPG, JPEG, PNG or WebP images are supported.
            </p>

            <span className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-blue-700">
              Choose Image
            </span>
          </label>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

            {/* File Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="3"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {imageRef.current?.naturalWidth
                      ? ` • ${imageRef.current.naturalWidth} × ${imageRef.current.naturalHeight}px`
                      : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="ml-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Remove
              </button>
            </div>

            {/* Drawing Area */}
            <div className="bg-slate-950 p-3 sm:p-5">
              <div
                ref={previewAreaRef}
                className="relative mx-auto w-fit max-w-full select-none touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {preview && (
                  <img
                    ref={imageRef}
                    src={preview}
                    alt="Crop preview"
                    draggable={false}
                    className="block max-h-\[560px\] max-w-full rounded-lg object-contain shadow-2xl"
                  />
                )}

                {/* Dark overlay outside selection */}
                {selection &&
                  selection.width > 0 &&
                  selection.height > 0 && (
                    <>
                      <div
                        className="pointer-events-none absolute inset-0 rounded-lg bg-black/50"
                        style={{
                            clipPath: `polygon(
                                0% 0%,
                                100% 0%,
                                100% 100%,
                                0% 100%,
                                0% ${(selectionStyle.top ?? 0)}px,
                                ${(selectionStyle.left ?? 0)}px ${(selectionStyle.top ?? 0)}px,
                                ${(selectionStyle.left ?? 0)}px ${(selectionStyle.top ?? 0) + (selectionStyle.height ?? 0)}px,
                                ${(selectionStyle.left ?? 0) + (selectionStyle.width ?? 0)}px ${(selectionStyle.top ?? 0) + (selectionStyle.height ?? 0)}px,
                                ${(selectionStyle.left ?? 0) + (selectionStyle.width ?? 0)}px ${(selectionStyle.top ?? 0)}px,
                                0% ${(selectionStyle.top ?? 0)}px
                            )`,
                            }}
                      />

                      {/* Selection Border */}
                      <div
                        className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
                        style={{
                          left: selectionStyle.left,
                          top: selectionStyle.top,
                          width: selectionStyle.width,
                          height: selectionStyle.height,
                        }}
                      >
                        {/* Corner Handles */}
                        <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-sm border-2 border-white bg-blue-600 shadow" />
                        <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-sm border-2 border-white bg-blue-600 shadow" />
                        <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-sm border-2 border-white bg-blue-600 shadow" />
                        <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-sm border-2 border-white bg-blue-600 shadow" />

                        {/* Size Label */}
                        <div className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white shadow">
                          {selection.width} × {selection.height}px
                        </div>
                      </div>
                    </>
                  )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Click + drag to draw
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Rectangle selection
                </span>

                {selection &&
                  selection.width > 0 &&
                  selection.height > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="rounded-full bg-red-500/15 px-3 py-1.5 font-medium text-red-300 transition hover:bg-red-500/25"
                    >
                      Clear selection
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawing Instructions */}
      {file && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M12 3v18M3 12h18" />
                <rect
                  x="6"
                  y="6"
                  width="12"
                  height="12"
                  rx="2"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Draw your crop region
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
                Click and drag anywhere on the image to create a rectangular
                crop region. The coordinates and dimensions below update
                automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crop Mode */}
      {file && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Cutting Type
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Draw a region or manually define the rectangle.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("rectangle")}
              className={`rounded-xl border p-4 text-left transition ${
                mode === "rectangle"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-950/20"
                  : "border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="1"
                    />
                  </svg>
                </div>

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Draw Rectangle
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Click and drag directly over the image.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`rounded-xl border p-4 text-left transition ${
                mode === "custom"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-950/20"
                  : "border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M4 4h6M4 4v6M20 20h-6M20 20v-6" />
                    <path d="M9 9h6v6H9z" />
                  </svg>
                </div>

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Manual Coordinates
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Enter exact X, Y, width and height values.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Rectangle Controls */}
      {file && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Rectangle Dimensions
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Drawing on the image automatically fills these values.
              </p>
            </div>

            {selection &&
              selection.width > 0 &&
              selection.height > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Region selected
                </div>
              )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                X Position
              </label>

              <input
                type="number"
                min="0"
                value={x}
                onChange={(e) => {
                  const value = e.target.value;
                  setX(value);

                  updateSelectionFromInputs(
                    value,
                    y,
                    width,
                    height
                  );
                }}
                className={inputClass}
                placeholder="0"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Horizontal position
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Y Position
              </label>

              <input
                type="number"
                min="0"
                value={y}
                onChange={(e) => {
                  const value = e.target.value;
                  setY(value);

                  updateSelectionFromInputs(
                    x,
                    value,
                    width,
                    height
                  );
                }}
                className={inputClass}
                placeholder="0"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Vertical position
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Width
              </label>

              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) => {
                  const value = e.target.value;
                  setWidth(value);

                  updateSelectionFromInputs(
                    x,
                    y,
                    value,
                    height
                  );
                }}
                className={inputClass}
                placeholder="800"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Rectangle width
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Height
              </label>

              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => {
                  const value = e.target.value;
                  setHeight(value);

                  updateSelectionFromInputs(
                    x,
                    y,
                    width,
                    value
                  );
                }}
                className={inputClass}
                placeholder="600"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Rectangle height
              </p>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Quick Rectangle Presets
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Automatically create a centered crop region.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Square",
                  value: "1:1",
                  preset: "square" as const,
                },
                {
                  label: "Landscape",
                  value: "16:9",
                  preset: "landscape" as const,
                },
                {
                  label: "Portrait",
                  value: "4:5",
                  preset: "portrait" as const,
                },
                {
                  label: "Full Image",
                  value: "100%",
                  preset: "full" as const,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setPreset(item.preset)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.value}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                X
              </p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {x || "0"} px
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Y
              </p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {y || "0"} px
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Width
              </p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {width || "—"} px
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Height
              </p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {height || "—"} px
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <button
        type="button"
        onClick={crop}
        disabled={!file || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            Cropping Image...
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M6 2v4M2 6h4M18 18h4M18 22v-4" />
              <path d="M7 7h10v10H7z" />
            </svg>

            Crop Selected Region
          </>
        )}
      </button>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 pb-2 text-center text-xs text-slate-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-4 w-4"
        >
          <rect
            x="4"
            y="11"
            width="16"
            height="10"
            rx="2"
          />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>

        <span>
          Your image is processed locally in your browser and is never uploaded.
        </span>
      </div>
    </div>
  );
}

