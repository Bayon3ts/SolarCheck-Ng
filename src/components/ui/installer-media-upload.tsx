'use client';

import { useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';

interface InstallerMediaUploadProps {
  currentImage: string | null;
  onUpload: (url: string) => void;
  kind: 'logo' | 'cover';
}

/**
 * Reusable image uploader for installer logo / cover banner.
 * Separate from the blog ImageUpload component (which is hardcoded to the
 * 'blog-images' bucket) so neither has to be touched to support the other.
 * Uploads to the 'installer-media' bucket, under logos/ or covers/.
 */
export function InstallerMediaUpload({ currentImage, onUpload, kind }: InstallerMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const isLogo = kind === 'logo';
  const recommended = isLogo ? '400\u00d7400px, square' : '1200\u00d7400px, wide banner';
  const heightClass = isLogo ? 'h-32' : 'h-40';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Maximum 5MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not logged in. Please refresh the page and log in again.');
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${isLogo ? 'logos' : 'covers'}/${fileName}`;

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 85));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('installer-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error('[InstallerMediaUpload] Supabase error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          setError('Storage not configured. Contact admin: bucket "installer-media" missing.');
        } else if (uploadError.message.includes('not authorized') || uploadError.message.includes('403')) {
          setError('Permission denied. Check Supabase storage policies for installer-media bucket.');
        } else {
          setError(`Upload failed: ${uploadError.message}`);
        }
        setUploading(false);
        setProgress(0);
        return;
      }

      const { data: urlData } = supabase.storage.from('installer-media').getPublicUrl(filePath);
      if (!urlData?.publicUrl) {
        setError('Upload succeeded but could not get image URL. Check bucket is set to Public.');
        setUploading(false);
        return;
      }

      setProgress(100);
      await new Promise((r) => setTimeout(r, 300));
      onUpload(urlData.publicUrl);
    } catch (err) {
      console.error('[InstallerMediaUpload] Unexpected:', err);
      setError('Unexpected error. Check your internet connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation(); // prevent triggering the upload click
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {currentImage ? (
        <div 
          className="relative rounded-2xl overflow-hidden border border-gray-200 cursor-pointer group"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className={`relative w-full ${heightClass} bg-gray-50`}>
            <Image src={currentImage} alt={`${kind} preview`} fill className="object-cover transition-opacity group-hover:opacity-80" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              Change {isLogo ? 'Logo' : 'Banner'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold shadow-md z-10"
            title="Remove image"
          >
            &#10005;
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#0A5C36] hover:bg-[#0A5C36]/5 transition-colors ${heightClass} flex flex-col items-center justify-center`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="text-3xl mb-2">{isLogo ? '\ud83c\udfe2' : '\ud83c\udfde\ufe0f'}</div>
          <p className="font-semibold text-sm text-gray-800">
            Click to upload {isLogo ? 'company logo' : 'profile banner'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG or WebP &middot; Max 5MB &middot; Recommended: {recommended}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <span className="text-red-500 flex-shrink-0 mt-0.5">&#9888;</span>
          <div>
            <p className="text-xs font-semibold text-red-700">Upload failed</p>
            <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#0A5C36] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}