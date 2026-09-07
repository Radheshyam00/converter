import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "pdf-lib";

export type PdfEditItem =
  | {
      type: "text";
      page: number;
      text: string;
      x: number;
      y: number;
      size: number;
    }
  | {
      type: "rectangle";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    };

/**
 * Converts pdf-lib Uint8Array<ArrayBufferLike>
 * into a Blob-safe ArrayBuffer.
 */
function createPdfBlob(result: Uint8Array): Blob {
  const buffer = new ArrayBuffer(result.byteLength);

  new Uint8Array(buffer).set(result);

  return new Blob([buffer], {
    type: "application/pdf",
  });
}

export async function editPDF(
  file: File,
  items: PdfEditItem[]
): Promise<Blob> {
  const bytes = await file.arrayBuffer();

  const pdf = await PDFDocument.load(bytes);

  const font = await pdf.embedFont(
    StandardFonts.Helvetica
  );

  for (const item of items) {
    const pageIndex = item.page - 1;

    // Validate page number
    if (
      pageIndex < 0 ||
      pageIndex >= pdf.getPageCount()
    ) {
      continue;
    }

    const page = pdf.getPage(pageIndex);

    const { height } = page.getSize();

    if (item.type === "text") {
      page.drawText(item.text, {
        x: item.x,
        y: height - item.y,
        size: item.size,
        font,
        color: rgb(0, 0, 0),
      });
    }

    if (item.type === "rectangle") {
      page.drawRectangle({
        x: item.x,
        y: height - item.y - item.height,
        width: item.width,
        height: item.height,
        borderWidth: 2,
        borderColor: rgb(0.1, 0.4, 0.9),
      });
    }
  }

  const result = await pdf.save();

  return createPdfBlob(result);
}