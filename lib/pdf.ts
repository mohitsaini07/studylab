import { PDFParse } from "pdf-parse";
export async function extractPdfText(buffer: ArrayBuffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = result.text.replace(/\u0000/g, "").trim();
    if (text.length < 100)
      throw new Error(
        "This PDF contains too little extractable text. Scanned image-only PDFs need OCR before upload.",
      );
    return { text, pageCount: result.total };
  } finally {
    await parser.destroy();
  }
}
