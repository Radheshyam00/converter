import { PDFDocument } from "pdf-lib";

export interface PdfPageImage {
  blob: Blob;
  name: string;
  page: number;
}

/**
 * Converts PDF pages to JPEG.
 *
 * Note:
 * pdf-lib itself cannot render PDF pages to pixels.
 * The actual rendering is handled by pdfjs-dist in the component.
 */
export async function validatePdf(file: File): Promise<boolean> {
  try {
    const bytes = await file.arrayBuffer();
    await PDFDocument.load(bytes);
    return true;
  } catch {
    return false;
  }
}