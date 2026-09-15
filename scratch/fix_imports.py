import os
import glob

components_dir = r"c:\Users\balam\Downloads\Zivira-Admin-main10\Zivira-Admin-main\components"
files = glob.glob(os.path.join(components_dir, "*.tsx"))

fixed_count = 0
for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "<PageHeader" in content and "PageHeader" not in content[:content.find("<PageHeader")]:
        # Missing import
        if "import { PageHeader }" not in content:
            # Add import
            import_statement = 'import { PageHeader } from "@/components/page-components";\n'
            # Insert after the last import or at the beginning
            lines = content.split('\n')
            last_import = -1
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import = i
            
            if last_import != -1:
                lines.insert(last_import + 1, import_statement.strip())
            else:
                lines.insert(0, import_statement.strip())
                
            new_content = '\n'.join(lines)
            with open(file, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Fixed missing import in {os.path.basename(file)}")
            fixed_count += 1

print(f"Fixed {fixed_count} files.")
