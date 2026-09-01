'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/server/supabase/client';
import { updateAvatarUrl } from '@/server/actions/profile';
import { Button } from '@/components/ui/Button';

interface AvatarUploadProps {
    userId: string;
    currentAvatarUrl?: string | null;
    userName: string;
}

export function AvatarUpload({ userId, currentAvatarUrl, userName }: AvatarUploadProps) {
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl ?? null);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initials = userName
        ? userName.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrorMsg('Te rugăm să alegi un fișier de tip imagine (JPG, PNG, WebP).');
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            setErrorMsg('Dimensiunea maximă a imaginii este de 3MB.');
            return;
        }

        setErrorMsg('');
        setSuccessMsg('');
        setUploading(true);

        try {
            const supabase = getSupabaseClient();
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const res = await updateAvatarUrl(publicUrl);
            if (res.error) throw new Error(res.error);

            setAvatarUrl(publicUrl);
            setSuccessMsg('Fotografia de profil a fost actualizată!');

            // Reîmprospătează datele din layout pentru ca Navbar-ul să afișeze imediat noua poză
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message || 'A apărut o eroare la salvarea fotografiei.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-6">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-100 bg-indigo-50 shadow-xs">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={userName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-xl font-black text-indigo-600">
                            {initials}
                        </span>
                    )}
                </div>

                <div className="space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploading ? 'Se încarcă...' : 'Schimbă fotografia'}
                    </Button>
                    <p className="text-xs text-slate-400">
                        Formate suportate: JPG, PNG sau WebP (max. 3MB).
                    </p>
                </div>
            </div>

            {errorMsg && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                    {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                    {successMsg}
                </div>
            )}
        </div>
    );
}