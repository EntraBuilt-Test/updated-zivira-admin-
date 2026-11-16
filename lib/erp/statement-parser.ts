// Phase 2 ERP -- distributor "Stock & Sales" statement reader.
//
// Distributors send their monthly stock-and-sales statement as a PDF (or
// Excel) printed by their own billing software, so every distributor's
// layout is different. The reader turns the text of a statement into
// lines (one per product) with the same columns as Zivira's "Secondary
// Sales Compilation" sheet. It works on plain text lines, so the same code
// handles PDF text (pdf.js), Excel rows (joined with spaces) and tests.
//
// Known layouts (Nov 2026 samples from Zivira):
//   QTY4      OPENING RECEIPT ISSUE CLOSING                    (Oriental, Meerut)
//   MARG11    OPENING PURCHASE FREE P.RETURN FREE SALE FREE
//             S.RETURN FREE OTHERS CLOSING                     (Abhishek, Meerut)
//   QTYVAL8   OPENING qty/value, RECEIVE qty/value, ISSUE
//             qty/value, [CLOSING qty/value]                   (Premier, Ghaziabad)
//   QTYVAL9   OPENING q/v RECEIPT q/v ISSUE q/v CLOSING q/v DUMP (Garg, Meerut)
//   TOTAL9    OPENING PURCHASES S.RETURN OTHERS TOTAL SALES
//             P.RETURN OTHERS CLOSING                          (JMV, Modinagar)
// Anything else falls back to QTY4 when a line ends with 4 numbers.

export type StatementFormat = "QTY4" | "MARG11" | "QTYVAL8" | "QTYVAL9" | "TOTAL9";

export type StatementLine = {
  rawName: string;
  pack: string;
  opening: number;
  primary: number;        // receipt / purchase from Zivira (stockist's inward)
  primaryFree: number;
  purchaseReturn: number; // stockist returned to Zivira
  secondary: number;      // stockist's sale / issue to the market
  secondaryFree: number;
  salesReturn: number;    // market returned to stockist
  closing: number;
  secondaryValue: number | null; // value printed on the statement, if any
};

export type ParsedStatement = {
  format: StatementFormat | null;
  stockistName: string;
  gstin: string;
  place: string;
  periodFrom: string; // YYYY-MM-DD
  periodTo: string;
  month: string;      // YYYY-MM
  lines: StatementLine[];
  warnings: string[];
};

const NUM = /^-?\d+(?:\.\d+)?$/;
const isNumTok = (t: string) => t === "-" || NUM.test(t);
const val = (t: string | undefined) => (!t || t === "-" ? 0 : Number(t));

