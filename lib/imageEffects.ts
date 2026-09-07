export type ImageEffectSettings = {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  blur: number;
};

export async function applyImageEffects(
  file: File,
  settings: ImageEffectSettings
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    bitmap.close();
    throw new Error("Unable to create canvas.");
  }

  ctx.filter = `
    brightness(${settings.brightness}%)
    contrast(${settings.contrast}%)
    saturate(${settings.saturation}%)
    grayscale(${settings.grayscale}%)
    sepia(${settings.sepia}%)
    blur(${settings.blur}px)
  `;

  ctx.drawImage(bitmap, 0, 0);

  bitmap.close();

  const blob = await new Promise<Blob | null>(
    (resolve) => {
      canvas.toBlob(
        resolve,
        "image/jpeg",
        0.95
      );
    }
  );

  if (!blob) {
    throw new Error("Failed to create image.");
  }

  return blob;
}