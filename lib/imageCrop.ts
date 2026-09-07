export async function cropImage(
  file: File,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create canvas.");
  }

  ctx.drawImage(
    bitmap,
    x,
    y,
    width,
    height,
    0,
    0,
    width,
    height
  );

  bitmap.close();

  const blob = await new Promise<Blob | null>(
    (resolve) =>
      canvas.toBlob(
        resolve,
        "image/png",
        1
      )
  );

  if (!blob) {
    throw new Error("Failed to create cropped image.");
  }

  return blob;
}