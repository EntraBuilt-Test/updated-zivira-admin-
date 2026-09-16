import os
import re

d = 'c:/Users/balam/Downloads/Zivira-Admin-main10/Zivira-Admin-main/components'
count = 0
for f in os.listdir(d):
    if f.endswith('.tsx'):
        p = os.path.join(d, f)
        with open(p, 'r', encoding='utf-8') as file:
            txt = file.read()
            
        # Replace complex tailwind string with button button-secondary for Close buttons
        txt_new = re.sub(
            r'<button className=\"px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-border-subtle bg-surface-subtle text-text-primary hover:bg-border-subtle(.*?)\"(.*?)>\s*Close\s*</button>',
            r'<button className="button button-secondary"\2>Close</button>',
            txt
        )
        
        # Also fix the one without anything after hover:bg-border-subtle
        txt_new = re.sub(
            r'<button className=\"px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-border-subtle bg-surface-subtle text-text-primary hover:bg-border-subtle\"(.*?)>\s*Close\s*</button>',
            r'<button className="button button-secondary"\1>Close</button>',
            txt_new
        )
        
        # Also fix Cancel button for delete Modals!
        txt_new = re.sub(
            r'<button className=\"px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-border-subtle bg-surface-subtle text-text-primary hover:bg-border-subtle(.*?)\"(.*?)>\s*Cancel\s*</button>',
            r'<button className="button button-secondary"\2>Cancel</button>',
            txt_new
        )
        txt_new = re.sub(
            r'<button className=\"px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-border-subtle bg-surface-subtle text-text-primary hover:bg-border-subtle\"(.*?)>\s*Cancel\s*</button>',
            r'<button className="button button-secondary"\1>Cancel</button>',
            txt_new
        )

        # Also fix "Yes, deactivate" or similar action buttons in delete modals
        txt_new = re.sub(
            r'<button className=\"px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm\"(.*?)>',
            r'<button className="button button-danger"\1>',
            txt_new
        )
        
        if txt != txt_new:
            with open(p, 'w', encoding='utf-8') as file:
                file.write(txt_new)
            count += 1
            print(f"Replaced in {f}")

print(f'Replaced in {count} files total')
