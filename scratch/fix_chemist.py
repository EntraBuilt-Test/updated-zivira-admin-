import os

path = 'components/chemist-master.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<h3 className="section-title">Doctor</h3>', '')
c = c.replace('<th>Edit</th>\n                  <th>Inactive</th>', '<th colSpan={2}>Actions</th>')
c = c.replace('<th>Edit</th>\\n                  <th>Inactive</th>', '<th colSpan={2}>Actions</th>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Done")
