"use client";

import { Check, Pencil, Plus, RotateCcw, SlidersHorizontal, Trash2, Ban, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format-date";
import { PageHeader } from "@/components/page-components";

type AdditionalInfoRow = {
  id: string;
  doctorName: string;
  dob: string;
  anniversaryDate: string;
  remarks: string;
  // New request item 1 — "must be having the new text tab name as
  // Address. while entering the address it must be locate to the exact
  // location using the map and capture the pic of the map." `address` is
  // what the user types; `latitude`/`longitude` are auto-filled by
  // geocoding that address (free, no API key — OpenStreetMap's Nominatim
  // service); `mapImage` is a captured picture of that map location,
  // stored as a data URL (free, no API key — a static-map render of the
  // same OpenStreetMap data, fetched once and embedded so it keeps
  // working even if the map service is ever unreachable later).
  address: string;
  latitude: string;
  longitude: string;
  mapImage: string;
};

const initialInfos: AdditionalInfoRow[] = [];

// Free, keyless geocoding — turns the typed address into a lat/lon via
// OpenStreetMap's public Nominatim search endpoint.
async function geocodeAddress(address: string): Promise<{ lat: string; lon: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) return null;
  return { lat: results[0].lat, lon: results[0].lon };
}

// Free, keyless static-map picture — renders a pin at the geocoded
// location using the community staticmap.openstreetmap.de service (no
// API key), then re-encodes it as a data URL so the captured picture is
// self-contained (saved with the record, not just a link that could
// later 404 or change).
async function captureMapImage(lat: string, lon: string): Promise<string | null> {
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=16&size=600x360&markers=${lat},${lon},red-pushpin`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function InfoForm({ row, onSave, onBack }: { row: any; onSave: (r: AdditionalInfoRow) => void; onBack: () => void }) {
  const [form, setForm] = useState<AdditionalInfoRow>({
    id: row.id ?? "",
    doctorName: row.doctorName ?? "",
    dob: row.dob ?? "",
    anniversaryDate: row.anniversaryDate ?? "",
    remarks: row.remarks ?? "",
    address: row.address ?? "",
    latitude: row.latitude ?? "",
    longitude: row.longitude ?? "",
    mapImage: row.mapImage ?? ""
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  async function handleLocate() {
    if (!form.address.trim()) {
      setLocateError("Enter an address first.");
      return;
    }
    setIsLocating(true);
    setLocateError("");
    try {
      const geo = await geocodeAddress(form.address.trim());
      if (!geo) {
        setLocateError("Could not find that address on the map. Try adding more detail (city, state).");
        return;
      }
      const image = await captureMapImage(geo.lat, geo.lon);
      setForm((f) => ({ ...f, latitude: geo.lat, longitude: geo.lon, mapImage: image ?? f.mapImage }));
      if (!image) setLocateError("Location found, but capturing the map picture failed — you can retry.");
    } catch {
      setLocateError("Could not reach the map service. Check your connection and retry.");
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <section className="subdivision-console">
      <PageHeader
  eyebrow="Master Setup"
  title="Additional Information"
  description="Create and manage doctor personal detail milestones."
  action={
    <>
<button className="button" onClick={() => setView("add")} type="button">Add Information</button>
    </>
  }
/>

      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "360px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            outline: "none"
          }}
        />
      </div>

      <div className="subdivision-table-card" style={{ overflowX: "auto" }}>
        <table className="subdivision-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>DOB</th>
              <th>Anniversary Date</th>
              <th>Remarks</th>
              <th>Address</th>
              <th>Map</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                 <td><strong style={{ color: "var(--ink)" }}>{row.doctorName}</strong></td>
                 <td>{formatDate(row.dob)}</td>
                 <td>{formatDate(row.anniversaryDate)}</td>
                 <td>{row.remarks}</td>
                 <td>{row.address}</td>
                 <td>
                   {row.mapImage ? (
                     <img src={row.mapImage} alt={`Map for ${row.doctorName}`} style={{ width: "72px", height: "48px", objectFit: "cover", borderRadius: "4px", border: "1px solid #e5e7eb" }} />
                   ) : (
                     <span style={{ color: "var(--muted)" }}>—</span>
                   )}
                 </td>
                 <td>{row.latitude}</td>
                 <td>{row.longitude}</td>
                <td>
                  <button className="subdivision-icon-button" onClick={() => { setEditTarget(row); setView("edit"); }} type="button">
                    <Pencil size={15} />
                  </button>
                </td>
                <td>
                  <button className="subdivision-danger-button" onClick={() => handleDeactivate(row.id)} type="button">
                    <Ban />
                  </button>
                </td>
              </tr>
            ))}
             {filtered.length === 0 && (
               <tr>
                 <td colSpan={10} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>
                   No records found
                 </td>
               </tr>
             )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
