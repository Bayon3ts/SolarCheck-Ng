import os
import glob

def refactor_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    if "server.ts" in filepath:
        new_content = new_content.replace(
            "export function createServerClient()", 
            "export async function createServerClient()"
        )
        new_content = new_content.replace(
            "const cookieStore = cookies();", 
            "const cookieStore = await cookies();"
        )
    else:
        # replace createServerClient calls
        new_content = new_content.replace(
            "= createServerClient();", 
            "= await createServerClient();"
        )
        new_content = new_content.replace(
            "= createServerClient()", 
            "= await createServerClient()"
        )
        # fix double awaits if happened
        new_content = new_content.replace("await await", "await")
        
        # Also replace standalone cookies() references
        new_content = new_content.replace(
            "const cookieStore = cookies();",
            "const cookieStore = await cookies();"
        )

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Refactored: {filepath}")

files = [
    "src/components/sections/blog-teaser.tsx",
    "src/lib/supabase/server.ts",
    "src/app/dashboard/page.tsx",
    "src/app/installers/[slug]/page.tsx",
    "src/app/auth/signout/route.ts",
    "src/app/auth/callback/route.ts",
    "src/app/blog/page.tsx",
    "src/app/api/admin/blog/[id]/route.ts",
    "src/app/solar-installers/page.tsx",
    "src/app/blog/[slug]/page.tsx",
    "src/app/solar-installers/[state]/[city]/page.tsx",
    "src/app/admin/installers/page.tsx",
    "src/app/admin/layout.tsx",
    "src/app/admin/leads/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/webhooks/page.tsx",
    "src/app/admin/reviews/page.tsx"
]

for f in files:
    refactor_file(f)

print("Done")
