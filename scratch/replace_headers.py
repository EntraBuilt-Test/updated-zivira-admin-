import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match subdivision-head
    pattern = re.compile(
        r'<div\s+className="subdivision-head">.*?<p\s+className="subdivision-eyebrow">([^<]+)</p>\s*<h2[^>]*>([^<]+)</h2>\s*<p>([^<]+)</p>\s*</div>\s*<div\s+className="subdivision-actions">\s*(.*?)\s*</div>\s*</div>',
        re.DOTALL
    )

    def repl(m):
        eyebrow = m.group(1).strip()
        title = m.group(2).strip()
        description = m.group(3).strip()
        actions = m.group(4).strip()
        
        # If there are no actions, omit the action prop
        if actions:
            return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title="{title}"\n  description="{description}"\n  action={{\n    <>\n{actions}\n    </>\n  }}\n/>'
        else:
            return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title="{title}"\n  description="{description}"\n/>'

    new_content = pattern.sub(repl, content)

    # Some files might not have <p> description or might have different structures. Let's try a more forgiving regex.
    pattern2 = re.compile(
        r'<div\s+className="subdivision-head">.*?<p\s+className="subdivision-eyebrow">([^<]+)</p>\s*<h2[^>]*>([^<]+)</h2>\s*<p>([^<]*)</p>\s*</div>\s*(?:<div\s+className="subdivision-actions">\s*(.*?)\s*</div>)?\s*</div>',
        re.DOTALL
    )

    def repl2(m):
        eyebrow = m.group(1).strip()
        title = m.group(2).strip()
        description = m.group(3).strip()
        actions = m.group(4)
        actions = actions.strip() if actions else ""
        
        if actions:
            return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title="{title}"\n  description="{description}"\n  action={{\n    <>\n{actions}\n    </>\n  }}\n/>'
        else:
            return f'<PageHeader\n  eyebrow="{eyebrow}"\n  title="{title}"\n  description="{description}"\n/>'
            
    if new_content == content:
        new_content = pattern2.sub(repl2, content)

    if new_content != content:
        # Need to add import PageHeader if not present
        if 'PageHeader' not in new_content:
            # We can't easily find the last import, so we'll just put it after the first import
            import_statement = 'import { PageHeader } from "@/components/page-components";\n'
            # Or if it already has page-components import, we can add it there.
            if 'import { PageHeader' not in new_content:
                lines = new_content.splitlines(True)
                for i, line in enumerate(lines):
                    if line.startswith('import '):
                        lines.insert(i, import_statement)
                        break
                new_content = "".join(lines)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

if __name__ == "__main__":
    components_dir = "components"
    for filename in os.listdir(components_dir):
        if filename.endswith(".tsx"):
            process_file(os.path.join(components_dir, filename))
