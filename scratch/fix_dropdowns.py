import os

files = [
    'components/manager-allowance-automatic.tsx',
    'components/manager-sfc-updation.tsx',
    'components/manager-work-type-allowance.tsx',
]

for file in files:
    path = os.path.join(r'c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main', file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Clean up command-select-menu
    content = content.replace('style={{ width: "260px", top: "calc(100% + 6px)", left: 0, right: "auto" }}', '')
    content = content.replace('style={{ width: "320px", top: "calc(100% + 6px)", left: 0, right: "auto", maxHeight: "320px", overflowY: "auto" }}', '')
    
    # Also clean up the buttons inside to use proper text colors
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Fix manager-expense-report dropdowns
expense_path = os.path.join(r'c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main', 'components/manager-expense-report.tsx')
with open(expense_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all these inline styles
content = content.replace(
    '<div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "120px", display: "flex", flexDirection: "column", padding: "4px 0" }}>',
    '<div className="command-select-menu" style={{ right: 0, left: "auto" }}>'
)
content = content.replace(
    '<div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "160px", display: "flex", flexDirection: "column", padding: "4px 0" }}>',
    '<div className="command-select-menu" style={{ right: 0, left: "auto" }}>'
)
content = content.replace(
    '<div style={{ position: "absolute", top: "100%", right: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "140px", display: "flex", flexDirection: "column", padding: "4px 0" }}>',
    '<div className="command-select-menu" style={{ right: 0, left: "auto" }}>'
)

# And the option buttons inside those:
content = content.replace(
    '<button type="button" onClick={() => { setDivisionFilter("All"); setDivisionFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>',
    '<button className="command-select-option" type="button" onClick={() => { setDivisionFilter("All"); setDivisionFilterOpen(false); }}>Clear Filter</button>'
)
content = content.replace(
    '<button type="button" onClick={() => { setHqFilter("All"); setHqFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>',
    '<button className="command-select-option" type="button" onClick={() => { setHqFilter("All"); setHqFilterOpen(false); }}>Clear Filter</button>'
)
content = content.replace(
    '<button type="button" onClick={() => { setTypeFilter("All"); setTypeFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>',
    '<button className="command-select-option" type="button" onClick={() => { setTypeFilter("All"); setTypeFilterOpen(false); }}>Clear Filter</button>'
)
content = content.replace(
    '<button type="button" onClick={() => { setApprovalFilter("All"); setApprovalFilterOpen(false); }} style={{ padding: "6px 12px", textAlign: "left", borderTop: "1px solid var(--border)", background: "none", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Clear Filter</button>',
    '<button className="command-select-option" type="button" onClick={() => { setApprovalFilter("All"); setApprovalFilterOpen(false); }}>Clear Filter</button>'
)

# Replace the inner map options
import re
content = re.sub(
    r'style={{ padding: "6px 12px", textAlign: "left", background: ([a-zA-Z]+)Filter === ([a-zA-Z]+) \? "var\(--line\)" : "none", border: "none", color: "var\(--ink\)", fontSize: "12px", cursor: "pointer", fontWeight: \1Filter === \2 \? 600 : 400 }}',
    r'className={\1Filter === \2 ? "command-select-option command-select-option-active" : "command-select-option"}',
    content
)

with open(expense_path, 'w', encoding='utf-8') as f:
    f.write(content)
