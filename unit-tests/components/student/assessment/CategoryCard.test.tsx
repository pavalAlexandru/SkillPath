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
        expect(screen.getByText('Start Assessment')).toBeDefined();
        expect(screen.queryByText(/PASSED/i)).toBeNull();
        expect(screen.queryByText(/REVIEW/i)).toBeNull();
    });

    it('afișează badge-ul PASSED și Review Material când scorul este >= 60%', () => {
        render(
            <CategoryCard
                id={1}
                name="OOP Fundamentals"
                description="Concepte de bază OOP"
                level="JUNIOR"
                progress={{
                    categoryId: 1,
                    lastScore: 85,
                    passed: true,
                    completedAt: '2026-08-21T10:00:00Z',
                }}
            />
        );

        expect(screen.getByText(/PASSED/i)).toBeDefined();
        expect(screen.getByText('85%')).toBeDefined();
        expect(screen.getByText('Review Material')).toBeDefined();
    });

    it('afișează badge-ul REVIEW și Try again când scorul este < 60%', () => {
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

        expect(screen.getByText(/REVIEW/i)).toBeDefined();
        expect(screen.getByText('40%')).toBeDefined();
        expect(screen.getByText('Try again')).toBeDefined();
    });
});