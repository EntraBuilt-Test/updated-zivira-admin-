// Round 41 Gap D -- one shared REAL .xlsx exporter (exceljs) for every report
// popup / report screen. Callers hand it a DOM container; it builds a
// structured table model (headers with colspan/rowspan, per-cell fill colours,
// bold, numbers as numbers) and writes a genuine Office Open XML workbook.
// modelToWorkbook() is DOM-free so it can be unit tested in Node.

import type { Workbook as ExcelJSWorkbook } from "exceljs";

export type XCell = {
  text: string;
  num?: number;
  colSpan: number;
  rowSpan: number;
  bg?: string; // RRGGBB
  color?: string; // RRGGBB
  bold: boolean;
  align?: "left" | "center" | "right";
  header: boolean;
};
export type XTable = { title?: string; rows: XCell[][] };
export type TableModel = { tables: XTable[]; sheetName?: string };

const NUM_RE = /^-?(0|[1-9]\d*)(\.\d+)?$/;
const NUM_COMMA_RE = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/;

export function parseNumeric(text: string): number | undefined {
  const t = text.trim();
  if (!t || t.length > 15) return undefined;
  if (NUM_RE.test(t)) return Number(t);
  if (NUM_COMMA_RE.test(t)) return Number(t.replace(/,/g, ""));
  return undefined;
}

let canvasCtx: CanvasRenderingContext2D | null | undefined;
function cssToRgba(css: string): [number, number, number, number] | null {
  if (!css || css === "transparent") return null;
  const m = css.match(/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?\s*\)$/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
  // oklch()/color() etc: let the canvas normalise it.
  try {
    if (canvasCtx === undefined) {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      canvasCtx = c.getContext("2d", { willReadFrequently: true });
    }
    if (!canvasCtx) return null;
    canvasCtx.clearRect(0, 0, 1, 1);
    canvasCtx.fillStyle = "#000";
    canvasCtx.fillStyle = css;
    canvasCtx.fillRect(0, 0, 1, 1);
    const d = canvasCtx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  } catch {
    return null;
  }
}
const hex2 = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
function toFill(css: string): string | undefined {
  const c = cssToRgba(css);
  if (!c || c[3] < 0.05) return undefined;
  if (c[0] > 250 && c[1] > 250 && c[2] > 250) return undefined; // plain white
  return `${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}`;
}
function toFont(css: string): string | undefined {
  const c = cssToRgba(css);
  if (!c || c[3] < 0.05) return undefined;
  if (c[0] < 40 && c[1] < 40 && c[2] < 40) return undefined; // default dark text
  return `${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}`;
}

function titleFor(table: HTMLTableElement): string | undefined {
  const prev = table.previousElementSibling as HTMLElement | null;
  if (!prev || prev.querySelector("table")) return undefined;
  const t = (prev.textContent || "").replace(/\s+/g, " ").trim();
  return t && t.length <= 120 ? t : undefined;
}

export function buildTableModel(root: HTMLElement): TableModel {
  const tables: XTable[] = [];
  root.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.closest("table")) return; // nested: flattened into its cell text
    const rows: XCell[][] = [];
    Array.from(table.rows).forEach((tr) => {
      const row: XCell[] = [];
      Array.from(tr.cells).forEach((cell) => {
        const cs = getComputedStyle(cell);
        const text = (cell.textContent || "").replace(/\s+/g, " ").trim();
        const isHeader = cell.tagName === "TH";
        const align = cs.textAlign === "center" ? "center" : cs.textAlign === "right" || cs.textAlign === "end" ? "right" : "left";
        row.push({
          text,
          num: parseNumeric(text),
          colSpan: Math.max(1, cell.colSpan || 1),
          rowSpan: Math.max(1, cell.rowSpan || 1),
          bg: toFill(cs.backgroundColor) || (tr.nodeType === 1 ? toFill(getComputedStyle(tr).backgroundColor) : undefined),
          color: toFont(cs.color),
          bold: isHeader || parseInt(cs.fontWeight, 10) >= 600,
          align,
          header: isHeader
        });
      });
      rows.push(row);
    });
    if (rows.length) tables.push({ title: titleFor(table), rows });
  });
  return { tables };
}

// Minimal structural typing of the exceljs surface used (keeps this file free
// of a hard type dependency so the DOM-free part runs under tsx in tests).
type ExcelJSLike = { Workbook: new () => ExcelJSWorkbook };

