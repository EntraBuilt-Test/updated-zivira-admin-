"use client";

import { GenerateUploadPage, type GenerateUploadConfig } from "@/components/generate-upload-page";

const CFG: GenerateUploadConfig = {
  toolKey: "chemist", title: "Chemists Upload Tool", noun: "Chemist", masterLabel: "Chemists list", back: true,
  masterPath: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor/chemist-master",
  lastUploadKey: "r62.lastUpload.chemist",
  refLink: "Category / Class", refHeading: "Category / Class (from your chemist master)",
  refTables: (d) => [["Category", d.categories], ["Class", d.classes]] as const,
  deactivateLabel: "Deactivate Existing Chemist List ( if Yes then Check this Option )",
  noteLine: "User Name must be an Employee Code or exact name from the Field Force master. Chemist Name and Territory are required. Class is free text up to 20 characters."
};
export function ChemistUploadPage() { return <GenerateUploadPage cfg={CFG} />; }
