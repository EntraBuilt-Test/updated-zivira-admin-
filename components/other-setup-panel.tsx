"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  TwoColumnBox,
  SubSectionLabel,
  CompactFieldRow,
  YesNoRadio,
  TextField,
  SelectField
} from "@/components/admin-setup-shared";

const CONFIG_KIND = "otherSetup";

const TARGET_FIXATION_OPTIONS = ["Financial Year", "FY - Half Yearly", "FY - Quarterly", "Calender Year", "CY - Half Yearly", "CY - Quarterly", "Monthly"] as const;
const PRICE_BASIS_OPTIONS = ["MRP Price", "Target Price", "Retailor Price", "NSR Price", "Distributor Price"] as const;
const PRICE_BASIS_WITH_RATE_OPTIONS = ["MRP Price", "Target Price", "Retailor Price", "Rate - Enterable", "Distributor Price"] as const;
const WHO_RAISES_CRM_OPTIONS = ["Base Level", "Manager", "Base Level/Manager", "Admin"] as const;
const APPROVAL_FOR_CRM_OPTIONS = ["Line Manager Only", "All Manager"] as const;
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTH_OPTIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => String(2024 + i));
const DESIGNATION_SELECT_OPTIONS = ["ALL", "ABM", "BE", "BH", "BRM", "MH", "NBM", "RBM", "Sr BE", "ZBM", "Sr ABM", "SM"] as const;

type Settings = {
  targetFixationBasedOn: string;
  targetCalendarBasedOn: string;
  ssEntryMandatoryFrom: string;
  ssEntryMandatoryTo: string;
  hospitalCalculationBasedOn: string;
  chemistCalculationBasedOn: string;
  leaveEntitlementNeeded: string;
  stpNeeded: string;

  doctorCalculationBasedOn: string;
  whoRaisesCrm: string;
  approvalForCrm: string;
  noOfDaysLeaveAllowed: string;
  delayedStatusCaption1: string;
  delayedStatusCaption2: string;
  resignedCaptionDesignation: string;
  resignedCaptionText: string;
  lineManagerLockingNeeded: string;
  lockingDay: string;
  sampleInventoryMonth1: string;
  sampleInventoryYear1: string;
  sampleInventoryMonth2: string;
  sampleInventoryYear2: string;
  dcrApprovalRemarksNeeded: string;
  leavePolicyNeeded: string;
  crmPopupNeeded: string;
  crmCalculationBasedOn: string;
  sampleAcknowledgementNeeded: string;
  inputAcknowledgementNeeded: string;
};

function emptySettings(): Settings {
  return {
    targetFixationBasedOn: "Financial Year",
    targetCalendarBasedOn: "Retailor Price",
    ssEntryMandatoryFrom: "",
    ssEntryMandatoryTo: "",
    hospitalCalculationBasedOn: "Rate - Enterable",
    chemistCalculationBasedOn: "Retailor Price",
    leaveEntitlementNeeded: "Yes",
    stpNeeded: "No",

    doctorCalculationBasedOn: "Retailor Price",
    whoRaisesCrm: "",
    approvalForCrm: "",
    noOfDaysLeaveAllowed: "7",
    delayedStatusCaption1: "",
    delayedStatusCaption2: "",
    resignedCaptionDesignation: "",
    resignedCaptionText: "",
    lineManagerLockingNeeded: "No",
    lockingDay: "5",
    sampleInventoryMonth1: "Apr",
    sampleInventoryYear1: "",
    sampleInventoryMonth2: "Mar",
    sampleInventoryYear2: "",
    dcrApprovalRemarksNeeded: "No",
    leavePolicyNeeded: "No",
    crmPopupNeeded: "No",
    crmCalculationBasedOn: "Distributor Price",
    sampleAcknowledgementNeeded: "No",
    inputAcknowledgementNeeded: "No"
  };
}

function mergeSettings(loaded: unknown): Settings {
  const base = emptySettings();
  if (!loaded || typeof loaded !== "object") return base;
  return { ...base, ...(loaded as Partial<Settings>) };
}

