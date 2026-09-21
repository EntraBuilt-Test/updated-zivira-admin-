import os
import re
import glob

for filepath in glob.glob('components/*.tsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # only modify if there are lowercase handlers with string assignments
    if ' onchange="' in content or ' onclick="' in content or ' onkeyup="' in content:
        content = re.sub(r' onchange="[^"]*"', '', content)
        content = re.sub(r' onclick="[^"]*"', '', content)
        content = re.sub(r' onkeyup="[^"]*"', '', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed", filepath)
