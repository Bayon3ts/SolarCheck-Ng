import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify the caller is an authenticated admin
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ?.split(",")
    .map((e) => e.trim().toLowerCase()) ?? [];

  const isAdmin =
    user?.user_metadata?.role === "admin" ||
    (user?.email && adminEmails.includes(user.email.toLowerCase()));

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("blog_posts")
    .delete()
    .eq("id", params.id);

  if (error) {
    console.error("[DELETE /api/admin/blog/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
