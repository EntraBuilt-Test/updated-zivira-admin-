"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, ProductBrand } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";
import { AlertModal } from "@/components/alert-modal";

// Matches sanpharma.info's MasterFiles/Options/DD_Slide_Upload.aspx
// ("Slide_Upload_-_E-Detailing") exactly: three sub-tabs (Upload / View /
// Priority), all controls centered, with progressive field reveal on
// Upload, a Division/Sub Division/Brand-only View that pops a sanpharma-
// style "Alert! No Records Found!" popup instead of an inline table, and a
// Priority tab whose second dropdown only appears for Product/Speciality/
// Therapy (never for Brand) and which shows the same Alert popup whenever
// nothing has actually been prioritised yet.
const MASTER_KEY = "slideUploadEDetailing";
const DIVISION_NAME = "Zivira Labs Pvt Ltd";

const SPECIALITY_OPTIONS = [
  "CMS", "CP", "CRS", "CTRCT", "ECC", "GENPHY", "GLAUCO", "GLS", "IOL", "LSK", "MSO",
  "NEURO", "OCLP", "OPT", "OPTO", "ORBIT", "PEDOPT", "PG", "PGCRS", "PGOPT", "PGR",
  "PHACO", "PSUR", "RES", "RETINA", "SPL", "SUR", "UVE"
];
const THERAPY_OPTIONS = ["AA", "AG", "AI", "AIC", "AO", "INFLM", "TS", "WIPES"];

type SubTab = "upload" | "view" | "priority";
type PriorityType = "Brand" | "Product" | "Speciality" | "Therapy";

// ProductBrand rows carry a real `division` field on the server (it stores
// the sub division a brand belongs to) even though the shared frontend type
// doesn't declare it — used here, read-only, to cascade Brand from the
// chosen Sub Division with real data instead of a hand-written map.
function brandsForSubDivision(allBrands: ProductBrand[], subDivision: string): string[] {
  if (!subDivision) return dedupeSorted(allBrands.map((b) => b.brandName));
  const scoped = allBrands.filter(
    (b) => (b as unknown as { division?: string | null }).division === subDivision
  );
  const list = scoped.length > 0 ? scoped : allBrands;
  return dedupeSorted(list.map((b) => b.brandName));
}

function dedupeSorted(items: (string | null | undefined)[]): string[] {
  return Array.from(new Set(items.filter((v): v is string => Boolean(v)))).sort((a, b) =>
    a.localeCompare(b)
  );
}

// The Subdivision master stores ten specific groups ("Aura ENT", "Astra
// Pain Care", "Zivira Ophthalmology", ...), but Slide Upload's Sub Division
// filter — like ProductBrand.division / Employee.division elsewhere in the
// app — only ever takes the three root division names. Taking each
// subdivisionName's first word and de-duplicating gives exactly those
// three (Astra / Aura / Zivira) instead of the full ten-entry list, and
// crucially makes this value match ProductBrand.division exactly so Brand
// (and Product) really do cascade instead of silently falling back to the
// unfiltered list.
function rootDivisions(rawSubdivisionNames: string[]): string[] {
  return dedupeSorted(rawSubdivisionNames.map((s) => s.trim().split(/\s+/)[0]));
}

export function SlideUploadEDetailingPanel() {
  const [tab, setTab] = useState<SubTab>("upload");
  const [subDivisions, setSubDivisions] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<ProductBrand[]>([]);

  useEffect(() => {
    apiClient
      .subdivisions()
      .then((r) => setSubDivisions(rootDivisions(r.data.map((s) => s.subdivisionName))))
      .catch(() => {});
    apiClient
      .productBrands()
      .then((r) => setAllBrands(r.data))
      .catch(() => {});
  }, []);

  return (
    <section className="subdivision-console">
      <div className="subdivision-head" style={{ textAlign: "center", justifyContent: "center" }}>
        <div>
          <p className="subdivision-eyebrow">Options &gt; Upload</p>
          <h2>Slide Upload - E-Detailing</h2>
          <p>Upload, view and set the display priority of E-Detailing slides, by Division / Sub Division / Brand.</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
        {(["upload", "view", "priority"] as SubTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`button ${tab === t ? "" : "button-secondary"}`}
            onClick={() => setTab(t)}
            style={{ textTransform: "capitalize", minWidth: 96 }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {tab === "upload" && <UploadTab subDivisions={subDivisions} allBrands={allBrands} />}
          {tab === "view" && <ViewTab subDivisions={subDivisions} allBrands={allBrands} />}
          {tab === "priority" && <PriorityTab subDivisions={subDivisions} allBrands={allBrands} />}
        </div>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", width: "100%" }}>
      <span style={{ width: 130, textAlign: "right", fontWeight: 600, fontSize: 14 }}>{label}</span>
      {children}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--border)",
  padding: "8px 12px",
  textAlign: "left",
  fontSize: 13,
  color: "var(--muted)"
};
const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--border)",
  padding: "8px 12px",
  fontSize: 14
};

