'use client';

import { useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, Video, X, Upload } from 'lucide-react';

interface InstallerVideoUploadProps {
    currentVideoUrl: string;
    onUpload: (url: string) => void;
}

const MAX_SIZE_MB = 100;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Uploads a video file directly to Supabase storage instead of relying on a
 * pasted YouTube/Vimeo link. Self-hosted video renders as a plain <video>
 * tag on the public profile (see getVideoEmbed's "direct" case) — no iframe,
 * no embedding-permission dependency on an external site, so it never hits
 * the "This content is blocked" error a disabled-embedding YouTube link can.
 */
export function InstallerVideoUpload({ currentVideoUrl, onUpload }: InstallerVideoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Only treat it as "our own upload" if it's actually in our storage bucket —
    // a pasted YouTube/Vimeo URL should still show as a link, not a raw <video> preview.
    const isOwnUpload = currentVideoUrl?.includes('installer_public_media');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Please upload an MP4, WebM, or MOV video file.');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`Video must be under ${MAX_SIZE_MB}MB.`);
            return;
        }

        setUploading(true);
        setError(null);

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

            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `videos/${session.user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('installer_public_media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type,
                });

            if (uploadError) {
                console.error('[InstallerVideoUpload] Supabase error:', uploadError);
                setError(`Upload failed: ${uploadError.message}`);
                return;
            }

            const { data: urlData } = supabase.storage.from('installer_public_media').getPublicUrl(filePath);
            if (urlData?.publicUrl) {
                onUpload(urlData.publicUrl);
            } else {
                setError('Upload succeeded but the file URL could not be retrieved.');
            }
        } catch (err) {
            console.error('[InstallerVideoUpload] Unexpected:', err);
            setError('Unexpected error during upload.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {isOwnUpload ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video
                        key={currentVideoUrl}
                        controls
                        preload="metadata"
                        crossOrigin="anonymous"
                        className="w-full max-h-64"
                    >
                        <source src={currentVideoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <button
                        type="button"
                        onClick={() => onUpload('')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        title="Remove video"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div
                    className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors py-8"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                            <span className="text-xs font-semibold text-gray-500">Uploading…</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-xs font-semibold text-gray-500">Upload a video file</span>
                            <span className="text-[10px] text-gray-400 mt-1">MP4, WebM, or MOV — up to {MAX_SIZE_MB}MB</span>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
            />

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
}