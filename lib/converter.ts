export function getPdfFileName(fileName: string) {
  return fileName
    .replace(/\.md$/i, "")
    .replace(/\s+/g, "_") + ".pdf";
}