// ── Upload tab ──────────────────────────────────────────────────────────
// Progressive reveal matching sanpharma.info: Sub Division + Brand first;
// once both are chosen, Product/Speciality/Therapy appear, and the file
// uploader appears alongside them (matching the reference screenshot, which
// shows the uploader while Product/Speciality/Therapy are still "Nothing
// selected") — the final Start Upload sends everything filled in so far.
function UploadTab({ subDivisions, allBrands }: { subDivisions: string[]; allBrands: ProductBrand[] }) {
  const [subDivision, setSubDivision] = useState("");
  const [brand, setBrand] = useState("");
  const [product, setProduct] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [therapy, setTherapy] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const brandOptions = useMemo(() => brandsForSubDivision(allBrands, subDivision), [allBrands, subDivision]);

  useEffect(() => {
    setBrand("");
    setProduct("");
  }, [subDivision]);

  useEffect(() => {
    if (!subDivision) {
      setProducts([]);
      return;
    }
    apiClient
      .productCatalogByDivision(subDivision)
      .then((r) => setProducts(dedupeSorted(r.data.map((p) => p.productName))))
      .catch(() => setProducts([]));
  }, [subDivision]);

  const readyForExtras = Boolean(subDivision && brand);

  async function handleUpload() {
    if (!file) {
      setAlertMsg("Please choose a file first.");
      return;
    }
    setBusy(true);
    try {
      await apiClient.uploadMasterFile(MASTER_KEY, file, {
        division: DIVISION_NAME,
        subDivision,
        brand,
        product,
        speciality,
        therapy
      });
      setAlertMsg("Slide uploaded successfully.");
      setFile(null);
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <Row label="Division">
        <input className="input" value={DIVISION_NAME} disabled style={{ width: 260, textAlign: "center" }} />
      </Row>
      <Row label="Sub Division">
        <CustomSelect
          value={subDivision}
          options={subDivisions}
          onChange={setSubDivision}
          placeholder="---Select---"
          style={{ width: 260 }}
        />
      </Row>
      <Row label="Brand">
        <CustomSelect
          value={brand}
          options={brandOptions}
          onChange={setBrand}
          placeholder="---Select---"
          style={{ width: 260 }}
        />
      </Row>

      {readyForExtras && (
        <>
          <Row label="Product">
            <CustomSelect
              value={product}
              options={products}
              onChange={setProduct}
              placeholder="Nothing selected"
              style={{ width: 260 }}
            />
          </Row>
          <Row label="Speciality">
            <CustomSelect
              value={speciality}
              options={SPECIALITY_OPTIONS}
              onChange={setSpeciality}
              placeholder="Nothing selected"
              style={{ width: 260 }}
            />
          </Row>
          <Row label="Therapy">
            <CustomSelect
              value={therapy}
              options={THERAPY_OPTIONS}
              onChange={setTherapy}
              placeholder="Nothing selected"
              style={{ width: 260 }}
            />
          </Row>

          <div style={{ width: "100%", maxWidth: 520, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ background: "#374151", color: "#fff", padding: "10px 16px" }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Select files</div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                Add files to the upload queue and click the start button.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 600,
                borderBottom: "1px solid var(--border)",
                color: "var(--muted)"
              }}
            >
              <span style={{ flex: 1 }}>Filename</span>
              <span style={{ width: 80 }}>Size</span>
              <span style={{ width: 80 }}>Status</span>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 120,
                cursor: "pointer",
                color: "var(--muted)",
                fontSize: 14,
                background: "var(--panel)"
              }}
            >
              {file ? file.name : "Drag files here."}
              <input type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 16px",
                borderTop: "1px solid var(--border)"
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <label className="button button-secondary" style={{ cursor: "pointer", margin: 0 }}>
                  + Add Files
                  <input type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <button type="button" className="button" disabled={!file || busy} onClick={handleUpload}>
                  {busy ? "Uploading..." : "⬆ Start Upload"}
                </button>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {file ? `${Math.max(1, Math.round(file.size / 1024))} KB` : "0 b"} &middot; 0%
              </div>
            </div>
          </div>
        </>
      )}

      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg(null)} />}
    </div>
  );
}

// ── View tab ────────────────────────────────────────────────────────────
// Division/Sub Division/Brand + Go only — no results table. A real lookup
// runs on Go; when nothing matches (the normal case with no data uploaded
// yet) the sanpharma-style "Alert! No Records Found!" popup is shown.
function ViewTab({ subDivisions, allBrands }: { subDivisions: string[]; allBrands: ProductBrand[] }) {
  const [subDivision, setSubDivision] = useState("");
  const [brand, setBrand] = useState("");
  const [busy, setBusy] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const brandOptions = useMemo(() => brandsForSubDivision(allBrands, subDivision), [allBrands, subDivision]);

  useEffect(() => {
    setBrand("");
  }, [subDivision]);

  async function handleGo() {
    setBusy(true);
    try {
      const res = await apiClient.masterRecords(MASTER_KEY);
      const matches = res.data.filter((r) => {
        const okSub = !subDivision || r.subDivision === subDivision;
        const okBrand = !brand || r.brand === brand;
        return okSub && okBrand;
      });
      setAlertMsg(matches.length === 0 ? "No Records Found!" : `${matches.length} record(s) found.`);
    } catch {
      setAlertMsg("No Records Found!");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <Row label="Division">
        <input className="input" value={DIVISION_NAME} disabled style={{ width: 260, textAlign: "center" }} />
      </Row>
      <Row label="Sub Division">
        <CustomSelect
          value={subDivision}
          options={subDivisions}
          onChange={setSubDivision}
          placeholder="---Select---"
          style={{ width: 260 }}
        />
      </Row>
      <Row label="Brand">
        <CustomSelect
          value={brand}
          options={brandOptions}
          onChange={setBrand}
          placeholder="---Select---"
          style={{ width: 260 }}
        />
      </Row>
      <button type="button" className="button" disabled={busy} onClick={handleGo} style={{ width: 120 }}>
        {busy ? "..." : "Go"}
      </button>

      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg(null)} />}
    </div>
  );
}

