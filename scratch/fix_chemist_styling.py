import re
with open('components/chemist-master.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update the table class
c = c.replace('<table className="subdivision-table">', '<table className="w-full text-left border-collapse">')

# 2. Update the tr class in the tbody
c = c.replace('<tr key={row.id}>', '<tr key={row.id} className="hover:bg-surface-subtle/50 border-b border-border-subtle transition-colors">')

# 3. Update the td classes to match generic-master-table
# First, strip existing td classNames we just added
c = re.sub(r'<td className="whitespace-nowrap"([^>]*)>', r'<td\1>', c)
c = c.replace('<td>', '<td className="text-left px-4 py-3 text-sm text-text-primary whitespace-nowrap">')
c = c.replace('<td style={{ color: "var(--muted)", fontWeight: 500 }}>', '<td className="text-left px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--muted)", fontWeight: 500 }}>')
c = c.replace('<td style={{ fontWeight: 600 }}>', '<td className="text-left px-4 py-3 text-sm whitespace-nowrap" style={{ fontWeight: 600 }}>')

# 4. In the headers, replace text-center with text-left on the specific ones
c = c.replace('<th className="px-4 py-3', '<th className="text-left px-4 py-3')
c = c.replace('<td className="px-4 py-3', '<td className="text-left px-4 py-3')

# Fix double className if any
c = re.sub(r'className="([^"]*?)"\s+className="([^"]*?)"', r'className="\1 \2"', c)

with open('components/chemist-master.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Done')
