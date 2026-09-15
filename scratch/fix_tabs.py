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
            
            # Replace inline styling for generic tabs container
            # Like: <div style={{ display: "flex", gap: "2px", background: "var(--line)", padding: "2px", borderRadius: "8px", width: "fit-content", marginBottom: "16px" }}>
            content = re.sub(
                r'<div style={{ display: "flex", gap: "2px", background: "var\(--line\)", padding: "2px", borderRadius: "8px", width: "fit-content", marginBottom: "16px" }}>',
                r'<div className="modern-tabs mb-4">',
                content
            )
            content = re.sub(
                r'<div style={{ display: "flex", gap: "2px", background: "var\(--line\)", padding: "2px", borderRadius: "8px", width: "fit-content", marginBottom: "20px" }}>',
                r'<div className="modern-tabs mb-5">',
                content
            )
            content = re.sub(
                r'<div style={{ display: "flex", gap: "2px", background: "var\(--line\)", padding: "2px", borderRadius: "8px", width: "fit-content"([^}]*)}}>',
                r'<div className="modern-tabs">',
                content
            )

            # Tab buttons
            # <button ... style={{ padding: "6px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", background: activeTab === t.id ? "white" : "transparent", color: activeTab === t.id ? "var(--ink)" : "var(--muted)", boxShadow: activeTab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
            # >
            content = re.sub(
                r'style={{[^}]*background: (activeTab === \w+\.id|activeTab === "[^"]+") \? "white" : "transparent"[^}]*}}',
                r'className={`modern-tab ${\1 ? "active" : ""}`}',
                content
            )
            
            # Additional replace for specific tab variables
            content = re.sub(
                r'style={{[^}]*background: (activeSubTab === \w+\.id|activeSubTab === "[^"]+"|activeSubTab === \w+\.masterKey) \? "white" : "transparent"[^}]*}}',
                r'className={`modern-tab ${\1 ? "active" : ""}`}',
                content
            )

            if content != original_content:
                print(f"Updated tabs in {f}")
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
