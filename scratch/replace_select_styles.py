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
        
        # Replace highly specific inline style strings for select elements
        style_regex_1 = r'style=\{\{\s*width:\s*"100%",\s*padding:\s*"8px 12px",\s*borderRadius:\s*"6px",\s*border:\s*"1px solid #e5e7eb",\s*outline:\s*"none",\s*fontSize:\s*"14px",\s*background:\s*"var\(--panel\)"\s*\}\}'
        
        txt_new = re.sub(
            r'<select([^>]*)' + style_regex_1 + r'([^>]*)>',
            r'<select className="input"\1\2>',
            txt_new
        )

        style_regex_2 = r'style=\{\{\s*width:\s*"100%",\s*padding:\s*"8px 12px",\s*borderRadius:\s*"6px",\s*border:\s*"1px solid #e5e7eb",\s*outline:\s*"none",\s*fontSize:\s*"14px",\s*background:\s*"var\(--surface-card\)"\s*\}\}'
        
        txt_new = re.sub(
            r'<select([^>]*)' + style_regex_2 + r'([^>]*)>',
            r'<select className="input"\1\2>',
            txt_new
        )

        style_regex_3 = r'style=\{\{\s*width:\s*"100%",\s*padding:\s*"8px 12px",\s*borderRadius:\s*"6px",\s*border:\s*"1px solid #e5e7eb",\s*outline:\s*"none",\s*fontSize:\s*"14px"\s*\}\}'

        txt_new = re.sub(
            r'<select([^>]*)' + style_regex_3 + r'([^>]*)>',
            r'<select className="input"\1\2>',
            txt_new
        )

        # Catch remaining <select> elements that have NO className or style
        # But we must be careful not to match `<select ` that already has className
        txt_new = re.sub(
            r'<select(?![^>]*className=)([^>]*)>',
            r'<select className="input"\1>',
            txt_new
        )
        
        # Finally, some <select className="..."> might have hardcoded bad classes instead of `input`
        # Or `className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"`
        long_class = r'className=\"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50\"'
        
        txt_new = re.sub(
            r'<select([^>]*)' + long_class + r'([^>]*)>',
            r'<select className="input"\1\2>',
            txt_new
        )

        if txt != txt_new:
            with open(p, 'w', encoding='utf-8') as file:
                file.write(txt_new)
            count += 1
            print(f"Replaced in {f}")

print(f'Replaced in {count} files total')
