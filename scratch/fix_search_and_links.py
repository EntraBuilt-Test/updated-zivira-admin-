import os
import re

components_dir = "components"

for filename in os.listdir(components_dir):
    if not filename.endswith(".tsx"):
        continue

    filepath = os.path.join(components_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Fix 1: Search bar container missing margin-bottom
    # <div className="flex items-center w-full max-w-sm"> -> <div className="flex items-center w-full max-w-sm mb-4">
    content = re.sub(r'<div className="flex items-center w-full max-w-sm">', r'<div className="flex items-center w-full max-w-sm mb-4">', content)

    # Fix 2: Search input having button class
    # className="button button-secondary" (only when inside the search block, but wait, let's target the search input specifically)
    # Search inputs usually have placeholder="Search by name...
    content = re.sub(r'(<input[^>]+placeholder="Search[^>]+)className="button button-secondary"', r'\1className="input w-full"', content)

    # Fix 3: Doctor / Category links that look like words (card module-card) -> buttons
    # <Link className="card module-card" href="..." style={{...}}>
    #   <h3 className="section-title">Doctor</h3>
    # </Link>
    # We want to replace it with a button link.
    def replace_link(match):
        href = match.group(1)
        text = match.group(2)
        # return a nice button link
        return f'<Link className="button button-secondary" href="{href}" style={{ textDecoration: "none" }}>\n          {text}\n        </Link>'

    content = re.sub(
        r'<Link className="card module-card" href="([^"]+)"[^>]*>\s*<h3 className="section-title">([^<]+)</h3>\s*</Link>',
        replace_link,
        content
    )

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename}")
