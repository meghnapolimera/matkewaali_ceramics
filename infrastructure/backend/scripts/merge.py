#!/usr/bin/env python3
"""Merges resources/*.yaml files into a single SAM template.yaml."""
import glob
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
infra_dir = os.path.dirname(script_dir)

with open(os.path.join(infra_dir, 'template.base.yaml'), 'r') as f:
    base = f.read().rstrip()

lines = ['Resources:']
for resource_file in sorted(glob.glob(os.path.join(infra_dir, 'resources', '*.yaml'))):
    with open(resource_file, 'r') as f:
        for line in f:
            stripped = line.rstrip('\n')
            lines.append('  ' + stripped if stripped else '')

output_path = os.path.join(infra_dir, 'template.yaml')
with open(output_path, 'w') as f:
    f.write(base + '\n\n')
    f.write('\n'.join(lines) + '\n')

resource_count = sum(1 for l in lines if l and not l.startswith('  ') or (l.startswith('  ') and not l.startswith('    ')))
print(f'Generated template.yaml')
