'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { updateNameAction, changePasswordAction } from '@/server/actions/settings';

interface SettingsFormProps {
    initialFirstName: string;
    initialLastName: string;
    email: string;
}

export function SettingsForm({ initialFirstName, initialLastName, email }: SettingsFormProps) {
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const res = await updateNameAction({ firstName, lastName });

            if (res?.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: 'Datele au fost salvate.' });
                setIsEditing(false);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'A apărut o eroare la salvare.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFirstName(initialFirstName);
        setLastName(initialLastName);
        setMessage(null);
        setIsEditing(false);
    };

    const resetPasswordForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMessage(null);
        setIsChangingPassword(false);
    };

    const handlePasswordSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordMessage(null);
        setPasswordLoading(true);

        try {
            const res = await changePasswordAction({ currentPassword, newPassword, confirmPassword });

            if (res?.error) {
                setPasswordMessage({ type: 'error', text: res.error });
            } else {
                resetPasswordForm();
                setPasswordMessage({ type: 'success', text: 'Parola a fost schimbată.' });
            }
        } catch (err) {
            console.error(err);
            setPasswordMessage({ type: 'error', text: 'A apărut o eroare la schimbarea parolei.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Date personale</h2>
                        <p className="text-sm text-slate-500">Numele afișat în platformă.</p>
                    </div>
                    {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            Modifică
                        </Button>
                    )}
                </div>

                {message && (
                    <div className={`rounded-md p-4 text-sm ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                            />
                            <p className="mt-1 text-xs text-slate-400">Emailul nu poate fi modificat momentan.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Prenume</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nume</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Se salvează...' : 'Salvează modificările'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
                                Anulează
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Email</p>
                            <p className="text-sm text-slate-900">{email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Prenume</p>
                            <p className="text-sm text-slate-900">{firstName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Nume</p>
                            <p className="text-sm text-slate-900">{lastName}</p>
                        </div>
                    </div>
                )}
            </Card>

            <Card className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Parolă</h2>
                        <p className="text-sm text-slate-500">Parola folosită la autentificare.</p>
                    </div>
                    {!isChangingPassword && (
                        <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                            Schimbă parola
                        </Button>
                    )}
                </div>

                {passwordMessage && (
                    <div className={`rounded-md p-4 text-sm ${
                        passwordMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                        {passwordMessage.text}
                    </div>
                )}

                {isChangingPassword ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Parola curentă</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Parola nouă</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <p className="mt-1 text-xs text-slate-400">Minim 6 caractere.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Confirmă parola nouă</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" variant="primary" disabled={passwordLoading}>
                                {passwordLoading ? 'Se salvează...' : 'Salvează parola'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetPasswordForm} disabled={passwordLoading}>
                                Anulează
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <p className="text-xs font-medium text-slate-500">Parolă</p>
                        <p className="text-sm tracking-widest text-slate-900">••••••••</p>
                    </div>
                )}
            </Card>
        </div>
    );
}