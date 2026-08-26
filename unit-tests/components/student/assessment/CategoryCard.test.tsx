import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryCard } from '@/components/assessment/CategoryCard';

describe('CategoryCard Component', () => {
    it('afișează starea inițială când testul nu a fost susținut niciodată', () => {
        render(
            <CategoryCard
                id={1}
                name="OOP Fundamentals"
                description="Concepte de bază OOP"
                level="JUNIOR"
            />
        );

        expect(screen.getByText('OOP Fundamentals')).toBeDefined();
        expect(screen.getByText(/Începe Evaluarea/i)).toBeDefined();
        expect(screen.getByText(/NETESTAT/i)).toBeDefined();
    });

    it('afișează badge-ul PROMOVAT și butonul de recapitulare când scorul este >= 90%', () => {
        render(
            <CategoryCard
                id={1}
                name="OOP Fundamentals"
                description="Concepte de bază OOP"
                level="JUNIOR"
                progress={{
                    categoryId: 1,
                    lastScore: 95,
                    passed: true,
                    completedAt: '2026-08-21T10:00:00Z',
                }}
            />
        );

        expect(screen.getByText(/PROMOVAT/i)).toBeDefined();
        expect(screen.getByText(/95/)).toBeDefined();
        expect(screen.getByText(/Revizuiește Materialul/i)).toBeDefined();
    });

    it('afișează badge-ul REVIZUIRE și Încearcă din nou când scorul este sub 90%', () => {
        render(
            <CategoryCard
                id={1}
                name="OOP Fundamentals"
                description="Concepte de bază OOP"
                level="JUNIOR"
                progress={{
                    categoryId: 1,
                    lastScore: 40,
                    passed: false,
                    completedAt: '2026-08-21T10:00:00Z',
                }}
            />
        );

        expect(screen.getByText(/REVIZUIRE/i)).toBeDefined();
        expect(screen.getByText(/40/)).toBeDefined();
        expect(screen.getByText(/Încearcă din nou/i)).toBeDefined();
    });
});