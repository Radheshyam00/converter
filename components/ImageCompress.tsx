"use client";

import { useState } from "react";
import {
  compressImage,
  downloadBlob,
} from "@/lib/imageTools";

export default function ImageCompress() {
  const [file, setFile] = useState<File | null>(null);

  const [quality, setQuality] = useState(70);

  const [loading, setLoading] = useState(false);

  const compress = async () => {
    if (!file) {
      alert("Please select an image.");
      return;
    }

    try {
      setLoading(true);

      const blob = await compressImage(
        file,
        quality / 100
      );

      const name = file.name.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        "_compressed.jpg"
      );

      downloadBlob(blob, name);
    } catch (error) {
      console.error(error);
      alert("Failed to compress image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        Compress Image
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
        className="block w-full rounded-lg border p-3"
      />

      <div>
        <label className="mb-2 block">
          Quality: {quality}%
        </label>

        <input
          type="range"
          min="10"
          max="100"
          value={quality}
          onChange={(e) =>
            setQuality(Number(e.target.value))
          }
          className="w-full"
        />
      </div>

      <button
        onClick={compress}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Compressing..."
          : "Compress Image"}
      </button>
    </div>
  );
}