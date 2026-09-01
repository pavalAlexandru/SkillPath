'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Date personale</h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Numele afișat în platformă și adresa de email.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="px-3.5 py-1.5 text-xs font-bold"
                >
                    {isEditing ? 'Anulează' : 'Modifică'}
                </Button>
            </div>

            <div className="space-y-4 pt-2">
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
                            onClick={() => {
                                setIsSaving(true);
                                setTimeout(() => {
                                    setIsSaving(false);
                                    setIsEditing(false);
                                }, 400);
                            }}
                            className="px-5 py-2 text-xs font-bold"
                        >
                            {isSaving ? 'Se salvează...' : 'Salvează modificările'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}