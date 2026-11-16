// Phase 2 ERP -- turn an uploaded statement file into plain text lines.
// PDF: pdf.js (loaded from its CDN when first needed, so the build needs no
// extra package); rows are rebuilt from text positions. Excel / CSV: the
// existing `xlsx` package; empty cells inside a row become "-" (zero) so
// columns keep their order.
import * as XLSX from "xlsx";

const PDFJS_VERSION = "4.10.38";
const PDFJS_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;
const PDFJS_WORKER = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

type TextItem = { str: string; transform: number[] };
type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: unknown[] }> }> }> };
};

let pdfjsPromise: Promise<PdfJs> | null = null;
function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    const url = PDFJS_URL;
    pdfjsPromise = import(/* webpackIgnore: true */ url).then((m: unknown) => {
      const lib = m as PdfJs;
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return lib;
    });
  }
  return pdfjsPromise;
}

async function pdfLines(buf: ArrayBuffer): Promise<string[]> {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const out: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items = (content.items as TextItem[]).filter((i) => typeof i.str === "string" && i.str.trim() !== "");
    // Group items on (nearly) the same baseline into one row.
    const rows: { y: number; parts: { x: number; s: string }[] }[] = [];
    for (const it of items) {
      const x = it.transform[4], y = it.transform[5];
      let row = rows.find((r) => Math.abs(r.y - y) <= 2.5);
      if (!row) { row = { y, parts: [] }; rows.push(row); }
      row.parts.push({ x, s: it.str.trim() });
    }
    rows.sort((a, b) => b.y - a.y);
    for (const r of rows) out.push(r.parts.sort((a, b) => a.x - b.x).map((p2) => p2.s).join(" "));
  }
  return out;
}

function sheetLines(buf: ArrayBuffer): string[] {
  const wb = XLSX.read(buf, { type: "array" });
  const out: string[] = [];
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, blankrows: false, defval: "" });
    for (const row of rows) {
      const cells = row.map((c) => String(c ?? "").trim());
      let first = cells.findIndex((c) => c !== ""), last = cells.length - 1;
      while (last >= 0 && cells[last] === "") last--;
      if (first < 0) continue;
      out.push(cells.slice(first, last + 1).map((c) => (c === "" ? "-" : c.replace(/\s+/g, " "))).join(" "));
    }
  }
  return out;
}

export async function readStatementFile(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer();
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") return pdfLines(buf);
  if (/\.(xlsx|xls|csv)$/i.test(file.name)) return sheetLines(buf);
  if (/\.txt$/i.test(file.name)) return new TextDecoder().decode(buf).split(/\r?\n/);
  throw new Error("Please upload a PDF, Excel (.xlsx/.xls) or CSV statement.");
}
