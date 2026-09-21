import os
import re
import glob

for filepath in glob.glob('components/*.tsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix checked=\"checked\"
    content = re.sub(r'checked=\"[^\"]*\"', 'checked={true}', content)
    # Fix checked=\"\"
    content = re.sub(r'checked=\"\"', 'checked={true}', content)

    # Fix defaultChecked=\"\"
    content = re.sub(r'defaultChecked=\"[^\"]*\"', 'defaultChecked={true}', content)
    
    # Fix disabled=\"disabled\"
    content = re.sub(r'disabled=\"[^\"]*\"', 'disabled={true}', content)
    # Fix disabled=\"\"
    content = re.sub(r'disabled=\"\"', 'disabled={true}', content)

    # Fix selected=\"selected\"
    content = re.sub(r'selected=\"[^\"]*\"', 'selected={true}', content)
    # Fix selected=\"\"
    content = re.sub(r'selected=\"\"', 'selected={true}', content)

    # Fix rows=\"2\" or any number
    content = re.sub(r'rows=\"(\d+)\"', r'rows={\1}', content)
    
    # Fix cols=\"...\"
    content = re.sub(r'cols=\"(\d+)\"', r'cols={\1}', content)

    # Fix preserveaspectratio
    content = content.replace('preserveaspectratio=', 'preserveAspectRatio=')
    
    # Fix stroke-dasharray (just in case)
    content = content.replace('stroke-dasharray=', 'strokeDasharray=')
    # Fix stroke-dashoffset
    content = content.replace('stroke-dashoffset=', 'strokeDashoffset=')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print('Fixed string to boolean, number, and svg props')
