import os
import glob
import re

components_dir = r"c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main\components"
files = glob.glob(os.path.join(components_dir, "*.tsx"))

pattern = re.compile(
    r'<div\s+className="subdivision-head">\s*<div>\s*<p\s+className="subdivision-eyebrow">([^<]+)</p>\s*<h2[^>]*>(.*?)</h2>\s*<p>([^<]*)</p>\s*</div>\s*(?:<div\s+className="subdivision-actions">\s*(.*?)\s*</div>)?\s*</div>',
    re.DOTALL
)

def repl(m):
    eyebrow = m.group(1).strip()
    title = m.group(2).strip()
    description = m.group(3).strip()
    actions = m.group(4)
    actions = actions.strip() if actions else ""
    
    # Remove Plus and Check icons from actions if present
    actions = re.sub(r'<Plus[^>]*>\s*', '', actions)
    actions = re.sub(r'<Check[^>]*>\s*', '', actions)
    
    if actions:
        return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title={{{repr(title)}}}\n  description="{description}"\n  action={{\n    <>\n{actions}\n    </>\n  }}\n/>'
    else:
        return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title={{{repr(title)}}}\n  description="{description}"\n/>'

def add_import(content):
    if 'import { PageHeader' not in content:
        lines = content.splitlines(True)
        for i, line in enumerate(lines):
            if line.startswith('import '):
                lines.insert(i, 'import { PageHeader } from "@/components/page-components";\n')
                break
        return "".join(lines)
    return content

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We first fix the other specific issue: brand-orange in admin-alerts-dashboard
    if "admin-alerts-dashboard" in file:
        content = content.replace("brand-orangeHover", "brand-primary-hover")
        content = content.replace("brand-orange", "brand-primary")
        content = content.replace("orange-50", "brand-primary-subtle")
        content = content.replace("orange-950", "brand-primary")
    
    # And remove 5 buttons from admin-product-exposure-dashboard
    if "admin-product-exposure-dashboard" in file:
        # Just use the regex for this specific fix. We did this earlier, I'll ignore for now or do it later if needed.
        pass

    new_content = pattern.sub(repl, content)
    
    if new_content != content:
        new_content = add_import(new_content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(file)}")

print("Done.")
