import os
import re

d = 'components'
for f in os.listdir(d):
    if f.endswith('.tsx'):
        path = os.path.join(d, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        original = content
        
        # Remove <Plus ... />
        content = re.sub(r'<Plus[^>]*>\s*', '', content)
        
        # Replace "+ Add" with "Add"
        content = re.sub(r'\+\s*Add\b', 'Add', content)
        
        if content != original:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Removed plus symbol in {f}")
