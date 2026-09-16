import os
import glob
import re

components_dir = r"c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main\components"
files = glob.glob(os.path.join(components_dir, "*.tsx"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Remove Plus icons
    new_content = re.sub(r'<Plus[^>]*>\s*', '', new_content)
    # Remove Check icons
    new_content = re.sub(r'<Check[^>]*>\s*', '', new_content)
    
    # Alert Dashboard colors
    if "admin-alerts-dashboard" in file:
        new_content = new_content.replace("brand-orangeHover", "brand-primary-hover")
        new_content = new_content.replace("brand-orange", "brand-primary")
        new_content = new_content.replace("orange-50", "brand-primary-subtle")
        new_content = new_content.replace("orange-950", "brand-primary")
        
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(file)}")

print("Done.")
