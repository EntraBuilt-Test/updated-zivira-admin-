import re

files = [
    'components/admin-executive-dashboard.tsx',
    'components/admin-alerts-dashboard.tsx'
]

replacements = {
    'fa-arrow-left': 'arrow_back',
    'fa-arrows-rotate': 'sync',
    'fa-users': 'group',
    'fa-clock': 'schedule',
    'fa-triangle-exclamation': 'warning',
    'fa-user-xmark': 'person_remove',
    'fa-arrow-trend-up': 'trending_up',
    'fa-chart-column': 'bar_chart',
    'fa-arrow-right': 'arrow_forward',
    'fa-magnifying-glass': 'search'
}

def replacer(match):
    full = match.group(0)
    classes = match.group(1)
    
    icon_name = 'circle'
    for fa, mat in replacements.items():
        if fa in classes:
            icon_name = mat
            break
            
    extra_classes = re.sub(r'fa-(solid|regular|light|thin|duotone|brands)\s+|fa-[a-z0-9-]+\s*', '', classes).strip()
    new_class = f'material-symbols-outlined {extra_classes}'.strip()
    return f'<span className="{new_class}">{{`{icon_name}`}}</span>'

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r'<i\s+className=\"([^\"]*)\">\s*</i>', replacer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print("Replaced FontAwesome with Material Symbols!")
