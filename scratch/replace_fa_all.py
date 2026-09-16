import re
import glob

files = glob.glob('components/admin-payroll-dashboard.tsx') + \
        glob.glob('components/admin-product-exposure-dashboard.tsx') + \
        glob.glob('components/admin-territory-coverage-dashboard.tsx')

replacements = {
    'fa-arrow-left': 'arrow_back',
    'fa-arrows-rotate': 'sync',
    'fa-rotate-left': 'refresh',
    'fa-users': 'group',
    'fa-clock': 'schedule',
    'fa-triangle-exclamation': 'warning',
    'fa-user-xmark': 'person_remove',
    'fa-arrow-trend-up': 'trending_up',
    'fa-chart-column': 'bar_chart',
    'fa-arrow-right': 'arrow_forward',
    'fa-magnifying-glass': 'search',
    'fa-chevron-down': 'expand_more',
    'fa-chevron-right': 'chevron_right',
    'fa-chevron-left': 'chevron_left',
    'fa-wallet': 'account_balance_wallet',
    'fa-route': 'route',
    'fa-receipt': 'receipt',
    'fa-user-check': 'how_to_reg',
    'fa-calculator-simple': 'calculate',
    'fa-file-invoice-dollar': 'request_quote',
    'fa-download': 'download',
    'fa-sliders': 'tune',
    'fa-tablet-screen-button': 'tablet_mac',
    'fa-stopwatch': 'timer',
    'fa-chart-pie': 'pie_chart',
    'fa-prescription': 'medication',
    'fa-cloud-arrow-up': 'cloud_upload',
    'fa-flask-vial': 'science',
    'fa-laptop-medical': 'medical_information',
    'fa-file-export': 'file_download',
    'fa-map-pin': 'location_on',
    'fa-chart-line': 'show_chart',
    'fa-user-doctor': 'medical_services',
    'fa-compass-drafting': 'architecture',
    'fa-prescription-bottle-medical': 'vaccines',
    'fa-user-tie': 'tie',
    'fa-user-shield': 'admin_panel_settings',
    'fa-plus-circle': 'add_circle',
    'fa-map-location-dot': 'pin_drop'
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
