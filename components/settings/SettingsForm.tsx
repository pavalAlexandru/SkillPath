'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SettingsFormProps {
    initialFirstName: string;
    initialLastName: string;
    email: string;
}

export function SettingsForm({ initialFirstName, initialLastName, email }: SettingsFormProps) {
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
        }, 400);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Parolele nu coincid.' });
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage(null);

        setTimeout(() => {
            setPasswordLoading(false);
            setPasswordMessage({ type: 'success', text: 'Parola a fost actualizată cu succes.' });
            resetPasswordForm();
        }, 600);
    };

    const resetPasswordForm = () => {
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="space-y-6">
            {/* Card Date Personale */}
            <Card className="space-y-6 border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Date personale</h2>
                        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                            Numele afișat în platformă și adresa de email.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant={isEditing ? "outline" : "secondary"}
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="px-3.5 py-1.5 text-xs font-bold"
                    >
                        {isEditing ? 'Anulează' : 'Modifică'}
                    </Button>
                </div>

                <div className="space-y-4 pt-1">
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Email
                        </span>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {email || 'student@test.com'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Prenume
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                                />
                            ) : (
                                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Nume
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                                />
                            ) : (
                                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{lastName}</p>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end pt-3">
                            <Button
                                type="button"
                                variant="primary"
                                disabled={isSaving}
                                onClick={handleSaveProfile}
                                className="px-5 py-2 text-xs font-bold"
                            >
                                {isSaving ? 'Se salvează...' : 'Salvează modificările'}
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Card Parolă */}
            <Card className="space-y-6 border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Parolă</h2>
                        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">Parola folosită la autentificare.</p>
                    </div>
                    {!isChangingPassword && (
                        <Button variant="outline" onClick={() => setIsChangingPassword(true)} className="px-3.5 py-1.5 text-xs font-bold">
                            Schimbă parola
                        </Button>
                    )}
                </div>

                {passwordMessage && (
                    <div className={`rounded-xl border p-3.5 text-xs font-semibold ${
                        passwordMessage.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                        {passwordMessage.text}
                    </div>
                )}

                {isChangingPassword ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Parola curentă</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Parola nouă</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                            />
                            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Minim 6 caractere.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Confirmă parola nouă</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" variant="primary" disabled={passwordLoading} className="px-5 py-2 text-xs font-bold">
                                {passwordLoading ? 'Se salvează...' : 'Salvează parola'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetPasswordForm} disabled={passwordLoading} className="px-4 py-2 text-xs font-bold">
                                Anulează
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Parolă</span>
                        <p className="mt-1 text-sm tracking-widest text-slate-900 dark:text-white">••••••••</p>
                    </div>
                )}
            </Card>
        </div>
    );
}