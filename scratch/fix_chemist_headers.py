import re
import os

path = 'components/chemist-master.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace thead
c = c.replace('<thead>', '<thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">')

# Replace simple <th>...</th>
c = re.sub(r'<th>(.*?)</th>', r'<th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">\1</th>', c)

# For th with existing keys, just add className before the end of the opening tag
def replace_th(m):
    original_opening = m.group(1)
    if 'className' in original_opening:
        return m.group(0) # skip if already has class (though we can append, let's just do it manually for area)
    
    return f'<th{original_opening} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">'

c = re.sub(r'<th(.*?)>', replace_th, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done')
