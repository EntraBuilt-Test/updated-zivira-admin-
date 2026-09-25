"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  TwoColumnBox,
  SubSectionLabel,
  CompactFieldRow,
  NeededRadio,
  YesNoRadio,
  YesNoCheckboxPair,
  TextField,
  SelectField,
  DcrMatrixTable,
  emptyDcrMatrix,
  emptyDcrMatrixDesignations,
  TourPlanSetupTable,
  TourPlanApprovalList,
  emptyTourPlanTable,
  type DcrMatrix,
  type DcrMatrixDesignations,
  type TourPlanTable
} from "@/components/admin-setup-shared";

const CONFIG_KIND = "managerSetup";

const WORKING_AREA_OPTIONS = [
  "Clusters", "Hospital", "Patches", "Permanent Journey Plan", "Route Plan", "Schedule",
  "Std. Daywise Plan", "Std. Tour Plan", "Std. Work Plan", "Sub Area", "Territory", "Work Area"
] as const;
const DOCTOR_LISTING_DISPLAY_OPTIONS = ["None", "SVL No", "Speciality", "Category", "Class", "Campaign"] as const;
const PRODUCTWISE_UPDATION_OPTIONS = ["Rx", "POB", "None"] as const;
const MANAGER_DESIGNATIONS = ["BH", "RBM", "ABM", "ZBM", "BRM", "NBM", "Sr ABM", "MH", "SM"] as const;
const DESIGNATION_MULTISELECT_OPTIONS = [
  "ALL", "ABM", "BE", "BH", "BRM", "MH", "NBM", "RBM", "Sr BE", "ZBM", "Sr ABM", "SM"
] as const;

