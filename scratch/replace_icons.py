import re

file_path = "c:/Users/balam/Downloads/Zivira-Admin-main10/Zivira-Admin-main/components/admin-compliance-dashboard.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    r'<i className="fa-solid fa-magnifying-glass([^"]*)"></i>': r'<span className="material-symbols-outlined\1">search</span>',
    r'<i className="fa-solid fa-chevron-down([^"]*)"></i>': r'<span className="material-symbols-outlined\1">expand_more</span>',
    r'<i className="fa-solid fa-arrows-rotate([^"]*)"></i>': r'<span className="material-symbols-outlined\1">sync</span>',
    r'<i className="fa-regular fa-bell([^"]*)"></i>': r'<span className="material-symbols-outlined\1">notifications</span>',
    r'<i className="fa-regular fa-clock([^"]*)"></i>': r'<span className="material-symbols-outlined\1">schedule</span>',
    r'<i className="fa-regular fa-file-arrow-down([^"]*)"></i>': r'<span className="material-symbols-outlined\1">download</span>',
    r'<i className="fa-regular fa-shield-check([^"]*)"></i>': r'<span className="material-symbols-outlined\1">verified_user</span>',
    r'<i className="fa-solid fa-badge-check([^"]*)"></i>': r'<span className="material-symbols-outlined\1">verified</span>',
    r'<i className="fa-solid fa-triangle-exclamation([^"]*)"></i>': r'<span className="material-symbols-outlined\1">warning</span>',
    r'<i className="fa-solid fa-pills([^"]*)"></i>': r'<span className="material-symbols-outlined\1">medication</span>',
    r'<i className="fa-solid fa-hand-holding-hand([^"]*)"></i>': r'<span className="material-symbols-outlined\1">volunteer_activism</span>',
    r'<i className="fa-regular fa-clipboard-list-check([^"]*)"></i>': r'<span className="material-symbols-outlined\1">assignment_turned_in</span>',
    r'<i className="fa-regular fa-box-circle-check([^"]*)"></i>': r'<span className="material-symbols-outlined\1">inventory_2</span>',
    r'<i className="fa-regular fa-user-shield([^"]*)"></i>': r'<span className="material-symbols-outlined\1">admin_panel_settings</span>',
    r'<i className="fa-regular fa-scale-balanced([^"]*)"></i>': r'<span className="material-symbols-outlined\1">balance</span>',
    r'<i className="fa-regular fa-arrow-rotate-left([^"]*)"></i>': r'<span className="material-symbols-outlined\1">undo</span>',
    r'<i className="fa-solid fa-chevron-right([^"]*)"></i>': r'<span className="material-symbols-outlined\1">chevron_right</span>',
    r'<i className="fa-solid fa-chevron-left([^"]*)"></i>': r'<span className="material-symbols-outlined\1">chevron_left</span>',
    r'<i className="fa-solid fa-file-contract([^"]*)"></i>': r'<span className="material-symbols-outlined\1">contract</span>',
    r'<i className="fa-solid fa-shield-halved([^"]*)"></i>': r'<span className="material-symbols-outlined\1">gpp_good</span>',
    r'<i className="fa-regular fa-ban([^"]*)"></i>': r'<span className="material-symbols-outlined\1">block</span>',
    r'<i className="fa-regular fa-badge-check([^"]*)"></i>': r'<span className="material-symbols-outlined\1">verified</span>'
}

for pattern, repl in replacements.items():
    content = re.sub(pattern, repl, content)

content = re.sub(r'className="material-symbols-outlined([^"]*)text-xs([^"]*)"', r'className="material-symbols-outlined\1text-[16px]\2"', content)
content = re.sub(r'className="material-symbols-outlined([^"]*)text-lg([^"]*)"', r'className="material-symbols-outlined\1text-[24px]\2"', content)
content = re.sub(r'className="material-symbols-outlined([^"]*)text-\[10px\]([^"]*)"', r'className="material-symbols-outlined\1text-[14px]\2"', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Icons replaced.")
