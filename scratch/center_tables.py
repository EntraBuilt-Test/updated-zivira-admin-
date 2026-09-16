import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('className="w-full text-left', 'className="w-full text-center')

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
        if file.endswith(".tsx"):
            process_file(os.path.join(root, file))
