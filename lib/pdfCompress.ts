import {
  PDFDocument,
  PDFName,
  PDFDict,
} from "pdf-lib";

/**
 * Browser-side PDF optimization.
 *
 * This removes some unnecessary document objects and
 * recreates the PDF structure.
 *
 * It is not equivalent to Ghostscript-level compression.
 */
export async function compressPDF(
  file: File
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();

  const pdf = await PDFDocument.load(bytes, {
    updateMetadata: false,
  });

  // Remove common metadata fields
  const catalog = pdf.context.lookup(
    pdf.context.trailerInfo.Root
  );

  if (catalog instanceof PDFDict) {
    catalog.delete(PDFName.of("Metadata"));
  }

  return await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });
}