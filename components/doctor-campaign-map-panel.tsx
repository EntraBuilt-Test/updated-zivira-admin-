"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";
import { GenericMasterTable } from "@/components/generic-master-table";

// Matches sanpharma.info's Doctor - Campaign Map ("Listed Doctor Campaign
// - Map") filter bar: an MR dropdown and a "Filter By" dropdown (Doctor
// Speciality / Category / Qualification / Class / Name / Territory), with
// either a value dropdown (categorical fields) or a free-text box (Doctor
// Name) next to it, and Go applying the filter. Every option here is
// backed by a real field already on this master or a real joined master
// (doctorMaster / doctorClassification) — nothing fabricated.
type FilterField = "speciality" | "category" | "qualification" | "classField" | "doctorName" | "territory";

const FILTER_OPTIONS: { label: string; field: FilterField | "ALL" }[] = [
  { label: "ALL", field: "ALL" },
  { label: "Doctor Speciality", field: "speciality" },
  { label: "Doctor Category", field: "category" },
  { label: "Doctor Qualification", field: "qualification" },
  { label: "Doctor Class", field: "classField" },
  { label: "Doctor Name", field: "doctorName" },
  { label: "Doctor Territory", field: "territory" }
];

export function DoctorCampaignMapPanel({ masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [doctorMasterRows, setDoctorMasterRows] = useState<MasterRecord[]>([]);
  const [doctorClassRows, setDoctorClassRows] = useState<MasterRecord[]>([]);
  const [campaignRows, setCampaignRows] = useState<MasterRecord[]>([]);

  const [selectedMrCode, setSelectedMrCode] = useState("");
  const [filterByLabel, setFilterByLabel] = useState("ALL");
  const [filterValue, setFilterValue] = useState("");
  const [appliedMrCode, setAppliedMrCode] = useState("");
  const [appliedFilterField, setAppliedFilterField] = useState<FilterField | "ALL">("ALL");
  const [appliedFilterValue, setAppliedFilterValue] = useState("");

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
    apiClient.masterRecords("doctorMaster").then((res) => setDoctorMasterRows(res.data)).catch(() => setDoctorMasterRows([]));
    apiClient.masterRecords("doctorClassification").then((res) => setDoctorClassRows(res.data)).catch(() => setDoctorClassRows([]));
    apiClient.masterRecords(masterKey).then((res) => setCampaignRows(res.data)).catch(() => setCampaignRows([]));
  }, [masterKey]);

  const mrOptions = useMemo(
    () => [...employees].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""))),
    [employees]
  );

  const selectedFilterField = FILTER_OPTIONS.find((f) => f.label === filterByLabel)?.field ?? "ALL";

  // Distinct values for whichever categorical field is chosen, resolved
  // from the real joined master — Doctor Name gets a free-text box
  // instead, since sanpharma.info's own screen does the same.
  const valueOptions = useMemo(() => {
    if (selectedFilterField === "speciality") {
      return Array.from(new Set(doctorMasterRows.map((r) => String(r.specialty ?? "")).filter(Boolean))).sort();
    }
    if (selectedFilterField === "qualification") {
      return Array.from(new Set(doctorMasterRows.map((r) => String(r.qualification ?? "")).filter(Boolean))).sort();
    }
    if (selectedFilterField === "category") {
      return Array.from(new Set(doctorClassRows.map((r) => String(r.doctorCategory ?? "")).filter(Boolean))).sort();
    }
    if (selectedFilterField === "classField") {
      return Array.from(new Set(doctorClassRows.map((r) => String(r.potential ?? "")).filter(Boolean))).sort();
    }
    if (selectedFilterField === "territory") {
      return Array.from(new Set(campaignRows.map((r) => String(r.territory ?? "")).filter(Boolean))).sort();
    }
    return [];
  }, [selectedFilterField, doctorMasterRows, doctorClassRows, campaignRows]);

  function handleFilterByChange(label: string) {
    setFilterByLabel(label);
    setFilterValue("");
  }

  function go() {
    setAppliedMrCode(selectedMrCode);
    setAppliedFilterField(selectedFilterField);
    setAppliedFilterValue(filterValue);
  }

  // Employee.territory is actually stored HQ-formatted ("Mumbai HQ",
  // "Chennai HQ", ...) — the same values doctorCampaignMap's own `hq`
  // field resolves to (see registry.ts: hq -> territoryHqMaster ->
  // headquartersName). Doctor - Campaign Map's raw `territory` field is a
  // different vocabulary entirely ("Territory 1", "Territory 2", ...), so
  // matching MR-selection against THAT field can never find a real row —
  // matching against `hq` is the actual, honest join between an MR and
  // the doctors mapped under their HQ.
  const mrHq = employees.find((e) => e.employeeCode === appliedMrCode)?.territory;

  const extraFilters = useMemo(() => {
    const filters: { field: string; value: string; mode?: "exact" | "contains" }[] = [];
    if (appliedMrCode && mrHq) {
      filters.push({ field: "hq", value: String(mrHq), mode: "exact" });
    }
    if (appliedFilterField !== "ALL" && appliedFilterValue) {
      filters.push({
        field: appliedFilterField,
        value: appliedFilterValue,
        mode: appliedFilterField === "doctorName" ? "contains" : "exact"
      });
    }
    return filters;
  }, [appliedMrCode, mrHq, appliedFilterField, appliedFilterValue]);

  return (
    <section className="flex flex-col gap-4 w-full">
      <div className="bg-surface-card p-4 rounded-xl border border-border-subtle shadow-sm flex flex-wrap items-end gap-3">
        <div style={{ minWidth: "220px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">MR</span>
          <CustomSelect
            value={selectedMrCode ? `${employees.find((e) => e.employeeCode === selectedMrCode)?.name ?? ""} - ${employees.find((e) => e.employeeCode === selectedMrCode)?.designation ?? ""} - ${employees.find((e) => e.employeeCode === selectedMrCode)?.territory ?? ""}` : ""}
            options={mrOptions.map((e) => `${e.name} - ${e.designation} - ${e.territory}`)}
            onChange={(v) => {
              const match = mrOptions.find((e) => `${e.name} - ${e.designation} - ${e.territory}` === v);
              setSelectedMrCode(match ? String(match.employeeCode ?? "") : "");
            }}
            placeholder="All MRs"
          />
        </div>

        <div style={{ minWidth: "180px" }}>
          <span className="block text-xs font-medium text-text-muted mb-1">Filter By</span>
          <CustomSelect
            value={filterByLabel}
            options={FILTER_OPTIONS.map((f) => f.label)}
            onChange={handleFilterByChange}
          />
        </div>

        {selectedFilterField !== "ALL" && (
          <div style={{ minWidth: "220px" }}>
            <span className="block text-xs font-medium text-text-muted mb-1">Value</span>
            {selectedFilterField === "doctorName" ? (
              <input
                type="text"
                className="input"
                style={{ width: "100%" }}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Type a doctor name"
              />
            ) : (
              <CustomSelect value={filterValue} options={valueOptions} onChange={setFilterValue} placeholder="Select" />
            )}
          </div>
        )}

        <button className="button" type="button" onClick={go}>
          Go
        </button>
      </div>

      <GenericMasterTable masterKey={masterKey} extraFilters={extraFilters} />
    </section>
  );
}
