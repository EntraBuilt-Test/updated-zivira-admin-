"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  SectionBox,
  FieldRow,
  YesNoRadio,
  TextField,
  SelectField,
  DcrMatrixTable,
  emptyDcrMatrix,
  emptyDcrMatrixDesignations,
  TourPlanSetupTable,
  emptyTourPlanTable,
  type DcrMatrix,
  type DcrMatrixDesignations,
  type TourPlanTable
} from "@/components/admin-setup-shared";

const CONFIG_KIND = "managerSetup";

const WORKING_AREA_OPTIONS = ["Territory", "Clusters", "Patches", "Hospital", "Work Area"] as const;
const DOCTOR_LISTING_DISPLAY_OPTIONS = ["None", "SVL No", "Speciality", "Category", "Class", "Campaign"] as const;
const MANAGER_DESIGNATIONS = ["BH", "RBM", "ABM", "ZBM", "BRM", "NBM", "Sr ABM", "MH", "SM"] as const;
const DESIGNATION_MULTISELECT_OPTIONS = [
  "ALL", "ABM", "BE", "BH", "BRM", "MH", "NBM", "RBM", "Sr BE", "ZBM", "Sr ABM", "SM"
] as const;

// Matches sanpharma.info's Basic Setup >> Manager Setup screen
// (AdminSetupMGR.aspx) exactly: same section layout as Base Level Setup,
// EXCEPT Plan Setup has no "Doctor with Multiple Plan(s) Allowed" field (it
// starts directly at Working Area Name), the Doctors listing display radio
// includes an extra "Campaign" option, and the Tour Plan Setup table is
// keyed by the 9 manager designations (BH/RBM/ABM/ZBM/BRM/NBM/Sr ABM/MH/SM)
// instead of BE/Sr BE. Persisted via CompanyConfigModel the same way as the
// other single-document admin screens in this app.
type ManagerSettings = {
  workingAreaName: string;
  noOfTerritorySelectionInTp: string;

  noOfListedDoctorsAllowedForDcrEntry: string;
  noOfUnlistedDoctorsAllowedForDcrEntry: string;
  doctorsListingDisplayInDcrEntry: string;
  displayPatchwiseDoctorsInDcr: string;
  selectionInDcrListedDoctorMandatory: string;

  dcrApprovalNeeded: string;

  dcrDelayedSystem: string;
  weekOffHolidayCalculatedInDelayed: string;
  noOfDaysAllowedForDelay: string;

  dcrAutoPostHoliday: string;
  dcrAutoPostWeekOff: string;

  tpBasedDcr: string;
  tpBasedDcrWithDeviationReason: string;
  tpBasedDcrWithManagerApprovalNeeded: string;

  noOfListedDoctorsAllowedForEntryInMaster: string;
  noOfUnlistedDoctorsAllowedForEntryInMaster: string;
  listedDoctorApprovalNeeded: string;
  deactivationApprovalNeeded: string;
  addAgainstDeactApprovalNeeded: string;
  productTagPrioritywiseNeeded: string;

  noOfChemistsAllowedForEntry: string;
  noOfStockistsAllowedForEntry: string;

  tourPlan: TourPlanTable;
  tourPlanBasedSystem: string;

  entryMode: DcrMatrix;
  entryModeDesignations: DcrMatrixDesignations;
  displayMode: DcrMatrix;
  displayModeDesignations: DcrMatrixDesignations;
};

function emptySettings(): ManagerSettings {
  return {
    workingAreaName: "",
    noOfTerritorySelectionInTp: "",

    noOfListedDoctorsAllowedForDcrEntry: "",
    noOfUnlistedDoctorsAllowedForDcrEntry: "",
    doctorsListingDisplayInDcrEntry: "",
    displayPatchwiseDoctorsInDcr: "No",
    selectionInDcrListedDoctorMandatory: "No",

    dcrApprovalNeeded: "No",

    dcrDelayedSystem: "No",
    weekOffHolidayCalculatedInDelayed: "No",
    noOfDaysAllowedForDelay: "",

    dcrAutoPostHoliday: "No",
    dcrAutoPostWeekOff: "No",

    tpBasedDcr: "No",
    tpBasedDcrWithDeviationReason: "No",
    tpBasedDcrWithManagerApprovalNeeded: "No",

    noOfListedDoctorsAllowedForEntryInMaster: "",
    noOfUnlistedDoctorsAllowedForEntryInMaster: "",
    listedDoctorApprovalNeeded: "No",
    deactivationApprovalNeeded: "No",
    addAgainstDeactApprovalNeeded: "No",
    productTagPrioritywiseNeeded: "No",

    noOfChemistsAllowedForEntry: "",
    noOfStockistsAllowedForEntry: "",

    tourPlan: emptyTourPlanTable(MANAGER_DESIGNATIONS),
    tourPlanBasedSystem: "Tour Plan Based System (Approval Mandatory)",

    entryMode: emptyDcrMatrix(),
    entryModeDesignations: emptyDcrMatrixDesignations(),
    displayMode: emptyDcrMatrix(),
    displayModeDesignations: emptyDcrMatrixDesignations()
  };
}

