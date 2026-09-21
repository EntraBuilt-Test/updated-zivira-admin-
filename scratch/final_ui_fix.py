import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Remove Plus icon from Add buttons
    new_content = new_content.replace("<Plus size={16} /> ", "")
    new_content = new_content.replace("<Plus className=\"w-4 h-4 mr-2\" />", "")
    new_content = new_content.replace("<Plus size={15} /> ", "")
    
    # Fix 'subdivision-head' spacing (gap and margin)
    new_content = new_content.replace("mb-4", "mb-6")
    new_content = new_content.replace("gap-2", "gap-4")
    
    # Check if there are "Field Force Entries" that need to look like buttons
    new_content = new_content.replace("className=\"text-lg font-semibold text-text-primary\"", "className=\"text-lg font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-md inline-block\"")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk("components"):
    for file in files:
        if file.endswith(".tsx"):
            process_file(os.path.join(root, file))

for root, _, files in os.walk("app"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".css"):
            process_file(os.path.join(root, file))