export function modelToWorkbook(ExcelJS: ExcelJSLike, model: TableModel, sheetName = "Report") {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Zivira";
  const ws = wb.addWorksheet(sheetName.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Report");
  const widths: number[] = [];
  let r = 1;
  for (const t of model.tables) {
    if (t.title) {
      const c = ws.getCell(r, 1);
      c.value = t.title;
      c.font = { bold: true, size: 12 };
      r++;
    }
    const occupied = new Set<string>();
    t.rows.forEach((row, ri) => {
      let col = 1;
      for (const cell of row) {
        while (occupied.has(`${ri}:${col}`)) col++;
        const r1 = r + ri;
        const c1 = col;
        const r2 = r1 + cell.rowSpan - 1;
        const c2 = c1 + cell.colSpan - 1;
        for (let rr = 0; rr < cell.rowSpan; rr++) for (let cc = 0; cc < cell.colSpan; cc++) occupied.add(`${ri + rr}:${col + cc}`);
        const target = ws.getCell(r1, c1);
        target.value = cell.num !== undefined ? cell.num : cell.text;
        if (cell.rowSpan > 1 || cell.colSpan > 1) ws.mergeCells(r1, c1, r2, c2);
        target.alignment = { horizontal: cell.header ? "center" : cell.num !== undefined ? "right" : cell.align || "left", vertical: "middle", wrapText: true };
        if (cell.bold || cell.color) target.font = { bold: cell.bold, ...(cell.color ? { color: { argb: `FF${cell.color}` } } : {}) };
        if (cell.bg) target.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${cell.bg}` } };
        // style every cell of a merged block so borders/fill show across it
        for (let rr = r1; rr <= r2; rr++)
          for (let cc = c1; cc <= c2; cc++) {
            const x = ws.getCell(rr, cc);
            x.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            if (cell.bg && !(rr === r1 && cc === c1)) x.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${cell.bg}` } };
          }
        if (cell.colSpan === 1) widths[c1 - 1] = Math.max(widths[c1 - 1] || 8, Math.min(40, cell.text.length + 2));
        col = c2 + 1;
      }
    });
    r += t.rows.length + 1; // blank row between stacked tables
  }
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w || 10; });
  return wb;
}

export async function downloadXlsx(model: TableModel, fileName: string): Promise<void> {
  const ExcelJS = (await import("exceljs")).default as unknown as ExcelJSLike;
  const wb = modelToWorkbook(ExcelJS, model, model.sheetName || fileName.slice(0, 31));
  const buf: ArrayBuffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Returns false when the container holds no table to export.
export async function exportElementToXlsx(root: HTMLElement, fileName: string): Promise<boolean> {
  const model = buildTableModel(root);
  if (model.tables.length === 0) return false;
  await downloadXlsx(model, fileName);
  return true;
}

// Round 45 -- styled replacement for the older plain `XLSX.utils.aoa_to_sheet`
// exports (Coverage Analysis 2, MSIS, Dispatch, generic masters): header row
// with teal fill + bold white text, thin borders, numbers as numbers, optional
// merged group headers. Same exceljs writer as every other report.
const HEAD_FILL = "00796B";
const hcell = (text: string, colSpan = 1, rowSpan = 1): XCell => ({ text, colSpan, rowSpan, bg: HEAD_FILL, color: "FFFFFF", bold: true, align: "center", header: true });
const bcell = (v: string | number | null | undefined): XCell => {
  const text = v === null || v === undefined ? "" : String(v);
  return { text, num: typeof v === "number" ? v : parseNumeric(text), colSpan: 1, rowSpan: 1, bold: false, align: "left", header: false };
};
export type AoaOpts = { sheetName: string; fileName: string; header: string[]; body: (string | number | null | undefined)[][]; groups?: { fixed: number; groups: { label: string; cols: string[] }[] } };
export function aoaModel(opts: AoaOpts): TableModel {
  const rows: XCell[][] = [];
  if (opts.groups) {
    const fixed = opts.header.slice(0, opts.groups.fixed);
    rows.push([...fixed.map((h) => hcell(h, 1, 2)), ...opts.groups.groups.map((g) => hcell(g.label, g.cols.length))]);
    rows.push(opts.groups.groups.flatMap((g) => g.cols.map((c) => hcell(c))));
  } else rows.push(opts.header.map((h) => hcell(h)));
  for (const r of opts.body) rows.push(r.map(bcell));
  return { tables: [{ rows }], sheetName: opts.sheetName };
}
export async function downloadAoaXlsx(opts: AoaOpts): Promise<void> {
  await downloadXlsx(aoaModel(opts), opts.fileName);
}
