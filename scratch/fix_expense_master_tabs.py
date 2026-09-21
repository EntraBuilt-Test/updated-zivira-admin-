import os

path = r'c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main\components\expense-master.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('modern-tab-button', 'modern-tab')
c = c.replace('? "active" : "inactive"', '? "active" : ""')
c = c.replace("? 'active' : 'inactive'", "? 'active' : ''")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
