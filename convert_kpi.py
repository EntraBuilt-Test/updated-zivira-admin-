import os
import re

source = "components/kpi-engine-dashboard.tsx"
target = "components/admin-kpi-engine-dashboard.tsx"

with open(source, "r", encoding="utf-8") as f:
    content = f.read()

# Replace component name
content = content.replace("KpiEngineDashboard", "AdminKpiEngineDashboard")

# Remove BackButton
content = re.sub(r'import { BackButton } from "@/components/back-button";\n', '', content)
content = re.sub(r'<BackButton fallback="[^"]*" />\s*', '', content)

# Import AdminTabGrid
content = re.sub(r'import { useEffect, useState } from "react";', 'import { useEffect, useState } from "react";\nimport { AdminTabGrid } from "@/components/admin-tab-grid";', content)

# Replace the layout
layout_old = r'<section className="subdivision-console">\s*<div className="subdivision-head">\s*<div>\s*<p className="subdivision-eyebrow">KPIs</p>\s*<h2>KPI Engine</h2>\s*<p>Automatically calculated rep and manager scorecards for this month.</p>\s*</div>\s*<div style={{ display: "flex", gap: 8 }}>\s*(?:<BackButton[^>]*>\s*)?<button className="button button-secondary" onClick={load} type="button"><RefreshCw size={15} />{loading \? "Loading" : "Refresh"}</button>\s*<ExportMenuButton[^>]*>\s*</ExportMenuButton>|\s*<ExportMenuButton[^/]*/>\s*</div>\s*</div>'

# Wait, regex is a bit complex, let's just do a string replace for the head part
# Let's extract ExportMenuButton string since it spans multiple lines.
# Instead of regex, let's just replace the exact string or close to it.

# I will use a simple regex for subdivision-head and keep the ExportMenuButton
layout_old_re = re.compile(r'<section className="subdivision-console">\s*<div className="subdivision-head">.*?<ExportMenuButton(.*?)/>\s*</div>\s*</div>', re.DOTALL)

def replacer(match):
    export_attrs = match.group(1)
    return f'''<div className="flex flex-col w-full h-full bg-surface-canvas overflow-y-auto">
      <AdminTabGrid
        activeTab="kpi-engine"
        title="KPI Engine"
        description="Automatically calculated rep and manager scorecards for this month."
      />
      
      <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-end gap-2 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-subtle hover:bg-surface-card text-text-primary border border-border-subtle text-sm font-medium transition-colors" onClick={{load}} type="button">
            <RefreshCw size={{15}} className={{loading ? "animate-spin" : ""}} />
            {{loading ? "Loading" : "Refresh"}}
          </button>
          <ExportMenuButton{export_attrs}/>
        </div>'''

content = layout_old_re.sub(replacer, content)

# Replace form-error
content = content.replace('className="form-error"', 'className="p-4 bg-status-danger-bg text-status-danger rounded-md text-sm border border-status-danger-bg"')

# Replace section-title
content = content.replace('<h3 className="section-title"', '<h3 className="text-lg font-semibold text-text-primary"')

# Replace table card
content = content.replace('className="subdivision-table-card"', 'className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm"')

# Replace table classes
content = content.replace('className="subdivision-table"', 'className="w-full text-left text-sm whitespace-nowrap border-collapse"')

# The <thead> styling
content = content.replace('<thead>', '<thead className="bg-surface-subtle text-text-secondary border-b border-border-subtle">\n            <tr>\n              {/* We will add classes to th inside JS since it is hard to replace all th */}\n')

# Actually, I'll just write a quick regex for th and td
content = re.sub(r'<th>', '<th className="px-6 py-3 font-medium">', content)
content = re.sub(r'<td>', '<td className="px-6 py-4 border-b border-border-subtle text-text-primary">', content)

# Replace tr in tbody
content = re.sub(r'<tbody>', '<tbody className="divide-y divide-border-subtle">', content)
content = re.sub(r'<tr key={', '<tr className="hover:bg-surface-subtle/50 transition-colors" key={', content)

# Replace inline styles for colors
content = content.replace('style={{ color: "var(--ink)" }}', 'className="text-text-primary"')
content = content.replace('style={{ fontWeight: 700 }}', 'className="font-bold text-text-primary px-6 py-4 border-b border-border-subtle"')
content = content.replace('style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}', 'className="px-6 py-8 text-center text-text-muted"')

# Close section
content = content.replace('</section>', '</section>\n    </div>')


with open(target, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Created {target}")
