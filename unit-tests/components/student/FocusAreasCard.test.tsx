import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FocusAreasCard } from '@/components/dashboard/FocusAreasCard';
import { FocusArea } from '@/server/supabase/dashboardService';

describe('Unit Test - <FocusAreasCard />', () => {
    const mockFocusAreas: FocusArea[] = [
        {
            id: 1,
            categoryName: 'Backend',
            topicTitle: 'Indexing în PostgreSQL',
            advice: 'Revizuiește indecșii B-Tree vs GIN.',
            resources: [{ title: 'PostgreSQL Docs', url: 'https://postgresql.org' }],
        },
    ];

    const mockAllRecommendations: FocusArea[] = [
        ...mockFocusAreas,
        {
            id: 2,
            categoryName: 'Frontend',
            topicTitle: 'React Server Components',
            advice: 'Înțelege diferența de execuție client vs server.',
            createdAt: '26 aug. 2026',
            resources: [],
        },
    ];

    it('afișează ariile recomandate și link-ul asociat', () => {
        render(
            <FocusAreasCard
                focusAreas={mockFocusAreas}
                allRecommendations={mockAllRecommendations}
            />
        );

        expect(screen.getByText('Indexing în PostgreSQL')).toBeDefined();
        expect(screen.getByText('PostgreSQL Docs')).toBeDefined();

        const link = screen.getByRole('link', { name: /postgresql docs/i });
        expect(link.getAttribute('href')).toBe('https://postgresql.org');
        expect(link.getAttribute('target')).toBe('_blank');
    });

    it('generează link de căutare Google dacă nu există resurse predefinite', () => {
        render(
            <FocusAreasCard
                focusAreas={[{
                    id: 3,
                    categoryName: 'DevOps',
                    topicTitle: 'Docker Networks',
                    advice: 'Studiu rețele bridge.',
                    resources: [],
                }]}
                allRecommendations={[]}
            />
        );

        const searchLink = screen.getByRole('link', { name: /caută pe google/i });
        expect(searchLink.getAttribute('href')).toContain('https://www.google.com/search?q=Docker%20Networks');
    });

    it('deschide și închide modalul de istoric complet', () => {
        render(
            <FocusAreasCard
                focusAreas={mockFocusAreas}
                allRecommendations={mockAllRecommendations}
            />
        );

        // La început, titlul modalului nu este vizibil
        expect(screen.queryByText(/istoric recomandări & resurse/i)).toBeNull();

        // Apăsăm butonul de deschidere
        const openBtn = screen.getByRole('button', { name: /vezi toate recomandările/i });
        fireEvent.click(openBtn);

        // Modalul este acum vizibil și conține a doua recomandare
        expect(screen.getByText(/istoric recomandări & resurse/i)).toBeDefined();
        expect(screen.getByText('React Server Components')).toBeDefined();

        // Închidem modalul din butonul X
        const closeBtn = screen.getByRole('button', { name: /închide fereastra/i });
        fireEvent.click(closeBtn);

        expect(screen.queryByText(/istoric recomandări & resurse/i)).toBeNull();
    });
});