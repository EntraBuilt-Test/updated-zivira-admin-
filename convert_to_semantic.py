import os
import glob
import re

files = glob.glob("components/admin-*-dashboard.tsx")
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Backgrounds
    content = re.sub(r'\bbg-white\b', 'bg-surface-card', content)
    content = re.sub(r'\bbg-slate-50\b', 'bg-surface-subtle', content)
    content = re.sub(r'\bbg-slate-100\b', 'bg-surface-subtle', content)
    
    # Borders
    content = re.sub(r'\bborder-slate-200\b', 'border-border-subtle', content)
    content = re.sub(r'\bborder-slate-300\b', 'border-border-subtle', content)
    
    # Texts
    content = re.sub(r'\btext-slate-900\b', 'text-text-primary', content)
    content = re.sub(r'\btext-slate-800\b', 'text-text-primary', content)
    content = re.sub(r'\btext-slate-700\b', 'text-text-secondary', content)
    content = re.sub(r'\btext-slate-600\b', 'text-text-secondary', content)
    content = re.sub(r'\btext-slate-500\b', 'text-text-secondary', content)
    content = re.sub(r'\btext-slate-400\b', 'text-text-muted', content)
    
    # Status badges
    content = re.sub(r'\bbg-emerald-50\b', 'bg-status-success-bg', content)
    content = re.sub(r'\btext-emerald-700\b', 'text-status-success', content)
    content = re.sub(r'\bborder-emerald-200\b', 'border-status-success-bg', content)
    
    content = re.sub(r'\bbg-amber-50\b', 'bg-status-warning-bg', content)
    content = re.sub(r'\btext-amber-700\b', 'text-status-warning', content)
    content = re.sub(r'\bborder-amber-200\b', 'border-status-warning-bg', content)
    
    content = re.sub(r'\bbg-blue-50\b', 'bg-status-info-bg', content)
    content = re.sub(r'\btext-blue-700\b', 'text-status-info', content)
    content = re.sub(r'\bborder-blue-200\b', 'border-status-info-bg', content)
    
    content = re.sub(r'\bbg-red-50\b', 'bg-status-danger-bg', content)
    content = re.sub(r'\btext-red-700\b', 'text-status-danger', content)
    content = re.sub(r'\bborder-red-200\b', 'border-status-danger-bg', content)

    # Primary brand colors
    content = re.sub(r'\bbg-\[\#b43403\]\b', 'bg-primary', content)
    content = re.sub(r'\btext-\[\#b43403\]\b', 'text-primary', content)
    content = re.sub(r'\bhover:bg-\[\#9a3412\]\b', 'hover:bg-brand-primary-hover', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Semantic classes applied to all dashboard files.")