function mergeSettings(loaded: unknown): ManagerSettings {
  const base = emptySettings();
  if (!loaded || typeof loaded !== "object") return base;
  return { ...base, ...(loaded as Partial<ManagerSettings>) };
}

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

  function set<K extends keyof ManagerSettings>(key: K, value: ManagerSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
  }

  if (loading) return <div className="card p-4 text-sm">Loading Manager Setup...</div>;

  return (
    <div className="space-y-3">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Manager Setup</h2>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      <SectionBox title="Plan Setup">
        <FieldRow label="Working Area Name">
          <SelectField value={settings.workingAreaName} onChange={(v) => set("workingAreaName", v)} options={WORKING_AREA_OPTIONS} />
        </FieldRow>
        <FieldRow label="No of Territory Selection in TP">
          <TextField value={settings.noOfTerritorySelectionInTp} onChange={(v) => set("noOfTerritorySelectionInTp", v)} type="number" />
        </FieldRow>
      </SectionBox>

      <SectionBox title="DCR Setup">
        <FieldRow label="No. of Listed Doctors Allowed For DCR Entry">
          <TextField value={settings.noOfListedDoctorsAllowedForDcrEntry} onChange={(v) => set("noOfListedDoctorsAllowedForDcrEntry", v)} type="number" />
        </FieldRow>
        <FieldRow label="No. of Unlisted Doctors Allowed For DCR Entry">
          <TextField value={settings.noOfUnlistedDoctorsAllowedForDcrEntry} onChange={(v) => set("noOfUnlistedDoctorsAllowedForDcrEntry", v)} type="number" />
        </FieldRow>
        <FieldRow label="Doctors listing display in DCR Entry">
          <YesNoRadio
            name="doctorsListingDisplayInDcrEntry"
            value={settings.doctorsListingDisplayInDcrEntry}
            onChange={(v) => set("doctorsListingDisplayInDcrEntry", v)}
            options={DOCTOR_LISTING_DISPLAY_OPTIONS}
          />
        </FieldRow>
        <FieldRow label="Display Patchwise Doctors in DCR">
          <YesNoRadio name="displayPatchwiseDoctorsInDcr" value={settings.displayPatchwiseDoctorsInDcr} onChange={(v) => set("displayPatchwiseDoctorsInDcr", v)} />
        </FieldRow>
        <FieldRow label="Selection in DCR - Listed Doctor as Mandatory">
          <YesNoRadio name="selectionInDcrListedDoctorMandatory" value={settings.selectionInDcrListedDoctorMandatory} onChange={(v) => set("selectionInDcrListedDoctorMandatory", v)} />
        </FieldRow>
      </SectionBox>

      <SectionBox title="DCR Approval System">
        <FieldRow label="DCR Approval Needed">
          <YesNoRadio name="dcrApprovalNeeded" value={settings.dcrApprovalNeeded} onChange={(v) => set("dcrApprovalNeeded", v)} />
        </FieldRow>
      </SectionBox>

      <SectionBox title="DCR Delayed System">
        <FieldRow label="DCR Delayed System">
          <YesNoRadio name="dcrDelayedSystem" value={settings.dcrDelayedSystem} onChange={(v) => set("dcrDelayedSystem", v)} />
        </FieldRow>
        <FieldRow label="Week Off/Holiday Calculated in Delayed">
          <YesNoRadio name="weekOffHolidayCalculatedInDelayed" value={settings.weekOffHolidayCalculatedInDelayed} onChange={(v) => set("weekOffHolidayCalculatedInDelayed", v)} />
        </FieldRow>
        <FieldRow label="No. of Days Allowed for Delay">
          <TextField value={settings.noOfDaysAllowedForDelay} onChange={(v) => set("noOfDaysAllowedForDelay", v)} type="number" />
        </FieldRow>
      </SectionBox>

      <SectionBox title="DCR Auto Post">
        <FieldRow label="Holiday">
          <YesNoRadio name="dcrAutoPostHoliday" value={settings.dcrAutoPostHoliday} onChange={(v) => set("dcrAutoPostHoliday", v)} />
        </FieldRow>
        <FieldRow label="Week Off">
          <YesNoRadio name="dcrAutoPostWeekOff" value={settings.dcrAutoPostWeekOff} onChange={(v) => set("dcrAutoPostWeekOff", v)} />
        </FieldRow>
      </SectionBox>

      <SectionBox title="DCR Based on TP">
        <FieldRow label="TP Based DCR">
          <YesNoRadio name="tpBasedDcr" value={settings.tpBasedDcr} onChange={(v) => set("tpBasedDcr", v)} />
        </FieldRow>
        <FieldRow label="TP Based DCR with Deviation Reason">
          <YesNoRadio name="tpBasedDcrWithDeviationReason" value={settings.tpBasedDcrWithDeviationReason} onChange={(v) => set("tpBasedDcrWithDeviationReason", v)} />
        </FieldRow>
        <FieldRow label="TP Based DCR with Manager Approval Needed">
          <YesNoRadio name="tpBasedDcrWithManagerApprovalNeeded" value={settings.tpBasedDcrWithManagerApprovalNeeded} onChange={(v) => set("tpBasedDcrWithManagerApprovalNeeded", v)} />
        </FieldRow>
      </SectionBox>

      <SectionBox title="Doctor Setup">
        <FieldRow label="No. of Listed Doctors Allowed For Entry in Master">
          <TextField value={settings.noOfListedDoctorsAllowedForEntryInMaster} onChange={(v) => set("noOfListedDoctorsAllowedForEntryInMaster", v)} type="number" />
        </FieldRow>
        <FieldRow label="No. of Unlisted Doctors Allowed For Entry in Master">
          <TextField value={settings.noOfUnlistedDoctorsAllowedForEntryInMaster} onChange={(v) => set("noOfUnlistedDoctorsAllowedForEntryInMaster", v)} type="number" />
        </FieldRow>
        <FieldRow label="Listed Doctor Approval Needed">
          <YesNoRadio name="listedDoctorApprovalNeeded" value={settings.listedDoctorApprovalNeeded} onChange={(v) => set("listedDoctorApprovalNeeded", v)} />
        </FieldRow>
        <FieldRow label="Deactivation Approval Needed">
          <YesNoRadio name="deactivationApprovalNeeded" value={settings.deactivationApprovalNeeded} onChange={(v) => set("deactivationApprovalNeeded", v)} />
        </FieldRow>
        <FieldRow label="Add Against Deactivation Approval Needed">
          <YesNoRadio name="addAgainstDeactApprovalNeeded" value={settings.addAgainstDeactApprovalNeeded} onChange={(v) => set("addAgainstDeactApprovalNeeded", v)} />
        </FieldRow>
        <FieldRow label="Product Tag Prioritywise Needed">
          <YesNoRadio name="productTagPrioritywiseNeeded" value={settings.productTagPrioritywiseNeeded} onChange={(v) => set("productTagPrioritywiseNeeded", v)} />
        </FieldRow>
      </SectionBox>

      <SectionBox title="Chemists Setup">
        <FieldRow label="No. of Chemists Allowed For Entry">
          <TextField value={settings.noOfChemistsAllowedForEntry} onChange={(v) => set("noOfChemistsAllowedForEntry", v)} type="number" />
        </FieldRow>
      </SectionBox>

      <SectionBox title="Stockists Setup">
        <FieldRow label="No. of Stockists Allowed For Entry">
          <TextField value={settings.noOfStockistsAllowedForEntry} onChange={(v) => set("noOfStockistsAllowedForEntry", v)} type="number" />
        </FieldRow>
      </SectionBox>

      <SectionBox title="Tour Plan Setup">
        <TourPlanSetupTable
          designations={MANAGER_DESIGNATIONS}
          table={settings.tourPlan}
          onChange={(d, patch) => set("tourPlan", { ...settings.tourPlan, [d]: { ...settings.tourPlan[d], ...patch } })}
        />
      </SectionBox>

      <SectionBox title="Tour Plan">
        <FieldRow label="">
          <YesNoRadio
            name="tourPlanBasedSystem"
            value={settings.tourPlanBasedSystem}
            onChange={(v) => set("tourPlanBasedSystem", v)}
            options={["Tour Plan Based System (Approval Mandatory)", "Without Tour Plan Based System"]}
          />
        </FieldRow>
      </SectionBox>

      <SectionBox title="Additional Setup (Baselevel & Managers)">
        <div className="space-y-4">
          <DcrMatrixTable
            title="DCR SETUP - Entry Mode"
            matrix={settings.entryMode}
            onToggle={(row, col) =>
              set("entryMode", { ...settings.entryMode, [row]: { ...settings.entryMode[row], [col]: !settings.entryMode[row][col] } })
            }
            rowDesignations={settings.entryModeDesignations}
            onDesignationChange={(row, d) => set("entryModeDesignations", { ...settings.entryModeDesignations, [row]: d })}
            designationOptions={DESIGNATION_MULTISELECT_OPTIONS}
          />
          <DcrMatrixTable
            title="DCR SETUP - Display Mode"
            matrix={settings.displayMode}
            onToggle={(row, col) =>
              set("displayMode", { ...settings.displayMode, [row]: { ...settings.displayMode[row], [col]: !settings.displayMode[row][col] } })
            }
            rowDesignations={settings.displayModeDesignations}
            onDesignationChange={(row, d) => set("displayModeDesignations", { ...settings.displayModeDesignations, [row]: d })}
            designationOptions={DESIGNATION_MULTISELECT_OPTIONS}
          />
        </div>
      </SectionBox>

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          style={{
            border: "1px solid #1d4ed8",
            borderRadius: 6,
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            padding: "8px 24px",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={clear}
          disabled={saving}
          style={{
            border: "1px solid #94a3b8",
            borderRadius: 6,
            background: "#fff",
            color: "#111827",
            fontWeight: 600,
            padding: "8px 24px",
            cursor: saving ? "default" : "pointer"
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
