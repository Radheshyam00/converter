import {
  PDFDocument,
  PDFImage,
  rgb,
  StandardFonts,
} from "pdf-lib";

export type PdfColor = {
  r: number;
  g: number;
  b: number;
};

export type PdfEditItem =
  | {
      type: "text";
      page: number;
      text: string;
      x: number;
      y: number;
      size: number;
      color?: PdfColor;
    }
  | {
      type: "rectangle";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      color?: PdfColor;
      borderWidth?: number;
    }
  | {
      type: "highlight";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      color?: PdfColor;
      opacity?: number;
    }
  | {
      type: "whiteout";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "line";
      page: number;
      x: number;
      y: number;
      endX: number;
      endY: number;
      color?: PdfColor;
      thickness?: number;
    }
  | {
      type: "image";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
      dataUrl: string;
    };

/**
 * Convert a data URL into Uint8Array.
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  if (!dataUrl.startsWith("data:")) {
    throw new Error("Invalid image data URL.");
  }

  const commaIndex = dataUrl.indexOf(",");

  if (commaIndex === -1) {
    throw new Error("Invalid image data URL.");
  }

  const metadata = dataUrl.slice(0, commaIndex);
  const base64 = dataUrl.slice(commaIndex + 1);

  if (!metadata.includes(";base64")) {
    throw new Error(
      "Image must be provided as a base64 data URL."
    );
  }

  try {
    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  } catch {
    throw new Error("Invalid base64 image data.");
  }
}

/**
 * Convert our 0-1 RGB color to pdf-lib rgb().
 */
function getPdfColor(
  color?: PdfColor
) {
  return rgb(
    clamp(color?.r ?? 0, 0, 1),
    clamp(color?.g ?? 0, 0, 1),
    clamp(color?.b ?? 0, 0, 1)
  );
}

/**
 * Clamp number between min/max.
 */
function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}

/**
 * Convert editor Y coordinate
 * (top-left origin)
 * to PDF Y coordinate
 * (bottom-left origin).
 */
function pdfY(
  pageHeight: number,
  y: number,
  height = 0
): number {
  return pageHeight - y - height;
}

/**
 * Check whether a number is valid.
 */
function isValidNumber(
  value: number
): boolean {
  return (
    Number.isFinite(value) &&
    !Number.isNaN(value)
  );
}

/**
 * Validate a rectangle.
 */
function isValidRect(
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return (
    isValidNumber(x) &&
    isValidNumber(y) &&
    isValidNumber(width) &&
    isValidNumber(height) &&
    width > 0 &&
    height > 0
  );
}

/**
 * Edit an existing PDF.
 */
