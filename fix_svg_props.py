import os
import glob

files = glob.glob("components/admin-*-dashboard.tsx")
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('stroke-linecap=', 'strokeLinecap=')
    content = content.replace('stroke-linejoin=', 'strokeLinejoin=')
    content = content.replace('stroke-width=', 'strokeWidth=')
    content = content.replace('fill-rule=', 'fillRule=')
    content = content.replace('clip-rule=', 'clipRule=')
    content = content.replace('viewbox=', 'viewBox=')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed SVG props in all dashboard files.")