const SKIP = /^(TOTAL|GRAND|ZIVIRA$|ZIVIRA LABS|COMPANY|PAGE|ITEM|PRODUCT|-{3,}|={3,}|\(\d)/i;

export function detectFormat(text: string): StatementFormat | null {
  const t = text.toUpperCase().replace(/\s+/g, " ");
  if (/S\.?\s?RETURN/.test(t) && /P\.?\s?RETURN/.test(t) && /FREE/.test(t)) return "MARG11";
  if (/TOTAL STOCK|5=1\+2\+3\+4|COMPANY CODE/.test(t)) return "TOTAL9";
  if (/DUMP/.test(t) && /VALUE/.test(t)) return "QTYVAL9";
  if (/RECEIVE/.test(t) && /VALUE/.test(t)) return "QTYVAL8";
  if (/OPENING/.test(t) && /RECEIPT|PURCHASE/.test(t) && /ISSUE|SALE/.test(t) && /CLOSING/.test(t)) return "QTY4";
  return null;
}

const NEED: Record<StatementFormat, number[]> = {
  QTY4: [4], MARG11: [11], QTYVAL8: [8, 6], QTYVAL9: [9], TOTAL9: [9]
};

function toLine(fmt: StatementFormat, n: string[], name: string, pack: string): StatementLine {
  const base = { rawName: name, pack, opening: 0, primary: 0, primaryFree: 0, purchaseReturn: 0, secondary: 0, secondaryFree: 0, salesReturn: 0, closing: 0, secondaryValue: null as number | null };
  switch (fmt) {
    case "QTY4":
      return { ...base, opening: val(n[0]), primary: val(n[1]), secondary: val(n[2]), closing: val(n[3]) };
    case "MARG11":
      return { ...base, opening: val(n[0]), primary: val(n[1]), primaryFree: val(n[2]), purchaseReturn: val(n[3]) + val(n[4]),
        secondary: val(n[5]), secondaryFree: val(n[6]), salesReturn: val(n[7]) + val(n[8]), closing: val(n[10]) };
    case "QTYVAL8": {
      const opening = val(n[0]), primary = val(n[2]), secondary = val(n[4]);
      const closing = n.length >= 8 ? val(n[6]) : opening + primary - secondary;
      return { ...base, opening, primary, secondary, closing, secondaryValue: val(n[5]) };
    }
    case "QTYVAL9":
      return { ...base, opening: val(n[0]), primary: val(n[2]), secondary: val(n[4]), closing: val(n[6]), secondaryValue: val(n[5]) };
    case "TOTAL9":
      // col 4 "OTHERS" is extra inward stock (transfer / scheme), so it counts with purchases.
      return { ...base, opening: val(n[0]), primary: val(n[1]) + val(n[3]), salesReturn: val(n[2]), secondary: val(n[5]), purchaseReturn: val(n[6]), closing: val(n[8]) };
  }
}

const PACK = /^(\d+(\.\d+)?\s?(ML|GM|G|MG|TAB|TABS|CAP|CAPS|PC|PCS|PEC|S|'S|`S)\.?|\d+[X*]\d+.*|\d+[X*]|1\s?PAC|\d+PCS|\d+TAB|\d+CAP|PCS|NOS|TAB|CAP)$/i;

function splitName(tokens: string[]): { name: string; pack: string } {
  const words = [...tokens];
  if (words.length && /^\d{4,}$/.test(words[0])) words.shift(); // item code (JMV)
  const packParts: string[] = [];
  while (words.length > 1 && (PACK.test(words[words.length - 1]) || /^\d+(\.\d+)?$/.test(words[words.length - 1]))) {
    packParts.unshift(words.pop() as string);
  }
  return { name: words.join(" ").replace(/\.+$/, "").trim(), pack: packParts.filter((p) => !/^(PCS|NOS)$/i.test(p)).join(" ") };
}

const MONTHS: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

function normDate(d: string): string {
  let m = d.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; }
  m = d.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (m) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${MONTHS[m[2].toUpperCase()] ?? "01"}-${m[1].padStart(2, "0")}`; }
  return "";
}

export function parseStatement(lines: string[]): ParsedStatement {
  const clean = lines.map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const all = clean.join("\n");
  const warnings: string[] = [];
  const format = detectFormat(all);

  const stockistName = (clean.find((l) => /[A-Z]{3,}/.test(l) && !/^(STOCK|COMPANY|FROM|PAGE|ITEM)/i.test(l)) ?? "").replace(/\s*Page\s*\d+.*$/i, "").trim();
  const gstin = (all.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]\b/) ?? [""])[0];
  const addr = clean[1] ?? "";
  const placeGuess = (addr.split(/[,.]/).map((s) => s.trim()).filter((s) => /^[A-Z][A-Z .-]{2,}$/i.test(s) && !/\d/.test(s) && !/MARKET|FLOOR|BAZAR|NAGAR$|ROAD|OPP|BANK|MALL|BASTI|PHONE|E-MAIL/i.test(s)).pop() ?? "").replace(/[-\s]*UDYAM.*$/i, "").trim();

  const dates = all.match(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b|\b\d{1,2}-[A-Za-z]{3}-\d{2,4}\b/g) ?? [];
  const periodFrom = dates[0] ? normDate(dates[0]) : "";
  const periodTo = dates[1] ? normDate(dates[1]) : periodFrom;
  const month = (periodTo || periodFrom).slice(0, 7);
  if (!month) warnings.push("Statement month not found - please pick it.");
  if (!format) warnings.push("Layout not recognised - read as Opening / Receipt / Issue / Closing.");
  const fmt: StatementFormat = format ?? "QTY4";

  const out: StatementLine[] = [];
  for (const l of clean) {
    if (SKIP.test(l)) continue;
    const toks = l.split(" ");
    let i = toks.length;
    while (i > 0 && isNumTok(toks[i - 1])) i--;
    const nums = toks.slice(i);
    const need = NEED[fmt];
    const take = need.find((k) => nums.length >= k);
    if (!take) continue;
    const head = toks.slice(0, toks.length - take);
    if (!head.some((t) => /[A-Za-z]{3,}/.test(t))) continue;
    const { name, pack } = splitName(head);
    if (!name || /^(TOTAL|VALUE)/i.test(name)) continue;
    out.push(toLine(fmt, toks.slice(toks.length - take), name, pack));
  }
  if (!out.length) warnings.push("No product lines found.");
  return { format, stockistName, gstin, place: placeGuess, periodFrom, periodTo, month, lines: out, warnings };
}
