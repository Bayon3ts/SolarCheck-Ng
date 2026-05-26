'use client';

import { useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  altValue: string;
}

export function ImageUpload({
  value,
  onChange,
  onAltChange,
  altValue,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Simulate progress before upload
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 80 ? prev + 10 : prev));
    }, 200);

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    clearInterval(progressInterval);

    if (error) {
      alert('Upload failed. Try again.');
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadProgress(100);

    const {
      data: { publicUrl },
    } = supabase.storage.from('blog-images').getPublicUrl(filename);

    onChange(publicUrl);
    setUploading(false);
    setUploadProgress(0);
  }

  function handleRemove() {
    onChange('');
    onAltChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // --- States ---

  if (uploading) {
    return (
      <div className="border border-border rounded-2xl p-8 text-center bg-white">
        <div className="text-3xl mb-2 animate-spin inline-block">⏳</div>
        <p className="text-text-muted text-sm mt-2">Uploading image...</p>
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-border">
        <img
          src={value}
          alt={altValue}
          className="w-full h-48 object-cover"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold shadow-md"
        >
          ✕
        </button>
        <div className="p-3 bg-gray-50 border-t border-border">
          <input
            type="text"
            placeholder="Image alt text (for SEO and accessibility)"
            value={altValue}
            onChange={(e) => onAltChange(e.target.value)}
            className="w-full text-sm outline-none bg-transparent text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="text-4xl mb-3">🖼️</div>
      <p className="font-semibold text-text-primary">Click to upload cover image</p>
      <p className="text-sm text-text-muted mt-1">
        JPG, PNG or WebP · Max 5MB · Recommended: 1200×630px
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
