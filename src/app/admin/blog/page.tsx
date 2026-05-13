import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminBlogPage() {
  const supabase = createServerClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Blog Editor</h1>
        <Button variant="primary" asChild>
          <Link href="/admin/blog/edit/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Slug</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts?.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-sm font-medium text-text-primary">
                  {post.title}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-text-muted">
                  {post.slug}
                </td>
                <td className="px-6 py-4 text-sm text-text-muted">
                  <span className="tag">{post.category}</span>
                </td>
                <td className="px-6 py-4">
                  {post.is_published ? (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Published</span>
                  ) : (
                    <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Draft</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/blog/edit/${post.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {(!posts || posts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  No blog posts found. Create your first post!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
