import { PDFDocument } from "pdf-lib";

export interface ImageToPdfOptions {
  pageSize?: "A4" | "A3" | "A5" | "LETTER" | "LEGAL";
  margin?: number;
  fitToPage?: boolean;
}

const PAGE_SIZES = {
  A4: [595.28, 841.89],
  A3: [841.89, 1190.55],
  A5: [419.53, 595.28],
  LETTER: [612, 792],
  LEGAL: [612, 1008],
} as const;

async function loadImageDimensions(
  file: File
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  const dataUrl = await fileToDataURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        dataUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      reject(new Error(`Unable to read image: ${file.name}`));
    };

    image.src = dataUrl;
  });
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read image."));
      }
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

export async function imagesToPdf(
  files: File[],
  options: ImageToPdfOptions = {}
): Promise<Uint8Array> {
  const {
    pageSize = "A4",
    margin = 20,
    fitToPage = true,
  } = options;

  const pdfDoc = await PDFDocument.create();

  const [pageWidth, pageHeight] = PAGE_SIZES[pageSize];

  for (const file of files) {
    const image = await loadImageDimensions(file);

    let embeddedImage;

    if (
      file.type === "image/jpeg" ||
      file.type === "image/jpg"
    ) {
      embeddedImage = await pdfDoc.embedJpg(image.dataUrl);
    } else {
      embeddedImage = await pdfDoc.embedPng(image.dataUrl);
    }

    const page = pdfDoc.addPage([
      pageWidth,
      pageHeight,
    ]);

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    let drawWidth = image.width;
    let drawHeight = image.height;

    if (fitToPage) {
      const scale = Math.min(
        availableWidth / image.width,
        availableHeight / image.height
      );

      drawWidth = image.width * scale;
      drawHeight = image.height * scale;
    }

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return await pdfDoc.save();
}