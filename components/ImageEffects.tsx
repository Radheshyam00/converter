
"use client";

import { useEffect, useState } from "react";
import {
  applyImageEffects,
  ImageEffectSettings,
} from "@/lib/imageEffects";
import { downloadBlob } from "@/lib/imageTools";

const defaultSettings: ImageEffectSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
};

export default function ImageEffects() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [settings, setSettings] =
    useState<ImageEffectSettings>(defaultSettings);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);

    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleFile = (selected?: File) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setFile(selected);
    setSettings(defaultSettings);
  };

  const removeFile = () => {
    if (loading) return;

    setFile(null);
    setPreview(null);
    setSettings(defaultSettings);
  };

  const updateSetting = (
    key: keyof ImageEffectSettings,
    value: number
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const reset = () => {
    setSettings(defaultSettings);
  };

  const isDefault =
    settings.brightness === 100 &&
    settings.contrast === 100 &&
    settings.saturation === 100 &&
    settings.grayscale === 0 &&
    settings.sepia === 0 &&
    settings.blur === 0;

  const exportImage = async () => {
    if (!file) {
      alert("Please select an image.");
      return;
    }

    try {
      setLoading(true);

      const blob = await applyImageEffects(
        file,
        settings
      );

      downloadBlob(
        blob,
        file.name.replace(
          /\.(jpg|jpeg|png|webp)$/i,
          "_effect.jpg"
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to apply effects.");
    } finally {
      setLoading(false);
    }
  };

  const controls = [
    {
      key: "brightness" as const,
      label: "Brightness",
      description: "Adjust overall lightness",
      min: 0,
      max: 200,
      unit: "%",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ),
    },
    {
      key: "contrast" as const,
      label: "Contrast",
      description: "Control light and dark areas",
      min: 0,
      max: 200,
      unit: "%",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" />
        </svg>
      ),
    },
    {
      key: "saturation" as const,
      label: "Saturation",
      description: "Adjust color intensity",
      min: 0,
      max: 200,
      unit: "%",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 3s7 7.2 7 12a7 7 0 1 1-14 0c0-4.8 7-12 7-12Z" />
          <path d="M9 17c.7.7 1.5 1 3 1" />
        </svg>
      ),
    },
    {
      key: "grayscale" as const,
      label: "Grayscale",
      description: "Remove color from the image",
      min: 0,
      max: 100,
      unit: "%",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18" />
        </svg>
      ),
    },
    {
      key: "sepia" as const,
      label: "Sepia",
      description: "Add a warm vintage tone",
      min: 0,
      max: 100,
      unit: "%",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
          />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    {
      key: "blur" as const,
      label: "Blur",
      description: "Soften image details",
      min: 0,
      max: 20,
      unit: "px",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01" />
        </svg>
      ),
    },
  ];

  const presets = [
    {
      name: "Original",
      description: "Reset all effects",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      ),
      settings: defaultSettings,
    },
    {
      name: "Grayscale",
      description: "Classic black & white",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18" />
        </svg>
      ),
      settings: {
        ...defaultSettings,
        grayscale: 100,
      },
    },
    {
      name: "Sepia",
      description: "Warm vintage style",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
          />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      settings: {
        ...defaultSettings,
        sepia: 100,
      },
    },
    {
      name: "Vivid",
      description: "Bright and colorful",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ),
      settings: {
        ...defaultSettings,
        brightness: 115,
        contrast: 110,
        saturation: 120,
      },
    },
    {
      name: "Dramatic",
      description: "Deep and cinematic",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 3v18" />
          <path d="M5 6h14M5 18h14" />
        </svg>
      ),
      settings: {
        ...defaultSettings,
        brightness: 90,
        contrast: 120,
        saturation: 80,
      },
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m14 4 6 6" />
              <path d="m16 2 6 6" />
              <path d="m3 21 7-7" />
              <path d="M8 6h.01M12 10h.01M16 14h.01M20 18h.01" />
              <path d="M5 3h4v4H5z" />
              <path d="M15 17h4v4h-4z" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Image Effects
            </h2>

            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Adjust brightness, contrast, saturation and
              other image effects.
            </p>
          </div>
        </div>
      </div>

      {/* Upload / Preview */}
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

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-105 dark:bg-blue-950/50 dark:text-blue-400">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="m3 16 5-5 4 4 3-3 6 5" />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Drop your image here
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or choose an image from your device
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

              Choose Image
            </span>

            <p className="mt-4 text-xs text-slate-400">
              JPG, PNG, WEBP and other image formats
            </p>
          </label>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {/* Preview Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                    />
                    <circle cx="8.5" cy="9" r="1.5" />
                    <path d="m3 16 5-5 4 4 3-3 6 5" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                aria-label="Remove image"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex min-h-\[360px\] items-center justify-center bg-slate-100 p-5 dark:bg-slate-800">
              {preview && (
                <img
                  src={preview}
                  alt="Image preview"
                  className="max-h-\[450px\] max-w-full rounded-lg object-contain shadow-sm"
                  style={{
                    filter: `
                      brightness(${settings.brightness}%)
                      contrast(${settings.contrast}%)
                      saturate(${settings.saturation}%)
                      grayscale(${settings.grayscale}%)
                      sepia(${settings.sepia}%)
                      blur(${settings.blur}px)
                    `,
                  }}
                />
              )}
            </div>

            {/* Live Preview Badge */}
            <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live preview — effects update instantly
            </div>
          </div>
        )}
      </div>

      {/* Adjustments */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Adjustments
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Fine-tune your image using the controls below.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            disabled={isDefault || loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
              <path d="M3 21v-5h5" />
            </svg>

            Reset
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {controls.map((control) => (
            <div
              key={control.key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
                  {control.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {control.label}
                    </label>

                    <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                      {settings[control.key]}
                      {control.unit}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {control.description}
                  </p>
                </div>
              </div>

              <input
                type="range"
                min={control.min}
                max={control.max}
                value={settings[control.key]}
                onChange={(e) =>
                  updateSetting(
                    control.key,
                    Number(e.target.value)
                  )
                }
                disabled={!file || loading}
                aria-label={control.label}
                className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700"
              />

              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                <span>
                  {control.min}
                  {control.unit}
                </span>

                <span>
                  {control.max}
                  {control.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Effects */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Quick Effects
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Apply a preset with one click.
          </p>
        </div>

        <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() =>
                setSettings(preset.settings)
              }
              disabled={!file || loading}
              className={`group rounded-xl border p-4 text-left transition ${
                JSON.stringify(settings) ===
                JSON.stringify(preset.settings)
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-950/30"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-slate-800"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400">
                {preset.icon}
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {preset.name}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 12a8 8 0 0 1 16 0" />
                <path d="M12 4v8l5 3" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Live Preview
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Changes are shown instantly
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Local Processing
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your image stays in the browser
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export */}
      <button
        type="button"
        onClick={exportImage}
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
                className="opacity-25"
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
              />

              <path
                className="opacity-90"
                fill="currentColor"
                d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
              />
            </svg>

            Applying Effects...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>

            Download Image
          </>
        )}
      </button>

      {/* Privacy */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
          />

          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>

        Image processing happens locally in your browser.
        No files are uploaded to a server.
      </div>
    </div>
  );
}

