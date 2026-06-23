import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";

type PdfParseModule = typeof import("pdf-parse");

function installPdfCanvasGlobals() {
  const target = globalThis as Record<string, unknown>;

  target.DOMMatrix ??= DOMMatrix;
  target.ImageData ??= ImageData;
  target.Path2D ??= Path2D;
}

export async function extractPdfText(buffer: ArrayBuffer) {
  installPdfCanvasGlobals();

  const { PDFParse }: PdfParseModule = await import("pdf-parse");
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useWorkerFetch: false,
  });

  try {
    const result = await parser.getText();
    const text = result.text.replace(/\u0000/g, "").trim();

    if (text.length < 100) {
      throw new Error(
        "This PDF contains too little extractable text. Scanned image-only PDFs need OCR before upload.",
      );
    }

    return { text, pageCount: result.total };
  } finally {
    await parser.destroy();
  }
}
