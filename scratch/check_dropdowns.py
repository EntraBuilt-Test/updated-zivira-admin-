import os
files = [
    'components/manager-allowance-automatic.tsx',
    'components/manager-sfc-updation.tsx',
    'components/manager-work-type-allowance.tsx',
    'components/manager-expense-report.tsx'
]
with open('check_dropdowns.txt', 'w', encoding='utf-8') as out:
    for f in files:
        path = os.path.join(r'c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main', f)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
                lines = content.split('\n')
                out.write(f'\n--- {f} ---\n')
                for i, line in enumerate(lines):
                    if 'position: "absolute"' in line or 'className="command-select' in line or 'position:"absolute"' in line or 'absolute' in line:
                        start = max(0, i-2)
                        end = min(len(lines), i+8)
                        out.write(f'\nMatches around line {i+1}:\n')
                        out.write('\n'.join(lines[start:end]) + '\n')
