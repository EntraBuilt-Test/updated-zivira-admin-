import os
import re

directory = r'c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main\components'

for root, _, files in os.walk(directory):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original_content = content
            
            # Use regex to match the container with any whitespace variations
            content = re.sub(
                r'<div\s+style=\{\{\s*display:\s*"flex",\s*gap:\s*"2px",\s*background:\s*"var\(--line\)",\s*padding:\s*"2px",\s*borderRadius:\s*"8px",\s*width:\s*"fit-content",\s*marginBottom:\s*"16px"\s*\}\}>',
                r'<div className="modern-tabs mb-4">',
                content
            )
            content = re.sub(
                r'<div\s+style=\{\{\s*display:\s*"flex",\s*gap:\s*"2px",\s*background:\s*"var\(--line\)",\s*padding:\s*"2px",\s*borderRadius:\s*"8px",\s*width:\s*"fit-content",\s*marginBottom:\s*"20px"\s*\}\}>',
                r'<div className="modern-tabs mb-5">',
                content
            )
            content = re.sub(
                r'<div\s+style=\{\{\s*display:\s*"flex",\s*gap:\s*"2px",\s*background:\s*"var\(--line\)",\s*padding:\s*"2px",\s*borderRadius:\s*"8px",\s*width:\s*"fit-content"\s*\}\}>',
                r'<div className="modern-tabs">',
                content
            )

            # Replace inline tab buttons
            content = re.sub(
                r'style=\{\{[^}]*background:\s*(activeTab === \w+\.id|activeTab === "[^"]+"|activeTab === \w+\.masterKey)\s*\?\s*"white"\s*:\s*"transparent"[^}]*\}\}',
                r'className={`modern-tab ${\1 ? "active" : ""}`}',
                content
            )
            content = re.sub(
                r'style=\{\{[^}]*background:\s*(activeSubTab === \w+\.id|activeSubTab === "[^"]+"|activeSubTab === \w+\.masterKey)\s*\?\s*"white"\s*:\s*"transparent"[^}]*\}\}',
                r'className={`modern-tab ${\1 ? "active" : ""}`}',
                content
            )

            if content != original_content:
                print(f"Updated tabs in {f}")
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
