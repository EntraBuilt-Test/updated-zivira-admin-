import re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update company-data.ts
update_file('lib/company-data.ts', [
    ('href: "/admin/analytics/kpi"', 'href: "/admin/kpi-engine"'),
    ('href: "/admin/analytics"', 'href: "/admin/bi-reports"'),
])

# 2. Update zivira-tree.ts
update_file('packages/types/src/zivira-tree.ts', [
    ('  | "branches-gst"\n  | "compliance"', '  | "branches-gst"\n  | "compliance"\n  | "kpi-engine"\n  | "bi-reports"'),
])

# 3. Update admin-tabs.ts
update_file('lib/admin-tabs.ts', [
    ('  "branches-gst": { label: "Branches / GST", icon: BookOpen },', '  "branches-gst": { label: "Branches / GST", icon: BookOpen },\n  "kpi-engine": { label: "KPI Engine", icon: FileText },\n  "bi-reports": { label: "BI Reports", icon: FileText },'),
])

# 4. Update page.tsx
update_file('app/admin/[tab]/page.tsx', [
    ("import { AdminComplianceDashboard } from \"@/components/admin-compliance-dashboard\";", "import { AdminComplianceDashboard } from \"@/components/admin-compliance-dashboard\";\nimport { AdminKpiEngineDashboard } from \"@/components/admin-kpi-engine-dashboard\";\nimport { AdminBiReportsDashboard } from \"@/components/admin-bi-reports-dashboard\";"),
    ("  \"compliance\": AdminComplianceDashboard,", "  \"compliance\": AdminComplianceDashboard,\n  \"kpi-engine\": AdminKpiEngineDashboard,\n  \"bi-reports\": AdminBiReportsDashboard,")
])

print("Route updates complete")
