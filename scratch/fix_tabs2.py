import os

directory = r'c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main\components'

for root, _, files in os.walk(directory):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original_content = content
            
            # Simple string replacements instead of regex
            target1 = '<div style={{ display: "flex", gap: "2px", background: "var(--line)", padding: "2px", borderRadius: "8px", width: "fit-content", marginBottom: "16px" }}>'
            target2 = '<div style={{ display: "flex", gap: "2px", background: "var(--line)", padding: "2px", borderRadius: "8px", width: "fit-content", marginBottom: "20px" }}>'
            target3 = '<div style={{ display: "flex", gap: "2px", background: "var(--line)", padding: "2px", borderRadius: "8px", width: "fit-content" }}>'
            
            content = content.replace(target1, '<div className="modern-tabs mb-4">')
            content = content.replace(target2, '<div className="modern-tabs mb-5">')
            content = content.replace(target3, '<div className="modern-tabs">')

            # We need regex for the button because it has dynamic variable checks
            import re
            
            # Replace inline tab buttons
            content = re.sub(
                r'style={{[^}]*background: (activeTab === \w+\.id|activeTab === "[^"]+"|activeTab === \w+\.masterKey) \? "white" : "transparent"[^}]*}}',
                r'className={`modern-tab ${\1 ? "active" : ""}`}',
                content
            )
            content = re.sub(
                r'style={{[^}]*background: (activeSubTab === \w+\.id|activeSubTab === "[^"]+"|activeSubTab === \w+\.masterKey) \? "white" : "transparent"[^}]*}}',
                r'className={`modern-tab ${\1 ? "active" : ""}`}',
                content
            )

            if content != original_content:
                print(f"Updated tabs in {f}")
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