export async function editPDF(
  file: File,
  items: PdfEditItem[]
): Promise<Blob> {
  if (!file) {
    throw new Error("No PDF file provided.");
  }

  if (
    !file.type.includes("pdf") &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error(
      "Please select a valid PDF file."
    );
  }

  const inputBytes =
    await file.arrayBuffer();

  const pdfDoc =
    await PDFDocument.load(inputBytes);

  const font =
    await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

  /**
   * Cache embedded images.
   *
   * This prevents embedding the same
   * image multiple times.
   */
  const imageCache =
    new Map<string, PDFImage>();

  for (const item of items) {
    const pageIndex =
      item.page - 1;

    /**
     * Ignore invalid page numbers.
     */
    if (
      pageIndex < 0 ||
      pageIndex >= pdfDoc.getPageCount()
    ) {
      continue;
    }

    const page =
      pdfDoc.getPage(pageIndex);

    const pageHeight =
      page.getHeight();

    /*
     * =========================
     * TEXT
     * =========================
     */
    if (item.type === "text") {
      if (
        !item.text ||
        !isValidNumber(item.x) ||
        !isValidNumber(item.y) ||
        !isValidNumber(item.size) ||
        item.size <= 0
      ) {
        continue;
      }

      page.drawText(item.text, {
        x: item.x,
        y: pdfY(
          pageHeight,
          item.y,
          item.size
        ),
        size: item.size,
        font,
        color: getPdfColor(
          item.color ?? {
            r: 0,
            g: 0,
            b: 0,
          }
        ),
      });
    }

    /*
     * =========================
     * RECTANGLE
     * =========================
     */
    else if (
      item.type === "rectangle"
    ) {
      if (
        !isValidRect(
          item.x,
          item.y,
          item.width,
          item.height
        )
      ) {
        continue;
      }

      page.drawRectangle({
        x: item.x,
        y: pdfY(
          pageHeight,
          item.y,
          item.height
        ),
        width: item.width,
        height: item.height,

        borderColor:
          getPdfColor(
            item.color ?? {
              r: 0.12,
              g: 0.38,
              b: 0.95,
            }
          ),

        borderWidth:
          item.borderWidth ?? 2,

        color: undefined,
      });
    }

    /*
     * =========================
     * HIGHLIGHT
     * =========================
     */
    else if (
      item.type === "highlight"
    ) {
      if (
        !isValidRect(
          item.x,
          item.y,
          item.width,
          item.height
        )
      ) {
        continue;
      }

      const opacity = clamp(
        item.opacity ?? 0.35,
        0,
        1
      );

      page.drawRectangle({
        x: item.x,
        y: pdfY(
          pageHeight,
          item.y,
          item.height
        ),
        width: item.width,
        height: item.height,

        color:
          getPdfColor(
            item.color ?? {
              r: 1,
              g: 0.9,
              b: 0,
            }
          ),

        opacity,

        borderWidth: 0,
      });
    }

    /*
     * =========================
     * WHITEOUT
     * =========================
     */
    else if (
      item.type === "whiteout"
    ) {
      if (
        !isValidRect(
          item.x,
          item.y,
          item.width,
          item.height
        )
      ) {
        continue;
      }

      page.drawRectangle({
        x: item.x,
        y: pdfY(
          pageHeight,
          item.y,
          item.height
        ),
        width: item.width,
        height: item.height,

        color: rgb(
          1,
          1,
          1
        ),

        opacity: 1,

        borderWidth: 0,
      });
    }

    /*
     * =========================
     * LINE
     * =========================
     */
    else if (
      item.type === "line"
    ) {
      if (
        !isValidNumber(item.x) ||
        !isValidNumber(item.y) ||
        !isValidNumber(item.endX) ||
        !isValidNumber(item.endY)
      ) {
        continue;
      }

      page.drawLine({
        start: {
          x: item.x,
          y: pdfY(
            pageHeight,
            item.y
          ),
        },

        end: {
          x: item.endX,
          y: pdfY(
            pageHeight,
            item.endY
          ),
        },

        thickness:
          item.thickness ?? 2,

        color:
          getPdfColor(
            item.color ?? {
              r: 0.08,
              g: 0.08,
              b: 0.08,
            }
          ),
      });
    }

    /*
     * =========================
     * IMAGE
     * =========================
     */
    else if (
      item.type === "image"
    ) {
      if (
        !isValidRect(
          item.x,
          item.y,
          item.width,
          item.height
        )
      ) {
        continue;
      }

      if (!item.dataUrl) {
        continue;
      }

      let image =
        imageCache.get(
          item.dataUrl
        );

      if (!image) {
        const bytes =
          dataUrlToBytes(
            item.dataUrl
          );

        const lowerDataUrl =
          item.dataUrl
            .toLowerCase();

        if (
          lowerDataUrl.startsWith(
            "data:image/png"
          )
        ) {
          image =
            await pdfDoc.embedPng(
              bytes
            );
        } else if (
          lowerDataUrl.startsWith(
            "data:image/jpeg"
          ) ||
          lowerDataUrl.startsWith(
            "data:image/jpg"
          )
        ) {
          image =
            await pdfDoc.embedJpg(
              bytes
            );
        } else {
          throw new Error(
            "Unsupported image format. Please use PNG or JPG."
          );
        }

        imageCache.set(
          item.dataUrl,
          image
        );
      }

      page.drawImage(image, {
        x: item.x,

        y: pdfY(
          pageHeight,
          item.y,
          item.height
        ),

        width: item.width,

        height: item.height,
      });
    }
  }

  const outputBytes =
    await pdfDoc.save();

  const blobBytes =
    new ArrayBuffer(outputBytes.byteLength);
  new Uint8Array(blobBytes).set(outputBytes);

  return new Blob(
    [blobBytes],
    {
      type: "application/pdf",
    }
  );
}