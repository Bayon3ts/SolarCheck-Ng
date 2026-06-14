import os
import re

directories = [
    'src/app/api/admin/applications/[id]/route.ts',
    'src/app/api/admin/blog/[id]/route.ts',
    'src/app/admin/blog/edit/[id]/page.tsx',
    'src/app/solar-panels/[slug]/page.tsx',
    'src/app/solar-inverters/[slug]/page.tsx',
    'src/app/solar-installers/[state]/[city]/page.tsx',
    'src/app/solar-batteries/[slug]/page.tsx',
    'src/app/installers/[slug]/page.tsx',
    'src/app/blog/[slug]/page.tsx',
]

def refactor_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change type signature Next.js 15
    # { params }: { params: { id: string } } -> { params }: { params: Promise<{ id: string }> }
    content = re.sub(r'\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{([^}]+)\}\s*\}', r'{ params }: { params: Promise<{\1}> }', content)
    content = re.sub(r'\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*(?P<tp>[\w\s\|]+)\s*\}', r'{ params }: { params: Promise<\g<tp>> }', content)
    
    # Actually wait! The regex for custom interfaces:
    # interface PageProps { params: { slug: string } }
    content = re.sub(r'params\s*:\s*\{\s*(.*?)\s*\}\s*($|;|\n)', r'params: Promise<{\1}>\2', content)

    # Change const { id } = params; to const { id } = await params;
    content = re.sub(r'const\s+\{([^}]+)\}\s*=\s*params\s*;?', r'const {\1} = await params;', content)

    # Same for params.id etc.
    content = re.sub(r'params(?:\?|!)?\.(\w+)', r'(await params).\1', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for filepath in directories:
    if os.path.exists(filepath):
        print(f"Refactoring {filepath}")
        refactor_file(filepath)
    else:
        print(f"File not found: {filepath}")
