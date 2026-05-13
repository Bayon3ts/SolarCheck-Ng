"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Solar Basics");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isNew) {
      const fetchPost = async () => {
        const { data } = await supabase.from("blog_posts").select("*").eq("id", params.id).single();
        if (data) {
          setTitle(data.title);
          setSlug(data.slug);
          setCategory(data.category);
          setContent(data.content);
          setIsPublished(data.is_published);
        }
      };
      fetchPost();
    }
  }, [params.id, isNew, supabase]);

  const handleSave = async () => {
    setLoading(true);
    const postData = {
      title,
      slug,
      category,
      content,
      is_published: isPublished,
    };

    if (isNew) {
      await supabase.from("blog_posts").insert([postData]);
    } else {
      await supabase.from("blog_posts").update(postData).eq("id", params.id);
    }
    
    setLoading(false);
    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="text-text-muted hover:text-text-primary transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary">
            {isNew ? "Create New Post" : "Edit Post"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <input 
              type="checkbox" 
              id="isPublished" 
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-text-primary">Published</label>
          </div>
          <Button variant="primary" onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Editor Pane */}
        <div className="w-1/2 flex flex-col border-r border-border bg-gray-50 p-6 overflow-y-auto">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-primary mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none font-mono text-sm text-text-muted"
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  <option>Solar Basics</option>
                  <option>Financing</option>
                  <option>Case Studies</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-text-primary mb-1 flex justify-between">
              <span>Content (MDX)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full p-4 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none font-mono text-sm resize-none"
              placeholder="Write your MDX content here..."
            />
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="w-1/2 bg-white p-8 overflow-y-auto prose max-w-none">
          <h1 className="text-4xl font-bold mb-8">{title || "Post Title"}</h1>
          {/* Note: In a real app we'd use next-mdx-remote to render this live, 
              but for the admin preview a simple pre tag or basic markdown parser is often used 
              if MDX components aren't strictly needed in the editor preview. */}
          <div className="whitespace-pre-wrap font-mono text-sm text-text-muted opacity-50 bg-gray-50 p-4 rounded-lg">
            [MDX Live Preview Content would render here. Currently displaying raw source.]
            {"\n\n"}
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
