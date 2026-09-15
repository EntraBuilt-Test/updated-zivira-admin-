import os
import re

d = 'c:/Users/balam/Downloads/Zivira-Admin-main10/Zivira-Admin-main/components'
count = 0
for f in os.listdir(d):
    if f.endswith('.tsx'):
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            txt = file.read()
            
        txt_new = txt
        
        # Replace buttons with px-4 py-2 rounded-lg ... with button button-secondary
        # Target Close, Cancel, Back buttons
        txt_new = re.sub(
            r'<button\s+className=\"[^\"]*px-4\s+py-2\s+rounded-lg[^\"]*\"([^>]*)>\s*(?:<[^>]*>\s*)?(Close|Cancel|Back)\s*</button>',
            r'<button className="button button-secondary"\1>\2</button>',
            txt_new,
            flags=re.IGNORECASE
        )

        txt_new = re.sub(
            r'<button\s+className=\"[^\"]*px-4\s+py-2\s+rounded-lg[^\"]*\"([^>]*)>\s*(?:<[^>]*>\s*)?(Close|Cancel|Back)\s*</button>',
            r'<button className="button button-secondary"\1>\2</button>',
            txt_new,
            flags=re.IGNORECASE
        )
        
        txt_new = re.sub(
            r'className=\"[^\"]*px-4\s+py-2\s+rounded-lg[^\"]*bg-brand-primary[^\"]*\"',
            r'className="button"',
            txt_new
        )

        txt_new = re.sub(
            r'className=\"[^\"]*px-4\s+py-2\s+rounded-lg[^\"]*bg-red-[^\"]*\"',
            r'className="button button-danger"',
            txt_new
        )
        
        txt_new = re.sub(
            r'className=\"[^\"]*px-4\s+py-2\s+rounded-lg[^\"]*border-border-subtle[^\"]*\"',
            r'className="button button-secondary"',
            txt_new
        )
        
        # Catch any remaining px-4 py-2 rounded-lg buttons
        txt_new = re.sub(
            r'className=\"px-4\s+py-2\s+rounded-lg[^\"]*\"',
            r'className="button button-secondary"',
            txt_new
        )

        if txt != txt_new:
            with open(p, 'w', encoding='utf-8') as file:
                file.write(txt_new)
            count += 1
            print(f"Replaced in {f}")

print(f'Replaced in {count} files total')
