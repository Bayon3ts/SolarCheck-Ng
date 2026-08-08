'use client';

import { useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { X, Plus, Loader2 } from 'lucide-react';

interface InstallerMultiMediaUploadProps {
  currentImages: string[];
  onUpload: (urls: string[]) => void;
  maxPhotos?: number;
}

export function InstallerMultiMediaUpload({ currentImages = [], onUpload, maxPhotos = 10 }: InstallerMultiMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (currentImages.length + files.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos in total.`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFile = files.find(f => !allowedTypes.includes(f.type) || f.size > 5 * 1024 * 1024);
    
    if (invalidFile) {
      setError('Please upload JPG, PNG or WebP images under 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    const newUrls: string[] = [];

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not logged in. Please log in again.');
        setUploading(false);
        return;
      }

      for (const file of files) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `gallery/${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('installer_public_media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          console.error('[MultiMediaUpload] Supabase error:', uploadError);
          continue; // Skip failed uploads but continue with others
        }

        const { data: urlData } = supabase.storage.from('installer_public_media').getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          newUrls.push(urlData.publicUrl);
        }
      }

      if (newUrls.length > 0) {
        onUpload([...currentImages, ...newUrls]);
      } else if (files.length > 0) {
         setError('Failed to upload images. Check permissions.');
      }
    } catch (err) {
      console.error('[MultiMediaUpload] Unexpected:', err);
      setError('Unexpected error during upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  function handleRemove(indexToRemove: number) {
    const newImages = currentImages.filter((_, i) => i !== indexToRemove);
    onUpload(newImages);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {currentImages.map((url, index) => {
          const hasError = imageErrors[url];
          return (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
              {!hasError ? (
                <Image 
                  src={url} 
                  alt={`Gallery photo ${index + 1}`} 
                  fill 
                  unoptimized={true}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover" 
                  onError={() => setImageErrors(prev => ({ ...prev, [url]: true }))}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                  <span className="text-2xl mb-1">🖼️</span>
                  <span className="text-[10px] font-semibold leading-tight">Image unavailable</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {currentImages.length < maxPhotos && (
          <div
            className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <>
                <Plus className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-xs font-semibold text-gray-500">Add Photo</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      
      <p className="text-[10px] text-gray-500">
        Upload up to {maxPhotos} photos. Supported formats: JPG, PNG, WebP (Max 5MB each).
      </p>
    </div>
  );
}
