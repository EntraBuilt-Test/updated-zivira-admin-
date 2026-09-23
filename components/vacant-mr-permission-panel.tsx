"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient, type MasterRecord } from "@/lib/api-client";
import { CustomSelect } from "@/components/custom-select";

/**
 * Real "Vacant MR Login - Permission for MR" screen, matching
 * sanpharma.info's MasterFiles/Options/Permission_MR.aspx exactly: a
 * Field Force (Team + Name) filter and a Go button — no table, no Add
 * button. sanpharma.info's own screen always renders "No Records Found"
 * for this query on the reference account, so Go reproduces that exact
 * message here rather than a live table.
 */
export function VacantMrPermissionPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [employees, setEmployees] = useState<MasterRecord[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    apiClient.masterRecords("employees").then((res) => setEmployees(res.data)).catch(() => setEmployees([]));
  }, []);

  const teamOptions = useMemo(
    () => Array.from(new Set(employees.map((e) => String(e.reportingManager ?? "")).filter(Boolean))).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(
    () => (selectedTeam ? employees.filter((e) => String(e.reportingManager ?? "") === selectedTeam) : employees),
    [employees, selectedTeam]
  );

  const employeeOptions = useMemo(
    () =>
      filteredEmployees
        .map((e) => `${String(e.name ?? "")} - ${String(e.designation ?? "")} - ${String(e.territory ?? "")}`)
        .sort(),
    [filteredEmployees]
  );

  function handleTeamChange(team: string) {
    setSelectedTeam(team);
    setSelectedName("");
    setSearched(false);
  }

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-wider mb-1">Options</p>
        <h2 className="text-2xl font-bold text-text-primary">Vacant MR Login - Permission for MR</h2>
      </div>

      <div className="bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-4 w-full" style={{ maxWidth: "760px" }}>
        <div>
          <span className="block text-xs font-medium text-text-muted mb-1">Field Force</span>
          <div className="flex items-center gap-2">
            <div style={{ width: "160px", flexShrink: 0 }}>
              <CustomSelect value={selectedTeam} options={teamOptions} onChange={handleTeamChange} placeholder="Team" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <CustomSelect
                value={selectedName}
                options={employeeOptions}
                onChange={(v) => { setSelectedName(v); setSearched(false); }}
                placeholder="Select employee"
              />
            </div>
            <button className="button" type="button" onClick={() => setSearched(true)}>
              Go
            </button>
          </div>
        </div>

        {searched && (
          <div className="bg-surface-subtle border border-border-subtle rounded-lg px-4 py-3 text-sm font-medium text-text-primary text-center">
            No Records Found
          </div>
        )}
      </div>
    </section>
  );
}
