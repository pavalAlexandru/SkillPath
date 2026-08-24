import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentRunner } from '@/components/assessment/AssessmentRunner';
import { completeAssessmentAction } from '@/server/actions/assessment';
import { useRouter } from 'next/navigation';
import { QuestionItem } from '@/types/assesments';

vi.mock('@/server/actions/assessment', () => ({
    completeAssessmentAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

const mockQuestions: QuestionItem[] = [
    {
        id: 1,
        categoryId: 1,
        questionText: 'Care este scopul interfețelor?',
        difficulty: 'EASY',
        questionType: 'SINGLE',
        options: [
            { id: 101, questionId: 1, optionText: 'Definirea unui contract', isCorrect: true },
            { id: 102, questionId: 1, optionText: 'Instanțierea de obiecte', isCorrect: false },
        ],
    },
    {
        id: 2,
        categoryId: 1,
        questionText: 'Selectați conceptele OOP:',
        difficulty: 'MEDIUM',
        questionType: 'MULTIPLE',
        options: [
            { id: 201, questionId: 2, optionText: 'Încapsulare', isCorrect: true },
            { id: 202, questionId: 2, optionText: 'Polimorfism', isCorrect: true },
            { id: 203, questionId: 2, optionText: 'CSS Grid', isCorrect: false },
        ],
    },
];

describe('AssessmentRunner UI Component', () => {
    const mockPush = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
        } as unknown as ReturnType<typeof useRouter>);
    });

    it('randează prima întrebare și afișează badge-ul de Răspuns Unic', () => {
        render(<AssessmentRunner assessmentId="1" questions={mockQuestions} />);

        expect(screen.getByText('Care este scopul interfețelor?')).toBeDefined();
        expect(screen.getByText('Răspuns Unic')).toBeDefined();
        expect(screen.getByText(/Întrebarea 1 din 2/i)).toBeDefined();
    });

    it('activează butonul de Următoarea Întrebare doar după selectarea unei opțiuni', () => {
        render(<AssessmentRunner assessmentId="1" questions={mockQuestions} />);

        const nextButton = screen.getByRole('button', { name: /Următoarea Întrebare/i });
        expect(nextButton).toHaveProperty('disabled', true);

        const option = screen.getByLabelText('Definirea unui contract');
        fireEvent.click(option);

        expect(nextButton).toHaveProperty('disabled', false);
    });

    it('permite selecție multiplă (checkbox) pe întrebările MULTIPLE și curăță regex-ul', () => {
        render(<AssessmentRunner assessmentId="1" questions={mockQuestions} />);

        // Selectăm opțiunea de la întrebarea 1 și mergem la întrebarea 2
        fireEvent.click(screen.getByLabelText('Definirea unui contract'));
        fireEvent.click(screen.getByRole('button', { name: /Următoarea Întrebare/i }));

        expect(screen.getByText(/Selectați conceptele OOP/i)).toBeDefined();
        expect(screen.getByText('Selecție Multiplă')).toBeDefined();

        const opt1 = screen.getByLabelText('Încapsulare');
        const opt2 = screen.getByLabelText('Polimorfism');

        fireEvent.click(opt1);
        fireEvent.click(opt2);

        expect((opt1 as HTMLInputElement).checked).toBe(true);
        expect((opt2 as HTMLInputElement).checked).toBe(true);
    });

    it('apelează completeAssessmentAction la apăsarea butonului Finalizează Testul', () => {
        render(<AssessmentRunner assessmentId="1" questions={mockQuestions} />);

        // Q1
        fireEvent.click(screen.getByLabelText('Definirea unui contract'));
        fireEvent.click(screen.getByRole('button', { name: /Următoarea Întrebare/i }));

        // Q2
        fireEvent.click(screen.getByLabelText('Încapsulare'));
        fireEvent.click(screen.getByLabelText('Polimorfism'));

        const finishBtn = screen.getByRole('button', { name: /Finalizează Testul/i });
        fireEvent.click(finishBtn);

        expect(completeAssessmentAction).toHaveBeenCalled();
    });

    it('deschide pop-up-ul de abandon și redirecționează la confirmare spre /assessment', () => {
        render(<AssessmentRunner assessmentId="1" questions={mockQuestions} />);

        // Click pe butonul de abandon
        const abandonBtn = screen.getByRole('button', { name: /Abandonează testul/i });
        fireEvent.click(abandonBtn);

        // Verificăm apariția modalului
        expect(screen.getByText('Sigur vrei să părăsești testul?')).toBeDefined();

        // Click pe confirmare părăsire test
        const confirmBtn = screen.getByRole('button', { name: /Părăsește testul/i });
        fireEvent.click(confirmBtn);

        expect(mockPush).toHaveBeenCalledWith('/assessment');
    });
});