// Matches sanpharma.info's Basic Setup >> Manager Setup screen
// (AdminSetupMGR.aspx) exactly: the same two-column bordered box layout as
// Base Level Setup, EXCEPT Plan Setup has no "Doctor with Multiple Plan(s)
// Allowed" field (starts directly at Working Area Name), the Doctors
// listing display dropdown includes an extra "Campaign" option, and the
// Tour Plan Setup table/approval list are keyed by the 9 manager
// designations (BH/RBM/ABM/ZBM/BRM/NBM/Sr ABM/MH/SM) instead of BE/Sr BE.
// Persisted via CompanyConfigModel the same way as the other
// single-document admin screens in this app.
type ManagerSettings = {
  workingAreaName: string;
  noOfTerritorySelectionInTp: string;

  noOfListedDoctorsAllowedForDcrEntry: string;
  noOfChemistsAllowedForDcrEntry: string;
  noOfStockistsAllowedForDcrEntry: string;
  noOfUnlistedDoctorsAllowedForDcrEntry: string;
  noOfHospitalsAllowedForDcrEntry: string;
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

  noOfCharactersAllowedForRemarks: string;
  maximumProductSelectionAllowedForDcrEntry: string;
  noOfProductsSelectionMandatoryForDcrEntry: string;
  isSessionMandatoryInDcrEntry: string;
  isTimeMandatoryInDcrEntry: string;
  afterProductSelectionQtyValue0: string;
  productwiseFeedbackSelectionNeeded: string;
  productwiseUpdation: string;
  listedDoctorwisePobUpdationMandatory: string;
  chemistwisePobUpdationMandatory: string;
  isDoctorwiseRemarksMandatory: string;
  allowToEnterNewChemistInDcrEntry: string;
  allowToEnterNewUnlistedDrInDcrEntry: string;
  halfDayWorkEntryNeeded: string;

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
    noOfChemistsAllowedForDcrEntry: "",
    noOfStockistsAllowedForDcrEntry: "",
    noOfUnlistedDoctorsAllowedForDcrEntry: "",
    noOfHospitalsAllowedForDcrEntry: "",
    doctorsListingDisplayInDcrEntry: "",
    displayPatchwiseDoctorsInDcr: "No",
    selectionInDcrListedDoctorMandatory: "No",

    dcrApprovalNeeded: "Needed",

    dcrDelayedSystem: "Needed",
    weekOffHolidayCalculatedInDelayed: "No",
    noOfDaysAllowedForDelay: "",

    dcrAutoPostHoliday: "No",
    dcrAutoPostWeekOff: "No",

    tpBasedDcr: "No",
    tpBasedDcrWithDeviationReason: "No",
    tpBasedDcrWithManagerApprovalNeeded: "No",

    noOfCharactersAllowedForRemarks: "",
    maximumProductSelectionAllowedForDcrEntry: "",
    noOfProductsSelectionMandatoryForDcrEntry: "",
    isSessionMandatoryInDcrEntry: "No",
    isTimeMandatoryInDcrEntry: "No",
    afterProductSelectionQtyValue0: "No",
    productwiseFeedbackSelectionNeeded: "No",
    productwiseUpdation: "None",
    listedDoctorwisePobUpdationMandatory: "No",
    chemistwisePobUpdationMandatory: "No",
    isDoctorwiseRemarksMandatory: "No",
    allowToEnterNewChemistInDcrEntry: "No",
    allowToEnterNewUnlistedDrInDcrEntry: "No",
    halfDayWorkEntryNeeded: "No",

    noOfListedDoctorsAllowedForEntryInMaster: "",
    noOfUnlistedDoctorsAllowedForEntryInMaster: "",
    listedDoctorApprovalNeeded: "No",
    deactivationApprovalNeeded: "No",
    addAgainstDeactApprovalNeeded: "No",
    productTagPrioritywiseNeeded: "No",

    noOfChemistsAllowedForEntry: "",
    noOfStockistsAllowedForEntry: "",

    tourPlan: emptyTourPlanTable(MANAGER_DESIGNATIONS),
    tourPlanBasedSystem: "Tour Plan Based System( Approval Mandatory)",

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

      <TwoColumnBox
        left={
          <>
            <SubSectionLabel first>PLAN SETUP</SubSectionLabel>
            <CompactFieldRow label="Working Area Name">
              <SelectField value={settings.workingAreaName} onChange={(v) => set("workingAreaName", v)} options={WORKING_AREA_OPTIONS} placeholder="---Select---" />
            </CompactFieldRow>
            <CompactFieldRow label="No of Territory Selection in TP">
              <TextField value={settings.noOfTerritorySelectionInTp} onChange={(v) => set("noOfTerritorySelectionInTp", v)} type="number" />
            </CompactFieldRow>

            <SubSectionLabel>DCR SETUP</SubSectionLabel>
            <CompactFieldRow label="No.of Listed Doctors Allowed For DCR Entry">
              <TextField value={settings.noOfListedDoctorsAllowedForDcrEntry} onChange={(v) => set("noOfListedDoctorsAllowedForDcrEntry", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="No.of Chemists Allowed For DCR Entry">
              <TextField value={settings.noOfChemistsAllowedForDcrEntry} onChange={(v) => set("noOfChemistsAllowedForDcrEntry", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="No.of Stockists Allowed For DCR Entry">
              <TextField value={settings.noOfStockistsAllowedForDcrEntry} onChange={(v) => set("noOfStockistsAllowedForDcrEntry", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="No.of UnListed Doctors Allowed For DCR Entry">
              <TextField value={settings.noOfUnlistedDoctorsAllowedForDcrEntry} onChange={(v) => set("noOfUnlistedDoctorsAllowedForDcrEntry", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="No.of Hospitals Allowed For DCR Entry">
              <TextField value={settings.noOfHospitalsAllowedForDcrEntry} onChange={(v) => set("noOfHospitalsAllowedForDcrEntry", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="Doctors listing display in DCR Entry">
              <SelectField value={settings.doctorsListingDisplayInDcrEntry} onChange={(v) => set("doctorsListingDisplayInDcrEntry", v)} options={DOCTOR_LISTING_DISPLAY_OPTIONS} placeholder="---Select---" />
            </CompactFieldRow>
            <CompactFieldRow label="Display Patchwise Doctors in DCR">
              <YesNoRadio name="displayPatchwiseDoctorsInDcr" value={settings.displayPatchwiseDoctorsInDcr} onChange={(v) => set("displayPatchwiseDoctorsInDcr", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Selection in DCR - Listed Doctor as Mandatory">
              <YesNoRadio name="selectionInDcrListedDoctorMandatory" value={settings.selectionInDcrListedDoctorMandatory} onChange={(v) => set("selectionInDcrListedDoctorMandatory", v)} />
            </CompactFieldRow>

            <SubSectionLabel>DCR APPROVAL SYSTEM</SubSectionLabel>
            <CompactFieldRow label="DCR Approval">
              <NeededRadio name="dcrApprovalNeeded" value={settings.dcrApprovalNeeded} onChange={(v) => set("dcrApprovalNeeded", v)} />
            </CompactFieldRow>

            <SubSectionLabel>DCR DELAYED SYSTEM</SubSectionLabel>
            <CompactFieldRow label="DCR Delayed System">
              <NeededRadio name="dcrDelayedSystem" value={settings.dcrDelayedSystem} onChange={(v) => set("dcrDelayedSystem", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Week Off/Holiday Calculated in Delayed">
              <YesNoRadio name="weekOffHolidayCalculatedInDelayed" value={settings.weekOffHolidayCalculatedInDelayed} onChange={(v) => set("weekOffHolidayCalculatedInDelayed", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="No.of Days Allowed for Delay">
              <TextField value={settings.noOfDaysAllowedForDelay} onChange={(v) => set("noOfDaysAllowedForDelay", v)} type="number" />
            </CompactFieldRow>

            <SubSectionLabel>DCR AUTO POST</SubSectionLabel>
            <CompactFieldRow label="Holiday">
              <YesNoRadio name="dcrAutoPostHoliday" value={settings.dcrAutoPostHoliday} onChange={(v) => set("dcrAutoPostHoliday", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Week Off">
              <YesNoRadio name="dcrAutoPostWeekOff" value={settings.dcrAutoPostWeekOff} onChange={(v) => set("dcrAutoPostWeekOff", v)} />
            </CompactFieldRow>

            <SubSectionLabel>DCR BASED ON TP</SubSectionLabel>
            <CompactFieldRow label="TP Based DCR">
              <YesNoRadio name="tpBasedDcr" value={settings.tpBasedDcr} onChange={(v) => set("tpBasedDcr", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="TP Based DCR with Deviation Reason">
              <YesNoRadio name="tpBasedDcrWithDeviationReason" value={settings.tpBasedDcrWithDeviationReason} onChange={(v) => set("tpBasedDcrWithDeviationReason", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="TP Based DCR with Manager Approval Needed">
              <YesNoRadio name="tpBasedDcrWithManagerApprovalNeeded" value={settings.tpBasedDcrWithManagerApprovalNeeded} onChange={(v) => set("tpBasedDcrWithManagerApprovalNeeded", v)} />
            </CompactFieldRow>
          </>
        }
        right={
          <>
            <SubSectionLabel first>DCR - ENTRY SETUP</SubSectionLabel>
            <CompactFieldRow label="No.of Characters Allowed For Remarks">
              <TextField value={settings.noOfCharactersAllowedForRemarks} onChange={(v) => set("noOfCharactersAllowedForRemarks", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="Maximum Product Selection Allowed For DCR Entry">
              <TextField value={settings.maximumProductSelectionAllowedForDcrEntry} onChange={(v) => set("maximumProductSelectionAllowedForDcrEntry", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="No. of Products Selection Mandatory For DCR Entry">
              <TextField value={settings.noOfProductsSelectionMandatoryForDcrEntry} onChange={(v) => set("noOfProductsSelectionMandatoryForDcrEntry", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="Is Session Mandatory in DCR Entry">
              <YesNoRadio name="isSessionMandatoryInDcrEntry" value={settings.isSessionMandatoryInDcrEntry} onChange={(v) => set("isSessionMandatoryInDcrEntry", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Is Time Mandatory in DCR Entry">
              <YesNoRadio name="isTimeMandatoryInDcrEntry" value={settings.isTimeMandatoryInDcrEntry} onChange={(v) => set("isTimeMandatoryInDcrEntry", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="After Product Selection Qty Value 0">
              <YesNoRadio name="afterProductSelectionQtyValue0" value={settings.afterProductSelectionQtyValue0} onChange={(v) => set("afterProductSelectionQtyValue0", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Productwise Feedback Selection in DCR Entry Needed">
              <YesNoRadio name="productwiseFeedbackSelectionNeeded" value={settings.productwiseFeedbackSelectionNeeded} onChange={(v) => set("productwiseFeedbackSelectionNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Productwise Updation">
              <YesNoRadio name="productwiseUpdation" value={settings.productwiseUpdation} onChange={(v) => set("productwiseUpdation", v)} options={PRODUCTWISE_UPDATION_OPTIONS} />
            </CompactFieldRow>
            <CompactFieldRow label="Listed Doctorwise POB Updation is Mandatory in DCR">
              <YesNoRadio name="listedDoctorwisePobUpdationMandatory" value={settings.listedDoctorwisePobUpdationMandatory} onChange={(v) => set("listedDoctorwisePobUpdationMandatory", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Chemistwise POB Updation is Mandatory in DCR">
              <YesNoRadio name="chemistwisePobUpdationMandatory" value={settings.chemistwisePobUpdationMandatory} onChange={(v) => set("chemistwisePobUpdationMandatory", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Is Doctor-wise Remarks Mandatory">
              <YesNoRadio name="isDoctorwiseRemarksMandatory" value={settings.isDoctorwiseRemarksMandatory} onChange={(v) => set("isDoctorwiseRemarksMandatory", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Allow to Enter New Chemist in DCR Entry">
              <YesNoRadio name="allowToEnterNewChemistInDcrEntry" value={settings.allowToEnterNewChemistInDcrEntry} onChange={(v) => set("allowToEnterNewChemistInDcrEntry", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Allow to Enter New Un-Listed Dr in DCR Entry">
              <YesNoRadio name="allowToEnterNewUnlistedDrInDcrEntry" value={settings.allowToEnterNewUnlistedDrInDcrEntry} onChange={(v) => set("allowToEnterNewUnlistedDrInDcrEntry", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Half day Work Entry Needed">
              <YesNoRadio name="halfDayWorkEntryNeeded" value={settings.halfDayWorkEntryNeeded} onChange={(v) => set("halfDayWorkEntryNeeded", v)} />
            </CompactFieldRow>

            <SubSectionLabel>DOCTOR SETUP</SubSectionLabel>
            <CompactFieldRow label="No.of Listed Doctors Allowed For Entry in Master">
              <TextField value={settings.noOfListedDoctorsAllowedForEntryInMaster} onChange={(v) => set("noOfListedDoctorsAllowedForEntryInMaster", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="No.of Unlisted Doctors Allowed For Entry in Master">
              <TextField value={settings.noOfUnlistedDoctorsAllowedForEntryInMaster} onChange={(v) => set("noOfUnlistedDoctorsAllowedForEntryInMaster", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="Listed Doctor Approval Needed">
              <YesNoRadio name="listedDoctorApprovalNeeded" value={settings.listedDoctorApprovalNeeded} onChange={(v) => set("listedDoctorApprovalNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Listed Doctor Deactivation Approval Needed">
              <YesNoRadio name="deactivationApprovalNeeded" value={settings.deactivationApprovalNeeded} onChange={(v) => set("deactivationApprovalNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Listed Doctor Add against Deact Approval Needed">
              <YesNoRadio name="addAgainstDeactApprovalNeeded" value={settings.addAgainstDeactApprovalNeeded} onChange={(v) => set("addAgainstDeactApprovalNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Listed Doctor Product Tag-Prioritywise Needed">
              <YesNoRadio name="productTagPrioritywiseNeeded" value={settings.productTagPrioritywiseNeeded} onChange={(v) => set("productTagPrioritywiseNeeded", v)} />
            </CompactFieldRow>

            <SubSectionLabel>CHEMISTS SETUP</SubSectionLabel>
            <CompactFieldRow label="No.of Chemists Allowed For Entry">
              <TextField value={settings.noOfChemistsAllowedForEntry} onChange={(v) => set("noOfChemistsAllowedForEntry", v)} type="number" />
            </CompactFieldRow>

            <SubSectionLabel>STOCKISTS SETUP</SubSectionLabel>
            <CompactFieldRow label="No.of Stockists Allowed For Entry">
              <TextField value={settings.noOfStockistsAllowedForEntry} onChange={(v) => set("noOfStockistsAllowedForEntry", v)} type="number" />
            </CompactFieldRow>
          </>
        }
      />

      <div style={{ fontWeight: 700, fontSize: 14, margin: "10px 0 6px" }}>Tour Plan Setup</div>
      <TwoColumnBox
        left={
          <TourPlanSetupTable
            designations={MANAGER_DESIGNATIONS}
            table={settings.tourPlan}
            onChange={(d, patch) => set("tourPlan", { ...settings.tourPlan, [d]: { ...settings.tourPlan[d], ...patch } })}
          />
        }
        right={
          <div className="space-y-3">
            <div style={{ fontWeight: 700, fontSize: 12.5 }}>Tour Plan</div>
            <YesNoRadio
              name="tourPlanBasedSystem"
              value={settings.tourPlanBasedSystem}
              onChange={(v) => set("tourPlanBasedSystem", v)}
              options={["Tour Plan Based System( Approval Mandatory)", "Without Tour Plan Based System"]}
            />
            <TourPlanApprovalList
              designations={MANAGER_DESIGNATIONS}
              table={settings.tourPlan}
              onChange={(d, patch) => set("tourPlan", { ...settings.tourPlan, [d]: { ...settings.tourPlan[d], ...patch } })}
            />
          </div>
        }
      />

      <div style={{ fontWeight: 700, fontSize: 14, margin: "10px 0 6px" }}>Additional Setup (Baselevel &amp; Managers)</div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card p-3">
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
        </div>
        <div className="card p-3">
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
      </div>

      <div className="flex gap-3 pt-2">
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
