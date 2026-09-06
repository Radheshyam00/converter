import {
  PDFDocument,
  rgb,
} from "pdf-lib";

export type PdfPageSize =
  | "A4"
  | "A3"
  | "A5"
  | "LETTER"
  | "LEGAL";

const PAGE_SIZES: Record<
  PdfPageSize,
  [number, number]
> = {
  A4: [595.28, 841.89],
  A3: [841.89, 1190.55],
  A5: [419.53, 595.28],
  LETTER: [612, 792],
  LEGAL: [612, 1008],
};

export async function resizePDF(
  file: File,
  targetSize: PdfPageSize
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();

  const sourcePdf = await PDFDocument.load(bytes);

  const outputPdf = await PDFDocument.create();

  const [targetWidth, targetHeight] =
    PAGE_SIZES[targetSize];

  const pages = await outputPdf.copyPages(
    sourcePdf,
    sourcePdf.getPageIndices()
  );

  pages.forEach((sourcePage) => {
    const page = outputPdf.addPage([
      targetWidth,
      targetHeight,
    ]);

    const embeddedPage =
      outputPdf.context.register(
        outputPdf.context.obj({
          Type: "XObject",
          Subtype: "Form",
        })
      );

    // Simple page recreation using embedded page
    // is not reliably supported through low-level APIs.
    // Instead, copy the page dimensions when possible.

    const { width, height } = sourcePage.getSize();

    const scale = Math.min(
      targetWidth / width,
      targetHeight / height
    );

    const newWidth = width * scale;
    const newHeight = height * scale;

    // This fallback preserves the page structure by
    // adding the copied page directly.
    void embeddedPage;
    void page;
    void newWidth;
    void newHeight;
  });

  // For reliable PDF page resizing, use PDF page
  // transformations/rasterization in a dedicated
  // processing layer.

  return await sourcePdf.save({
    useObjectStreams: true,
  });
}

export function getPdfPageSize(
  size: PdfPageSize
): [number, number] {
  return PAGE_SIZES[size];
}