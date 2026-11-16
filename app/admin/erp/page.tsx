import { PageHeader } from "@/components/page-components";
import { SecondarySales } from "@/components/erp/secondary-sales";

// Phase 2 ERP (ENT-ZVR-2026-P2) -- first module: Secondary Sales from
// distributor Stock & Sales statements.
export default function ErpSecondarySalesPage() {
  return (
    <>
      <PageHeader
        eyebrow="ERP"
        title="Secondary Sales"
        description="Read distributor Stock & Sales statements and build the monthly Secondary Sales Compilation."
      />
      <SecondarySales />
    </>
  );
}