// ── Priority tab ────────────────────────────────────────────────────────
// Brand mode shows only Sub Division + Go; Product/Speciality/Therapy modes
// show Sub Division + a second, type-specific dropdown + Go. Telling
// "explicitly saved priority" apart from "never touched, still at its
// default index" needs no backend change: when every returned item still
// sits at its default priority (array index + 1) the list is treated as
// empty and shown with the same Alert popup; anything else renders the
// real, editable priority list.
function PriorityTab({ subDivisions, allBrands }: { subDivisions: string[]; allBrands: ProductBrand[] }) {
  void allBrands;
  const [type, setType] = useState<PriorityType>("Brand");
  const [subDivision, setSubDivision] = useState("");
  const [product, setProduct] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [therapy, setTherapy] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [results, setResults] = useState<{ item: string; priority: number }[] | null>(null);

  useEffect(() => {
    setResults(null);
    setProduct("");
    setSpeciality("");
    setTherapy("");
  }, [type, subDivision]);

  useEffect(() => {
    if (type !== "Product" || !subDivision) {
      setProducts([]);
      return;
    }
    apiClient
      .productCatalogByDivision(subDivision)
      .then((r) => setProducts(dedupeSorted(r.data.map((p) => p.productName))))
      .catch(() => setProducts([]));
  }, [type, subDivision]);

  const secondValue = type === "Product" ? product : type === "Speciality" ? speciality : type === "Therapy" ? therapy : "";
  const secondOptions = type === "Product" ? products : type === "Speciality" ? SPECIALITY_OPTIONS : type === "Therapy" ? THERAPY_OPTIONS : [];
  const setSecondValue = type === "Product" ? setProduct : type === "Speciality" ? setSpeciality : type === "Therapy" ? setTherapy : () => {};

  const canGo = Boolean(subDivision) && (type === "Brand" || Boolean(secondValue));

  async function handleGo() {
    if (!canGo) return;
    setBusy(true);
    setResults(null);
    try {
      const res = await apiClient.slidePriorityList(type, subDivision);
      const list = res.data ?? [];
      const allDefault = list.length === 0 || list.every((r, i) => r.priority === i + 1);
      if (allDefault) {
        setAlertMsg("No Records Found!");
      } else {
        setResults(list);
      }
    } catch {
      setAlertMsg("No Records Found!");
    } finally {
      setBusy(false);
    }
  }

  async function saveOne(item: string, priority: number) {
    try {
      await apiClient.saveSlidePriority({ type, subDivision, item, priority });
      setResults((prev) => (prev ? prev.map((r) => (r.item === item ? { ...r, priority } : r)) : prev));
    } catch {
      // best-effort; leave the displayed value as typed
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontWeight: 600 }}>Update Priority for:</span>
        {(["Brand", "Product", "Speciality", "Therapy"] as PriorityType[]).map((t) => (
          <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
            <input type="radio" name="priorityType" checked={type === t} onChange={() => setType(t)} />
            {t}
          </label>
        ))}
      </div>

      <Row label="Sub Division">
        <CustomSelect
          value={subDivision}
          options={subDivisions}
          onChange={setSubDivision}
          placeholder="---Select---"
          style={{ width: 260 }}
        />
      </Row>

      {type !== "Brand" && (
        <Row label={type}>
          <CustomSelect
            value={secondValue}
            options={secondOptions}
            onChange={setSecondValue}
            placeholder="---Select---"
            style={{ width: 260 }}
          />
        </Row>
      )}

      <button type="button" className="button" disabled={busy || !canGo} onClick={handleGo} style={{ width: 120 }}>
        {busy ? "..." : "Go"}
      </button>

      {results && (
        <table style={{ width: "100%", maxWidth: 440, borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr>
              <th style={thStyle}>{type}</th>
              <th style={thStyle}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.item}>
                <td style={tdStyle}>{r.item}</td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    className="input"
                    defaultValue={r.priority}
                    style={{ width: 80, textAlign: "center" }}
                    onBlur={(e) => {
                      const next = Number(e.target.value);
                      if (Number.isFinite(next) && next > 0) saveOne(r.item, next);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg(null)} />}
    </div>
  );
}