// Matches sanpharma.info's Options >> Other Setup screen (Other_Setup.aspx)
// exactly: a single two-column bordered box -- Target Fixation / SS Entry
// Setup / Hospital Business Entry / Chemist Business Entry / Leave
// Entitlement on the left, Doctor Business Entry / CRM / Leave Setup / CRM
// Business Entry / Sample-Input Acknowledgement on the right -- with a
// bottom Save/Clear pair. Persisted as one CompanyConfig blob via
// getAdminSetting/saveAdminSetting("otherSetup"), the same pattern as
// Base Level Setup / Manager Setup.
export function OtherSetupPanel({ masterKey: _masterKey }: { masterKey: string }) {
  const [settings, setSettings] = useState<Settings>(emptySettings());
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
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load Other Setup");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.saveAdminSetting(CONFIG_KIND, settings);
      setNotice("Other Setup saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Other Setup");
    } finally {
      setSaving(false);
    }
  }

  function clear() {
    setSettings(emptySettings());
  }

  if (loading) return <div className="card p-4 text-sm">Loading Other Setup...</div>;

  return (
    <div className="space-y-3">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Other Setup</h2>
      </div>

      {error && <div className="card p-3 text-sm text-red-600">{error}</div>}
      {notice && <div className="card p-3 text-sm text-green-700">{notice}</div>}

      <TwoColumnBox
        left={
          <>
            <SubSectionLabel first>TARGET FIXATION</SubSectionLabel>
            <CompactFieldRow label="Target Fixation Based On">
              <YesNoRadio name="targetFixationBasedOn" value={settings.targetFixationBasedOn} onChange={(v) => set("targetFixationBasedOn", v)} options={TARGET_FIXATION_OPTIONS} />
            </CompactFieldRow>
            <CompactFieldRow label="Target Calender Based On">
              <YesNoRadio name="targetCalendarBasedOn" value={settings.targetCalendarBasedOn} onChange={(v) => set("targetCalendarBasedOn", v)} options={PRICE_BASIS_OPTIONS} />
            </CompactFieldRow>

            <SubSectionLabel>SS ENTRY SETUP</SubSectionLabel>
            <CompactFieldRow label="SS Entry Mandatory - Date Range">
              <div className="flex items-center gap-2">
                <span className="text-xs">From</span>
                <SelectField value={settings.ssEntryMandatoryFrom} onChange={(v) => set("ssEntryMandatoryFrom", v)} options={DAY_OPTIONS} placeholder="---Select---" />
                <span className="text-xs">To</span>
                <SelectField value={settings.ssEntryMandatoryTo} onChange={(v) => set("ssEntryMandatoryTo", v)} options={DAY_OPTIONS} placeholder="---Select---" />
              </div>
            </CompactFieldRow>

            <SubSectionLabel>HOSPITAL BUSINESS ENTRY</SubSectionLabel>
            <CompactFieldRow label="Calculation Based On">
              <YesNoRadio name="hospitalCalculationBasedOn" value={settings.hospitalCalculationBasedOn} onChange={(v) => set("hospitalCalculationBasedOn", v)} options={PRICE_BASIS_WITH_RATE_OPTIONS} />
            </CompactFieldRow>

            <SubSectionLabel>CHEMIST BUSINESS ENTRY</SubSectionLabel>
            <CompactFieldRow label="Calculation Based On">
              <YesNoRadio name="chemistCalculationBasedOn" value={settings.chemistCalculationBasedOn} onChange={(v) => set("chemistCalculationBasedOn", v)} options={PRICE_BASIS_OPTIONS} />
            </CompactFieldRow>

            <SubSectionLabel>LEAVE ENTITLEMENT</SubSectionLabel>
            <CompactFieldRow label="Leave Entitlement for MR / Manager Needed">
              <YesNoRadio name="leaveEntitlementNeeded" value={settings.leaveEntitlementNeeded} onChange={(v) => set("leaveEntitlementNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="STP Needed">
              <YesNoRadio name="stpNeeded" value={settings.stpNeeded} onChange={(v) => set("stpNeeded", v)} />
            </CompactFieldRow>
          </>
        }
        right={
          <>
            <SubSectionLabel first>DOCTOR BUSINESS ENTRY</SubSectionLabel>
            <CompactFieldRow label="Calculation Based On">
              <YesNoRadio name="doctorCalculationBasedOn" value={settings.doctorCalculationBasedOn} onChange={(v) => set("doctorCalculationBasedOn", v)} options={PRICE_BASIS_OPTIONS} />
            </CompactFieldRow>

            <SubSectionLabel>CRM</SubSectionLabel>
            <CompactFieldRow label="Who will raise the CRM">
              <YesNoRadio name="whoRaisesCrm" value={settings.whoRaisesCrm} onChange={(v) => set("whoRaisesCrm", v)} options={WHO_RAISES_CRM_OPTIONS} />
            </CompactFieldRow>
            <CompactFieldRow label="Approval for CRM">
              <YesNoRadio name="approvalForCrm" value={settings.approvalForCrm} onChange={(v) => set("approvalForCrm", v)} options={APPROVAL_FOR_CRM_OPTIONS} />
            </CompactFieldRow>

            <SubSectionLabel>LEAVE SETUP</SubSectionLabel>
            <CompactFieldRow label="No.of Days Leave Allowed">
              <TextField value={settings.noOfDaysLeaveAllowed} onChange={(v) => set("noOfDaysLeaveAllowed", v)} type="number" />
            </CompactFieldRow>
            <CompactFieldRow label="Delayed Status Caption show in the DCR view as">
              <div className="flex gap-2">
                <TextField value={settings.delayedStatusCaption1} onChange={(v) => set("delayedStatusCaption1", v)} />
                <TextField value={settings.delayedStatusCaption2} onChange={(v) => set("delayedStatusCaption2", v)} />
              </div>
            </CompactFieldRow>
            <CompactFieldRow label="Whenever the Fieldforce is Resigned, include Caption in Fieldforce Name">
              <div className="flex gap-2">
                <SelectField value={settings.resignedCaptionDesignation} onChange={(v) => set("resignedCaptionDesignation", v)} options={DESIGNATION_SELECT_OPTIONS} placeholder="--Select--" />
                <TextField value={settings.resignedCaptionText} onChange={(v) => set("resignedCaptionText", v)} />
              </div>
            </CompactFieldRow>
            <CompactFieldRow label="Line Manager Locking System Needed (Not Submitted SS Entry for Subordinates)">
              <YesNoRadio name="lineManagerLockingNeeded" value={settings.lineManagerLockingNeeded} onChange={(v) => set("lineManagerLockingNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Locking Day">
              <SelectField value={settings.lockingDay} onChange={(v) => set("lockingDay", v)} options={DAY_OPTIONS} placeholder="---Select---" />
            </CompactFieldRow>
            <CompactFieldRow label="Sample Inventory Effective Month/Year">
              <div className="flex items-center gap-2">
                <span className="text-xs">Month</span>
                <SelectField value={settings.sampleInventoryMonth1} onChange={(v) => set("sampleInventoryMonth1", v)} options={MONTH_OPTIONS} placeholder="---Select---" />
                <span className="text-xs">Year</span>
                <SelectField value={settings.sampleInventoryYear1} onChange={(v) => set("sampleInventoryYear1", v)} options={YEAR_OPTIONS} placeholder="--Select--" />
              </div>
            </CompactFieldRow>
            <CompactFieldRow label="Sample Inventory Effective Month/Year">
              <div className="flex items-center gap-2">
                <span className="text-xs">Month</span>
                <SelectField value={settings.sampleInventoryMonth2} onChange={(v) => set("sampleInventoryMonth2", v)} options={MONTH_OPTIONS} placeholder="---Select---" />
                <span className="text-xs">Year</span>
                <SelectField value={settings.sampleInventoryYear2} onChange={(v) => set("sampleInventoryYear2", v)} options={YEAR_OPTIONS} placeholder="--Select--" />
              </div>
            </CompactFieldRow>
            <CompactFieldRow label="DCR Approval Remarks Needed">
              <YesNoRadio name="dcrApprovalRemarksNeeded" value={settings.dcrApprovalRemarksNeeded} onChange={(v) => set("dcrApprovalRemarksNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Leave Policy Needed">
              <YesNoRadio name="leavePolicyNeeded" value={settings.leavePolicyNeeded} onChange={(v) => set("leavePolicyNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="CRM Popup Need">
              <YesNoRadio name="crmPopupNeeded" value={settings.crmPopupNeeded} onChange={(v) => set("crmPopupNeeded", v)} />
            </CompactFieldRow>

            <SubSectionLabel>CRM BUSINESS ENTRY</SubSectionLabel>
            <CompactFieldRow label="Calculation Based On">
              <YesNoRadio name="crmCalculationBasedOn" value={settings.crmCalculationBasedOn} onChange={(v) => set("crmCalculationBasedOn", v)} options={PRICE_BASIS_WITH_RATE_OPTIONS} />
            </CompactFieldRow>

            <SubSectionLabel>SAMPLE/INPUT ACKNOWLEDGEMENT</SubSectionLabel>
            <CompactFieldRow label="Sample Acknowledgement Needed">
              <YesNoRadio name="sampleAcknowledgementNeeded" value={settings.sampleAcknowledgementNeeded} onChange={(v) => set("sampleAcknowledgementNeeded", v)} />
            </CompactFieldRow>
            <CompactFieldRow label="Input Acknowledgement Needed">
              <YesNoRadio name="inputAcknowledgementNeeded" value={settings.inputAcknowledgementNeeded} onChange={(v) => set("inputAcknowledgementNeeded", v)} />
            </CompactFieldRow>
          </>
        }
      />

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
