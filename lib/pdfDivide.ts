import { PDFDocument } from "pdf-lib";

export type SplitMode =
  | "pages"
  | "ranges"
  | "selected";

function parsePageRanges(
  input: string,
  totalPages: number
): number[] {
  const pages = new Set<number>();

  const parts = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startRaw, endRaw] = part
        .split("-")
        .map((value) => Number(value.trim()));

      if (
        !Number.isInteger(startRaw) ||
        !Number.isInteger(endRaw) ||
        startRaw < 1 ||
        endRaw > totalPages ||
        startRaw > endRaw
      ) {
        throw new Error(`Invalid page range: ${part}`);
      }

      for (let i = startRaw; i <= endRaw; i++) {
        pages.add(i);
      }
    } else {
      const page = Number(part);

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        page > totalPages
      ) {
        throw new Error(`Invalid page number: ${part}`);
      }

      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Converts pdf-lib's Uint8Array<ArrayBufferLike>
 * into a Blob-safe ArrayBuffer.
 */
function createPdfBlob(pdfBytes: Uint8Array): Blob {
  const buffer = new ArrayBuffer(pdfBytes.byteLength);

  new Uint8Array(buffer).set(pdfBytes);

  return new Blob([buffer], {
    type: "application/pdf",
  });
}

export async function splitPDF(
  file: File,
  mode: SplitMode,
  rangeText?: string
): Promise<Blob[]> {
  const bytes = await file.arrayBuffer();

  const source = await PDFDocument.load(bytes);
  const totalPages = source.getPageCount();

  const results: Blob[] = [];

  // Split every page into a separate PDF
  if (mode === "pages") {
    for (let i = 0; i < totalPages; i++) {
      const output = await PDFDocument.create();

      const [page] = await output.copyPages(source, [i]);

      output.addPage(page);

      const pdfBytes = await output.save();

      results.push(createPdfBlob(pdfBytes));
    }

    return results;
  }

  // Ranges / selected mode requires page input
  if (!rangeText?.trim()) {
    throw new Error("Enter page numbers or ranges.");
  }

  const pages = parsePageRanges(
    rangeText,
    totalPages
  );

  const output = await PDFDocument.create();

  const copiedPages = await output.copyPages(
    source,
    pages.map((page) => page - 1)
  );

  copiedPages.forEach((page) => {
    output.addPage(page);
  });

  const pdfBytes = await output.save();

  results.push(createPdfBlob(pdfBytes));

  return results;
}