import os

filepath = r"c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main\components\admin-alerts-dashboard.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace brand-orange
content = content.replace("brand-orangeHover", "brand-primary-hover")
content = content.replace("brand-orange", "brand-primary")
content = content.replace("orange-50", "brand-primary-subtle")
content = content.replace("orange-950", "brand-primary")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated admin-alerts-dashboard.tsx")
