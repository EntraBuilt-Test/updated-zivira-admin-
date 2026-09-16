import os
import re

d = 'components'
for f in os.listdir(d):
    if f.endswith('.tsx'):
        path = os.path.join(d, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        new_content = re.sub(r'style=\{ textDecoration: "none" \}', r'style={{ textDecoration: "none" }}', content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Fixed {f}")
