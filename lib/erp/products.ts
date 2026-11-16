// Phase 2 ERP -- Zivira product list used to match statement lines.
// Built from the Nov 2026 distributor statements; PTS (price to stockist)
// is filled where Zivira's compilation sheet gave it and is editable in
// ERP > Products & PTS. Zivira to confirm the official list and rates.

export type DefaultProduct = { name: string; pack: string; pts: number | null; match: RegExp };

// Order matters: most specific first.
export const DEFAULT_PRODUCTS: DefaultProduct[] = [
  { name: "BEPIREX", pack: "5ML", pts: 166.18, match: /^BEPIREX/ },
  { name: "BRINZIA", pack: "5ML", pts: null, match: /^BRINZIA/ },
  { name: "BRITIVIN", pack: "5ML", pts: 243.96, match: /^BRITIVIN/ },
  { name: "DEXNOVA", pack: "10ML", pts: null, match: /^DEXNOVA/ },
  { name: "DUCIDROP", pack: "5ML", pts: 108.64, match: /^DUCIDROP/ },
  { name: "DUCIRA GEL", pack: "10GM", pts: 289.93, match: /^DUCIRA/ },
  { name: "ENVISA", pack: "1X10 TAB", pts: null, match: /^ENVISA/ },
  { name: "FOMIRA", pack: "10ML", pts: null, match: /^FOMIRA/ },
  { name: "HYNIZA", pack: "1X10", pts: null, match: /^HYN[IE]Z/ },
  { name: "LATOBEST", pack: "2.5ML", pts: null, match: /^LATOBEST/ },
  { name: "LOTIVIZ", pack: "5ML", pts: null, match: /^LOTIVIZ/ },
  { name: "MACUMER", pack: "1X10 TAB", pts: null, match: /^MACUMER/ },
  { name: "NEPAWEL", pack: "5ML", pts: null, match: /^NEPAWEL/ },
  { name: "PATVIRA", pack: "2.5ML", pts: null, match: /^PATVIRA/ },
  { name: "PREDIRA", pack: "10ML", pts: null, match: /^PREDIRA/ },
  { name: "STRIOS MAX", pack: "1X14", pts: null, match: /^STRIOS MAX/ },
  { name: "STRIOS LID WIPES", pack: "1X24", pts: null, match: /^STRIOS/ },
  { name: "TIMOBEST", pack: "5ML", pts: null, match: /^TIMOBEST/ },
  { name: "TIZTA LIQUIGEL", pack: "10ML", pts: null, match: /^TIZTA LIQUI ?GEL/ },
  { name: "TIZTA 10ML", pack: "10ML", pts: null, match: /^TIZTA.*\b10 ?ML\b/ },
  { name: "TIZTA 5ML", pack: "5ML", pts: null, match: /^TIZTA.*\b5 ?ML\b/ },
  { name: "TOBRAWIN LP", pack: "5ML", pts: null, match: /^TOBRAWIN LP/ },
  { name: "TOBRAWIN", pack: "5ML", pts: null, match: /^TOBRAWIN/ },
  { name: "VITTLES D3", pack: "1X40", pts: null, match: /^VITTLES D3/ },
  { name: "VITTLES JELLY 18%", pack: "1X30", pts: null, match: /^VITTLES JELLY.*(18|30)/ },
  { name: "VITTLES JELLY", pack: "1X12", pts: null, match: /^VITTLES JELLY/ },
  { name: "XIATRA", pack: "3ML", pts: null, match: /^XIATRA/ },
  { name: "ZIVIFRESH GEL", pack: "10ML", pts: null, match: /^ZIVIFRESH GEL/ },
  { name: "ZIVIFRESH", pack: "10ML", pts: null, match: /^ZIVIFRESH/ },
  { name: "ZIVIMOX LP", pack: "5ML", pts: null, match: /^ZIVIMOX LP/ },
  { name: "ZIVIMOX D", pack: "5ML", pts: null, match: /^ZIVIMOX D\b/ },
  { name: "ZIVIMOX", pack: "5ML", pts: null, match: /^ZIVIMOX/ },
  { name: "ZIVIPRED", pack: "10ML", pts: null, match: /^ZIVIPRED/ }
];

/** Normalise a statement product name: drop dosage-form words, dots, dashes. */
export function normaliseProductName(raw: string, pack = ""): string {
  return `${raw} ${pack}`.toUpperCase()
    .replace(/[-_.]/g, " ")
    .replace(/\b(E\/D|ED|EYE|DROPS?|TABLETS?|INJ|WIPES?|GUMM?IES|GUMMES)\b/g, " ")
    .replace(/\s+/g, " ").trim();
}

/** Returns the product name to use, or "" when nothing matches (admin picks). */
export function matchProduct(raw: string, pack: string, names: { name: string; aliases?: string[] }[]): string {
  const n = normaliseProductName(raw, pack);
  const nameOnly = normaliseProductName(raw);
  for (const p of names) if (p.aliases?.some((a) => a.toUpperCase() === raw.toUpperCase().trim())) return p.name;
  for (const d of DEFAULT_PRODUCTS) if (d.match.test(n) || d.match.test(nameOnly)) {
    if (names.some((p) => p.name === d.name)) return d.name;
  }
  const exact = names.find((p) => p.name.toUpperCase() === nameOnly);
  return exact ? exact.name : "";
}
