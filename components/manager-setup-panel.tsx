"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  SectionCard,
  FieldRow,
  YesNoRadio,
  TextField,
  SelectField,
  DcrMatrixTable,
  emptyDcrMatrix,
  TourPlanSetupTable,
  emptyTourPlanTable,
  type DcrMatrix,
  type DcrMatrixRow,
  type DcrMatrixColumn,
  type TourPlanTable
} from "@/components/admin-setup-shared";

const CONFIG_KIND = "managerSetup";
const MANAGER_DESIGNATIONS = ["BH", "RBM", "ABM", "ZBM", "BRM", "NBM", "Sr ABM", "MH", "SM"] as const;

type ManagerSettings = {
  planSetup: { planType: string; planningDays: string; planApproval: string };
  dcrSetup: { dcrEditableDays: string; dcrSubmissionType: string; allowBackdatedDcr: string };
  dcrApprovalSystem: { approvalRequired: string; approvalLevels: string; autoApproveAfterDays: string };
  dcrDelayedSystem: { delayedAfterDays: string; delayedAction: string };
  dcrEntrySetup: { entryMode: string; maxCallsPerDay: string; mandatoryRemarks: string };
  doctorSetup: { doctorApprovalRequired: string; doctorCategoryMandatory: string };
  chemistsSetup: { chemistApprovalRequired: string; chemistCategoryMandatory: string };
  stockistsSetup: { stockistApprovalRequired: string };
  dcrAutoPost: { autoPostEnabled: string; autoPostTime: string };
  dcrBasedOnTp: { restrictToTpEntities: string };
  tourPlanSetup: { tourPlanBasedSystem: string; table: TourPlanTable };
  additionalSetup: { entryMode: DcrMatrix; displayMode: DcrMatrix; designation: string };
};

function emptySettings(): ManagerSettings {
  return {
    planSetup: { planType: "", planningDays: "", planApproval: "No" },
    dcrSetup: { dcrEditableDays: "", dcrSubmissionType: "", allowBackdatedDcr: "No" },
    dcrApprovalSystem: { approvalRequired: "No", approvalLevels: "", autoApproveAfterDays: "" },
    dcrDelayedSystem: { delayedAfterDays: "", delayedAction: "" },
    dcrEntrySetup: { entryMode: "", maxCallsPerDay: "", mandatoryRemarks: "No" },
    doctorSetup: { doctorApprovalRequired: "No", doctorCategoryMandatory: "No" },
    chemistsSetup: { chemistApprovalRequired: "No", chemistCategoryMandatory: "No" },
    stockistsSetup: { stockistApprovalRequired: "No" },
    dcrAutoPost: { autoPostEnabled: "No", autoPostTime: "" },
    dcrBasedOnTp: { restrictToTpEntities: "No" },
    tourPlanSetup: { tourPlanBasedSystem: "Designation Wise", table: emptyTourPlanTable(MANAGER_DESIGNATIONS) },
    additionalSetup: { entryMode: emptyDcrMatrix(), displayMode: emptyDcrMatrix(), designation: "" }
  };
}

function mergeSettings(loaded: unknown): ManagerSettings {
  const base = emptySettings();
  if (!loaded || typeof loaded !== "object") return base;
  const l = loaded as Partial<ManagerSettings>;
  return {
    planSetup: { ...base.planSetup, ...(l.planSetup ?? {}) },
    dcrSetup: { ...base.dcrSetup, ...(l.dcrSetup ?? {}) },
    dcrApprovalSystem: { ...base.dcrApprovalSystem, ...(l.dcrApprovalSystem ?? {}) },
    dcrDelayedSystem: { ...base.dcrDelayedSystem, ...(l.dcrDelayedSystem ?? {}) },
    dcrEntrySetup: { ...base.dcrEntrySetup, ...(l.dcrEntrySetup ?? {}) },
    doctorSetup: { ...base.doctorSetup, ...(l.doctorSetup ?? {}) },
    chemistsSetup: { ...base.chemistsSetup, ...(l.chemistsSetup ?? {}) },
    stockistsSetup: { ...base.stockistsSetup, ...(l.stockistsSetup ?? {}) },
    dcrAutoPost: { ...base.dcrAutoPost, ...(l.dcrAutoPost ?? {}) },
    dcrBasedOnTp: { ...base.dcrBasedOnTp, ...(l.dcrBasedOnTp ?? {}) },
    tourPlanSetup: {
      tourPlanBasedSystem: l.tourPlanSetup?.tourPlanBasedSystem ?? base.tourPlanSetup.tourPlanBasedSystem,
      table: { ...base.tourPlanSetup.table, ...(l.tourPlanSetup?.table ?? {}) }
    },
    additionalSetup: {
      entryMode: { ...base.additionalSetup.entryMode, ...(l.additionalSetup?.entryMode ?? {}) },
      displayMode: { ...base.additionalSetup.displayMode, ...(l.additionalSetup?.displayMode ?? {}) },
      designation: l.additionalSetup?.designation ?? ""
    }
  };
}

