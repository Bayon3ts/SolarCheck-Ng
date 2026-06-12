'use client';

import { useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage: string | null;
  onUpload: (url: string) => void;
  onAltChange: (alt: string) => void;
  altValue: string;
}

export function ImageUpload({
  currentImage,
  onUpload,
  onAltChange,
  altValue,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG or WebP image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Maximum 5MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Create Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Not logged in. Please refresh the page and log in again.');
        setUploading(false);
        return;
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `blog-covers/${fileName}`;

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 200);

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error('[ImageUpload] Supabase error:', {
          message: uploadError.message,
          error: uploadError,
        });

        if (uploadError.message.includes('Bucket not found')) {
          setError('Storage not configured. Contact admin: bucket "blog-images" missing.');
        } else if (uploadError.message.includes('not authorized') || uploadError.message.includes('403')) {
          setError('Permission denied. Check Supabase storage policies for blog-images bucket.');
        } else if (uploadError.message.includes('duplicate')) {
          setError('Upload conflict. Please try again.');
        } else {
          setError(`Upload failed: ${uploadError.message}`);
        }

        setUploading(false);
        setProgress(0);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        setError('Upload succeeded but could not get image URL. Check bucket is set to Public.');
        setUploading(false);
        return;
      }

      setProgress(100);

      // Small delay to show 100% before completing
      await new Promise(r => setTimeout(r, 300));

      onUpload(urlData.publicUrl);
      console.log('[ImageUpload] Success:', urlData.publicUrl);
    } catch (err) {
      console.error('[ImageUpload] Unexpected:', err);
      setError('Unexpected error. Check your internet connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  function handleRemove() {
    onUpload('');
    onAltChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (currentImage) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-border">
        <div className="relative w-full h-48">
          <Image
            src={currentImage}
            alt={altValue}
            fill
            className="object-cover"
          />
        </div>
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
    <div>
      <div
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        onClick={() => !uploading && fileInputRef.current?.click()}
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
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-xs font-semibold text-red-700">Upload failed</p>
            <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="animate-spin inline-block">⏳</span>
              Uploading image...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
