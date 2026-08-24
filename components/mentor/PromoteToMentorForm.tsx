'use client';

import { promoteToMentor } from '@/server/actions/students';

export function PromoteToMentorForm({
    studentId,
    studentName,
}: {
    studentId: string;
    studentName: string;
}) {
    return (
        <form
            action={promoteToMentor}
            onSubmit={(e) => {
                const confirmat = confirm(
                    `Sigur vrei să promovezi pe ${studentName} la mentor? Nu există buton de retrogradare din interfață.`,
                );
                if (!confirmat) {
                    e.preventDefault();
                }
            }}
            className="inline"
        >
            <input type="hidden" name="id" value={studentId} />
            <button type="submit" className="text-indigo-600 hover:underline">
                Promovează la mentor
            </button>
        </form>
    );
}
