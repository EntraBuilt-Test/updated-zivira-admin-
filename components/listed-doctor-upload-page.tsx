"use client";

import { GenerateUploadPage, type GenerateUploadConfig } from "@/components/generate-upload-page";

const CFG: GenerateUploadConfig = {
  toolKey: "listed-doctor", title: "Listed Doctor Upload Tool", noun: "Doctor", masterLabel: "Listed Doctor list",
  masterPath: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor/listed-doctor-master",
  lastUploadKey: "r61.lastUpload.listed-doctor",
  refLink: "Speciality / Category", refHeading: "Speciality / Category (from your doctor master)",
  refTables: (d) => [["Speciality", d.specialities ?? []], ["Category (Nil/Core/...)", d.categories], ["Class", d.classes]] as const,
  deactivateLabel: "Deactivate Existing Doctor List ( if Yes then Check this Option )",
  noteLine: "User Name must be an Employee Code or exact name from the Field Force master. Category must be Nil / CORE / N CORE / S CORE. Class is A / B / C."
};
export function ListedDoctorUploadPage() { return <GenerateUploadPage cfg={CFG} />; }
