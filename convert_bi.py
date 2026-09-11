import os
import re

source = "components/bi-analytics-hub.tsx"
target = "components/admin-bi-reports-dashboard.tsx"

with open(source, "r", encoding="utf-8") as f:
    content = f.read()

# Replace component name
content = content.replace("BiAnalyticsHub", "AdminBiReportsDashboard")

# Update layout to use AdminTabGrid
# Replace the outer <section className="subdivision-console"> ... </div> with the new UI

# Remove BackButton
content = re.sub(r'import { BackButton } from "@/components/back-button";\n', '', content)
content = re.sub(r'<BackButton fallback="[^"]*" />', '', content)

# Import AdminTabGrid
content = re.sub(r'import Link from "next/link";', 'import Link from "next/link";\nimport { AdminTabGrid } from "@/components/admin-tab-grid";', content)

# Replace the layout
layout_old = r'<section className="subdivision-console">\s*<div className="subdivision-head">\s*<div>\s*<p className="subdivision-eyebrow">Business Intelligence</p>\s*<h2>BI Reports</h2>\s*<p>Every report category from the project brief, pointing at the live data already powering it — organized so nothing has to be found twice.</p>\s*</div>\s*</div>'

layout_new = '''<AdminTabGrid
        activeTab="bi-reports"
        title="BI Reports"
        description="Every report category from the project brief, pointing at the live data already powering it — organized so nothing has to be found twice."
      />

      <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">'''

content = re.sub(layout_old, layout_new, content)

# Replace styles inside groups
content = content.replace('<div className="grid grid-2" style={{ gap: 16 }}>', '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">')
content = content.replace('<div key={group.title} className="card" style={{ padding: 18 }}>', '<div key={group.title} className="bg-surface-card border border-border-subtle rounded-xl p-5 shadow-sm">')
content = content.replace('<h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>', '<h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-4">')
content = content.replace('<div style={{ display: "grid", gap: 2 }}>', '<div className="grid gap-1">')

# Replace items
content = content.replace('style={{ display: "block", padding: "8px 12px", borderRadius: 6, backgroundColor: "var(--surface-subtle)", color: "var(--primary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}', 'className="block p-3 rounded-md bg-surface-subtle text-primary hover:bg-brand-primary-hover hover:text-white transition-colors text-sm font-medium"')
content = content.replace('style={{ display: "block", padding: "8px 12px", borderRadius: 6, border: "1px dashed var(--border)", fontSize: "0.85rem", color: "var(--muted)" }}', 'className="block p-3 rounded-md border border-dashed border-border-subtle text-text-muted text-sm"')

# Close section
content = content.replace('</section>', '</section>\n    </div>')
content = content.replace('<AdminTabGrid', '<div className="flex flex-col w-full h-full bg-surface-canvas overflow-y-auto">\n      <AdminTabGrid')


with open(target, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Created {target}")
