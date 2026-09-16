import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to remove <Check ... /> inside buttons.
    # specifically, <Check size={16} /> or <Check size={15} /> etc.
    new_content = re.sub(r'<Check\s*(?:size=\{\d+\})?\s*(?:className="[^"]*")?\s*/>\s*', '', content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk("components"):
    for file in files:
        if file.endswith(".tsx"):
            process_file(os.path.join(root, file))
