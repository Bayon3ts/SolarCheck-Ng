"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

const MarkdownPreview = ({ content }: { content: string }) => {
  const formatted = content
    .replace(/^### (.+)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">');

  return (
    <div 
      className="prose prose-sm max-w-none p-6 text-text-primary"
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-4">${formatted}</p>` 
      }}
    />
  );
};

export default function EditPostPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Solar Basics");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isNew) {
      const fetchPost = async () => {
        const { data } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", params.id)
          .single();
        if (data) {
          setTitle(data.title);
          setSlug(data.slug);
          setCategory(data.category);
          setContent(data.content);
          setIsPublished(data.is_published);
          setCoverImage(data.cover_image || "");
          setCoverImageAlt(data.cover_image_alt || "");
          setExcerpt(data.excerpt || "");
        }
      };
      fetchPost();
    }
  }, [params.id, isNew, supabase]);

  const handleSave = async () => {
    setLoading(true);
    
    // Get current user for author field
    const { data: { user } } = await supabase.auth.getUser();
    const author = user?.email || "Admin";

    const postData = {
      title,
      slug,
      category,
      content,
      author,
      excerpt: excerpt || null,
      is_published: isPublished,
      status: isPublished ? 'published' : 'draft',
      published_at: isPublished ? new Date().toISOString() : null,
      cover_image: coverImage || null,
      cover_image_alt: coverImageAlt || null,
    };

    if (isNew) {
      const { error } = await supabase.from("blog_posts").upsert([postData], { onConflict: 'slug' });
      if (error) {
        console.error("[BlogSave] Error inserting post:", error);
        alert(`Failed to save post: ${error.message}`);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("blog_posts").update(postData).eq("id", params.id);
      if (error) {
        console.error("[BlogSave] Error updating post:", error);
        alert(`Failed to update post: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
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
            <label
              htmlFor="isPublished"
              className="text-sm font-medium text-text-primary"
            >
              Published
            </label>
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Editor Pane */}
        <div className="w-1/2 flex flex-col border-r border-border bg-gray-50 p-6 overflow-y-auto">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none font-mono text-sm text-text-muted"
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Category
                </label>
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

            {/* Excerpt */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-primary">
                Excerpt
                <span className="text-text-muted font-normal ml-2">
                  Shown in blog listing and Google preview
                </span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a 1-2 sentence summary of this post..."
                maxLength={160}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary resize-none text-text-primary text-sm placeholder:text-text-muted bg-white"
              />
              <p className="text-xs text-text-muted text-right">
                {excerpt.length}/160 characters
              </p>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-primary">
                Cover Image
                <span className="text-text-muted font-normal ml-2">
                  (shown in blog listing + social shares)
                </span>
              </label>
              <ImageUpload
                currentImage={coverImage || null}
                onUpload={(url: string) => {
                  console.log('[BlogEditor] Cover image URL:', url);
                  setCoverImage(url);
                }}
                altValue={coverImageAlt}
                onAltChange={setCoverImageAlt}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-text-primary mb-1 flex justify-between">
              <span>Content (MDX)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full p-4 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none font-mono text-sm resize-none min-h-[300px]"
              placeholder="Write your MDX content here..."
            />
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="w-1/2 bg-white p-8 overflow-y-auto prose max-w-none">
          {coverImage && (
            <img
              src={coverImage}
              alt={coverImageAlt || title}
              className="w-full h-48 object-cover rounded-xl mb-6"
            />
          )}
          <h1 className="text-4xl font-bold mb-8">{title || "Post Title"}</h1>
          {content ? (
            <MarkdownPreview content={content} />
          ) : (
            <p className="text-text-muted text-sm p-6 italic">
              Start typing to see preview...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
