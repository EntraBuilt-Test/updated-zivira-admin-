import sys
import re

def convert_html_to_jsx(html_content, component_name):
    # Extract <main>...</main>
    main_match = re.search(r'(<main[^>]*data-purpose="dashboard-main"[^>]*>.*?</main>)', html_content, re.DOTALL)
    if not main_match:
        main_match = re.search(r'(<main[^>]*>.*?</main>)', html_content, re.DOTALL)
    
    if not main_match:
        print(f"Could not find <main> block in {component_name}")
        return
        
    jsx = main_match.group(1)
    
    # 1. Convert class= to className=
    jsx = jsx.replace('class="', 'className="')
    
    # 2. Convert for= to htmlFor=
    jsx = jsx.replace('for="', 'htmlFor="')
    
    # 3. Handle onclick and onchange
    # We'll just remove the onclick="..." entirely to avoid breaking JSX
    jsx = re.sub(r'onclick="[^"]*"', '', jsx)
    jsx = re.sub(r'onchange="[^"]*"', '', jsx)
    
    # 4. Handle self-closing tags: img, input, hr, br, path, circle, svg tags
    # Wait, in standard HTML these might be <path d="..."></path>. If we self close <path d="..." /> then we have </path> left over!
    # Instead, let's only self-close tags that are void in HTML: img, input, hr, br.
    # We will remove </path>, </circle>, </rect>, </line>, </polyline>, </polygon> if we self-close them, OR just let the HTML parser keep them as <path></path>. Actually, <path d="..."></path> is valid JSX! We don't need to self close path, circle, etc. JSX accepts them as long as they are closed.
    # HTML void elements that NEED self-closing in JSX: img, input, hr, br
    for tag in ['img', 'input', 'hr', 'br']:
        jsx = re.sub(r'<(%s\b[^>]*?)(?<!/)>' % tag, r'<\1 />', jsx)
        
    # 5. Fix inline styles
    def style_replacer(match):
        style_str = match.group(1)
        styles = []
        for prop in style_str.split(';'):
            prop = prop.strip()
            if not prop: continue
            if ':' not in prop: continue
            k, v = prop.split(':', 1)
            k = k.strip()
            v = v.strip().replace("'", '"')
            # camelCase key
            k_parts = k.split('-')
            k_camel = k_parts[0] + ''.join(x.title() for x in k_parts[1:])
            styles.append(f"{k_camel}: '{v}'")
        return 'style={{ ' + ', '.join(styles) + ' }}'
        
    jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)
    
    # 6. HTML comments <!-- --> to {/* */}
    jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx, flags=re.DOTALL)
    
    # 7. Convert SVG attributes to camelCase
    svg_attrs = {
        'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin',
        'stroke-width': 'strokeWidth',
        'viewbox': 'viewBox',
        'fill-rule': 'fillRule',
        'clip-rule': 'clipRule',
        'stroke-dasharray': 'strokeDasharray',
        'stroke-dashoffset': 'strokeDashoffset',
    }
    for old, new in svg_attrs.items():
        jsx = jsx.replace(old + '="', new + '="')
        
    # Build component
    component = f"""import React from 'react';
import {{ ZiviraTreeNode }} from "@/packages/types/src/zivira-tree";

export function {component_name}({{ node, path }}: {{ node: ZiviraTreeNode; path: string[] }}) {{
  return (
{jsx}
  );
}}
"""
    return component

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_stitch.py <input.html> <ComponentName> <output.tsx>")
        sys.exit(1)
        
    in_file = sys.argv[1]
    comp_name = sys.argv[2]
    out_file = sys.argv[3]
    
    with open(in_file, 'r', encoding='utf-8') as f:
        html = f.read()
        
    jsx = convert_html_to_jsx(html, comp_name)
    
    if jsx:
        with open(out_file, 'w', encoding='utf-8') as f:
            f.write(jsx)
        print(f"Successfully wrote {out_file}")