// Matches sanpharma.info's Basic Setup >> Manager Setup screen: the same
// single long configuration form (no table, no "Add" button) covering
// Plan Setup, DCR Setup, DCR Approval System, DCR Delayed System, DCR -
// Entry Setup, Doctor Setup, Chemists Setup, Stockists Setup, DCR Auto
// Post, DCR Based on TP, Tour Plan Setup (BE / Sr BE start/end day-of-month
// + a Tour Plan Based System choice + per-designation Approval Needed),
// and Additional Setup's DCR Entry Mode / Display Mode matrices, ending in
// a single Save / Clear pair. Persisted as one JSON blob via
// CompanyConfigModel under adminSettings:baseLevelSetup (getAdminSetting /
// saveAdminSetting), matching every other single-document admin screen in
// this app rather than forcing it into the generic masters list shape.
// Tour Plan Setup here is keyed by manager designations (BH / RBM / ABM /
// ZBM / BRM / NBM / Sr ABM / MH / SM) instead of field-force designations.
export function ManagerSetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [settings, setSettings] = useState<ManagerSettings>(emptySettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .getAdminSetting(CONFIG_KIND)
      .then((res) => {
        if (!cancelled) setSettings(mergeSettings(res.data));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load Manager Setup");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const managerDesignations = useMemo(() => MANAGER_DESIGNATIONS, []);

  function patch<K extends keyof ManagerSettings>(section: K, values: Partial<ManagerSettings[K]>) {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...values } }));
  }

  function toggleMatrix(kind: "entryMode" | "displayMode", row: DcrMatrixRow, col: DcrMatrixColumn) {
    setSettings((prev) => ({
      ...prev,
      additionalSetup: {
        ...prev.additionalSetup,
        [kind]: {
          ...prev.additionalSetup[kind],
          [row]: { ...prev.additionalSetup[kind][row], [col]: !prev.additionalSetup[kind][row][col] }
        }
      }
    }));
  }

  function setTourPlanRow(designation: string, rowPatch: Partial<TourPlanTable[string]>) {
    setSettings((prev) => ({
      ...prev,
      tourPlanSetup: {
        ...prev.tourPlanSetup,
        table: { ...prev.tourPlanSetup.table, [designation]: { ...prev.tourPlanSetup.table[designation], ...rowPatch } }
      }
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting(CONFIG_KIND, settings);
      setNotice("Manager Setup saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Manager Setup");
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    setSettings(emptySettings());
    setNotice(null);
    setError(null);
  }

  if (loading) return <div className="card p-4 text-sm">Loading Manager Setup...</div>;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Manager Setup</h2>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      <SectionCard title="Plan Setup">
        <FieldRow label="Plan Type">
          <SelectField
            value={settings.planSetup.planType}
            onChange={(v) => patch("planSetup", { planType: v })}
            options={["Monthly", "Weekly", "Fortnightly"]}
          />
        </FieldRow>
        <FieldRow label="Planning Days (before month start)">
          <TextField value={settings.planSetup.planningDays} onChange={(v) => patch("planSetup", { planningDays: v })} type="number" />
        </FieldRow>
        <FieldRow label="Plan Approval Required">
          <YesNoRadio name="planApproval" value={settings.planSetup.planApproval} onChange={(v) => patch("planSetup", { planApproval: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="DCR Setup">
        <FieldRow label="DCR Editable For (days)">
          <TextField value={settings.dcrSetup.dcrEditableDays} onChange={(v) => patch("dcrSetup", { dcrEditableDays: v })} type="number" />
        </FieldRow>
        <FieldRow label="DCR Submission Type">
          <SelectField
            value={settings.dcrSetup.dcrSubmissionType}
            onChange={(v) => patch("dcrSetup", { dcrSubmissionType: v })}
            options={["Daily", "Tour Plan Based"]}
          />
        </FieldRow>
        <FieldRow label="Allow Backdated DCR">
          <YesNoRadio name="allowBackdatedDcr" value={settings.dcrSetup.allowBackdatedDcr} onChange={(v) => patch("dcrSetup", { allowBackdatedDcr: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="DCR Approval System">
        <FieldRow label="Approval Required">
          <YesNoRadio name="dcrApprovalRequired" value={settings.dcrApprovalSystem.approvalRequired} onChange={(v) => patch("dcrApprovalSystem", { approvalRequired: v })} />
        </FieldRow>
        <FieldRow label="Approval Levels">
          <TextField value={settings.dcrApprovalSystem.approvalLevels} onChange={(v) => patch("dcrApprovalSystem", { approvalLevels: v })} type="number" />
        </FieldRow>
        <FieldRow label="Auto-Approve After (days)">
          <TextField value={settings.dcrApprovalSystem.autoApproveAfterDays} onChange={(v) => patch("dcrApprovalSystem", { autoApproveAfterDays: v })} type="number" />
        </FieldRow>
      </SectionCard>

      <SectionCard title="DCR Delayed System">
        <FieldRow label="Mark Delayed After (days)">
          <TextField value={settings.dcrDelayedSystem.delayedAfterDays} onChange={(v) => patch("dcrDelayedSystem", { delayedAfterDays: v })} type="number" />
        </FieldRow>
        <FieldRow label="Delayed Action">
          <SelectField
            value={settings.dcrDelayedSystem.delayedAction}
            onChange={(v) => patch("dcrDelayedSystem", { delayedAction: v })}
            options={["Notify Manager", "Block New Entry", "None"]}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="DCR - Entry Setup">
        <FieldRow label="Entry Mode">
          <SelectField
            value={settings.dcrEntrySetup.entryMode}
            onChange={(v) => patch("dcrEntrySetup", { entryMode: v })}
            options={["Web", "Mobile", "Both"]}
          />
        </FieldRow>
        <FieldRow label="Max Calls Per Day">
          <TextField value={settings.dcrEntrySetup.maxCallsPerDay} onChange={(v) => patch("dcrEntrySetup", { maxCallsPerDay: v })} type="number" />
        </FieldRow>
        <FieldRow label="Mandatory Remarks">
          <YesNoRadio name="mandatoryRemarks" value={settings.dcrEntrySetup.mandatoryRemarks} onChange={(v) => patch("dcrEntrySetup", { mandatoryRemarks: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Doctor Setup">
        <FieldRow label="Doctor Addition Approval Required">
          <YesNoRadio name="doctorApprovalRequired" value={settings.doctorSetup.doctorApprovalRequired} onChange={(v) => patch("doctorSetup", { doctorApprovalRequired: v })} />
        </FieldRow>
        <FieldRow label="Doctor Category Mandatory">
          <YesNoRadio name="doctorCategoryMandatory" value={settings.doctorSetup.doctorCategoryMandatory} onChange={(v) => patch("doctorSetup", { doctorCategoryMandatory: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Chemists Setup">
        <FieldRow label="Chemist Addition Approval Required">
          <YesNoRadio name="chemistApprovalRequired" value={settings.chemistsSetup.chemistApprovalRequired} onChange={(v) => patch("chemistsSetup", { chemistApprovalRequired: v })} />
        </FieldRow>
        <FieldRow label="Chemist Category Mandatory">
          <YesNoRadio name="chemistCategoryMandatory" value={settings.chemistsSetup.chemistCategoryMandatory} onChange={(v) => patch("chemistsSetup", { chemistCategoryMandatory: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Stockists Setup">
        <FieldRow label="Stockist Addition Approval Required">
          <YesNoRadio name="stockistApprovalRequired" value={settings.stockistsSetup.stockistApprovalRequired} onChange={(v) => patch("stockistsSetup", { stockistApprovalRequired: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="DCR Auto Post">
        <FieldRow label="Auto Post Enabled">
          <YesNoRadio name="autoPostEnabled" value={settings.dcrAutoPost.autoPostEnabled} onChange={(v) => patch("dcrAutoPost", { autoPostEnabled: v })} />
        </FieldRow>
        <FieldRow label="Auto Post Time">
          <TextField value={settings.dcrAutoPost.autoPostTime} onChange={(v) => patch("dcrAutoPost", { autoPostTime: v })} type="time" />
        </FieldRow>
      </SectionCard>

      <SectionCard title="DCR Based on TP">
        <FieldRow label="Restrict DCR to Planned Entities Only">
          <YesNoRadio name="restrictToTpEntities" value={settings.dcrBasedOnTp.restrictToTpEntities} onChange={(v) => patch("dcrBasedOnTp", { restrictToTpEntities: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Tour Plan Setup">
        <FieldRow label="Tour Plan Based System">
          <SelectField
            value={settings.tourPlanSetup.tourPlanBasedSystem}
            onChange={(v) => patch("tourPlanSetup", { tourPlanBasedSystem: v })}
            options={["Designation Wise", "Common For All"]}
          />
        </FieldRow>
        <TourPlanSetupTable
          designations={managerDesignations}
          table={settings.tourPlanSetup.table}
          onChange={setTourPlanRow}
        />
      </SectionCard>

      <SectionCard title="Additional Setup (Baselevel & Managers)">
        <FieldRow label="Designation">
          <SelectField
            value={settings.additionalSetup.designation}
            onChange={(v) =>
              setSettings((prev) => ({ ...prev, additionalSetup: { ...prev.additionalSetup, designation: v } }))
            }
            options={[...MANAGER_DESIGNATIONS]}
          />
        </FieldRow>
        <DcrMatrixTable title="DCR SETUP - Entry Mode" matrix={settings.additionalSetup.entryMode} onToggle={(row, col) => toggleMatrix("entryMode", row, col)} />
        <DcrMatrixTable title="DCR SETUP - Display Mode" matrix={settings.additionalSetup.displayMode} onToggle={(row, col) => toggleMatrix("displayMode", row, col)} />
      </SectionCard>

      <div className="flex gap-3">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="btn btn-secondary" onClick={clear} disabled={saving}>
          Clear
        </button>
      </div>
    </div>
  );
}
