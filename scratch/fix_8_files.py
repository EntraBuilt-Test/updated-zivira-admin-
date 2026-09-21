import os
import re

files = [
    "components/holiday-master.tsx",
    "components/listed-doctor-master.tsx",
    "components/product-category-master.tsx",
    "components/product-group-master.tsx",
    "components/statewise-rate-fixation.tsx",
    "components/stockist-details-master.tsx",
    "components/subdivision-master.tsx",
    "components/territory-master.tsx",
    "components/admin-alerts-dashboard.tsx"
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex that only matches up to the closing div of subdivision-head
    # We will assume everything inside subdivision-head can be safely converted to PageHeader
    # Let's find subdivision-head start and end
    
    # We'll use a simpler approach for the 8 files: manually replace their headers because they have buttons inside <div className="subdivision-actions">
    
    if "admin-alerts-dashboard" in filepath:
        content = re.sub(
            r'<section className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">.*?</section>',
            '''<PageHeader
        eyebrow="ALERTS"
        title="Alert & Notification Engine"
        description="Automated alerts pulled live from compliance, coverage, payroll, and sample-stock signals across the platform."
        action={
          <>
            <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            type="button"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            Back
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            type="button"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform"
              fill="none"
              id="refresh-icon"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            Refresh
          </button>
          </>
        }
      />''',
            content,
            flags=re.DOTALL
        )
        if "PageHeader" not in content:
            content = 'import { PageHeader } from "@/components/page-components";\n' + content

    else:
        # subdivision-head replacement
        pattern = re.compile(
            r'<div\s+className="subdivision-head">\s*<div>\s*<p\s+className="subdivision-eyebrow">([^<]+)</p>\s*<h2[^>]*>([^<]+)</h2>\s*<p>([^<]*)</p>\s*</div>\s*(?:<div\s+className="subdivision-actions">\s*(.*?)\s*</div>)?\s*</div>',
            re.DOTALL
        )
        
        def repl(m):
            eyebrow = m.group(1).strip()
            title = m.group(2).strip()
            description = m.group(3).strip()
            actions = m.group(4)
            actions = actions.strip() if actions else ""
            
            if actions:
                return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title="{title}"\n  description="{description}"\n  action={{\n    <>\n{actions}\n    </>\n  }}\n/>'
            else:
                return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title="{title}"\n  description="{description}"\n/>'
        
        old_content = content
        content = pattern.sub(repl, content)
        
        if content != old_content and "import { PageHeader" not in content:
            lines = content.splitlines(True)
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    lines.insert(i, 'import { PageHeader } from "@/components/page-components";\n')
                    break
            content = "".join(lines)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")
