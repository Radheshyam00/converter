"use client";

import { useState } from "react";
import {
  resizeImage,
  downloadBlob,
} from "@/lib/imageTools";

export default function ImageResize() {
  const [file, setFile] = useState<File | null>(null);

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [maintainRatio, setMaintainRatio] =
    useState(true);

  const [loading, setLoading] = useState(false);

  const resize = async () => {
    if (!file) {
      alert("Please select an image.");
      return;
    }

    const targetWidth = Number(width);
    const targetHeight = height
      ? Number(height)
      : undefined;

    if (!targetWidth || targetWidth <= 0) {
      alert("Enter a valid width.");
      return;
    }

    try {
      setLoading(true);

      const blob = await resizeImage(
        file,
        targetWidth,
        targetHeight,
        maintainRatio
      );

      const name = file.name.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        "_resized.jpg"
      );

      downloadBlob(blob, name);
    } catch (error) {
      console.error(error);
      alert("Failed to resize image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        Resize Image
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
        className="block w-full rounded-lg border p-3"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm">
            Width (px)
          </label>

          <input
            type="number"
            min="1"
            value={width}
            onChange={(e) =>
              setWidth(e.target.value)
            }
            placeholder="1920"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">
            Height (px)
          </label>

          <input
            type="number"
            min="1"
            value={height}
            onChange={(e) =>
              setHeight(e.target.value)
            }
            placeholder="1080"
            disabled={maintainRatio}
            className="w-full rounded-lg border p-3 disabled:bg-slate-100"
          />
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={maintainRatio}
          onChange={(e) =>
            setMaintainRatio(e.target.checked)
          }
        />

        Maintain aspect ratio
      </label>

      <button
        onClick={resize}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Resizing..."
          : "Resize Image"}
      </button>
    </div>
  );
}