import re
with open('components/chemist-master.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add whitespace-nowrap to all <td> tags in the table body
c = c.replace('<td>', '<td className="whitespace-nowrap">')
c = c.replace('<td style={{ color: "var(--muted)", fontWeight: 500 }}>', '<td className="whitespace-nowrap" style={{ color: "var(--muted)", fontWeight: 500 }}>')
c = c.replace('<td style={{ fontWeight: 600 }}>', '<td className="whitespace-nowrap" style={{ fontWeight: 600 }}>')

# 2. Fix the headers. 
# For Type: remove from the map array.
c = c.replace('{ key: "type", label: "Type" },', '')
# Insert a static Type header before City
c = c.replace('<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Chemist Name</th>', '<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Chemist Name</th>\n                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Type</th>')

# For Area: find the block and replace with a standard th
area_block_regex = r'<th key="area" className="[^"]*">\s*<div style={{ minWidth: "120px" }}>\s*<ColumnFilterDropdown.*?/>\s*</div>\s*</th>'
c = re.sub(area_block_regex, '<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Area</th>', c, flags=re.DOTALL)

with open('components/chemist-master.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Done')
