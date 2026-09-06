export interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
  maintainAspectRatio?: boolean;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load image."));
    };

    image.src = url;
  });
}

export async function processImage(
  file: File,
  options: ImageResizeOptions
): Promise<Blob> {
  const image = await loadImage(file);

  const {
    width,
    height,
    quality = 0.85,
    format = "image/jpeg",
    maintainAspectRatio = true,
  } = options;

  let targetWidth = width || image.naturalWidth;
  let targetHeight = height || image.naturalHeight;

  if (maintainAspectRatio) {
    if (width && !height) {
      targetHeight =
        (image.naturalHeight / image.naturalWidth) *
        width;
    }

    if (height && !width) {
      targetWidth =
        (image.naturalWidth / image.naturalHeight) *
        height;
    }

    if (width && height) {
      const scale = Math.min(
        width / image.naturalWidth,
        height / image.naturalHeight
      );

      targetWidth = image.naturalWidth * scale;
      targetHeight = image.naturalHeight * scale;
    }
  }

  const canvas = document.createElement("canvas");

  canvas.width = Math.round(targetWidth);
  canvas.height = Math.round(targetHeight);

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported.");
  }

  context.drawImage(
    image,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error("Unable to create image.")
          );
        }
      },
      format,
      quality
    );
  });
}

export async function compressImage(
  file: File,
  quality = 0.7
): Promise<Blob> {
  return processImage(file, {
    quality,
    format: "image/jpeg",
    maintainAspectRatio: true,
  });
}

export async function resizeImage(
  file: File,
  width: number,
  height?: number,
  maintainAspectRatio = true
): Promise<Blob> {
  return processImage(file, {
    width,
    height,
    quality: 0.9,
    format: "image/jpeg",
    maintainAspectRatio,
  });
}

export function downloadBlob(
  blob: Blob,
  filename: string
) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}