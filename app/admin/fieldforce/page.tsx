import { Suspense } from "react";
import { EmployeeManager } from "@/components/employee-manager";

export default function FieldForcePage() {
  return (
    <Suspense fallback={null}>
      <EmployeeManager />
    </Suspense>
  );
}
