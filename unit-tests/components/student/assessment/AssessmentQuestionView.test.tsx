import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssessmentQuestionView } from '@/components/assessment/AssessmentQuestionView';
import { getQuickHint } from '@/server/actions/ai-hint';
import { QuestionItem } from '@/types/assesments';

vi.mock('@/server/actions/ai-hint', () => ({
    getQuickHint: vi.fn(),
}));

const mockQuestion: QuestionItem = {
    id: 1,
    categoryId: 1,
    questionText: 'Care este scopul interfețelor?',
    difficulty: 'EASY',
    questionType: 'SINGLE',
    options: [
        { id: 101, questionId: 1, optionText: 'Definirea unui contract', isCorrect: true },
        { id: 102, questionId: 1, optionText: 'Instanțierea de obiecte', isCorrect: false },
    ],
};

describe('AssessmentQuestionView UI Component', () => {
    const mockOnSelectOption = vi.fn();
    const mockOnHintFetched = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the question and options correctly', () => {
        render(
            <AssessmentQuestionView
                question={mockQuestion}
                selectedOptions={[]}
                isMultiple={false}
                onSelectOption={mockOnSelectOption}
                canUseHint={true}
                onHintFetched={mockOnHintFetched}
            />
        );

        expect(screen.getByText('Care este scopul interfețelor?')).toBeDefined();
        expect(screen.getByText('Definirea unui contract')).toBeDefined();
        expect(screen.getByText('Instanțierea de obiecte')).toBeDefined();
    });

    it('calls onSelectOption when an option is clicked', () => {
        render(
            <AssessmentQuestionView
                question={mockQuestion}
                selectedOptions={[]}
                isMultiple={false}
                onSelectOption={mockOnSelectOption}
                canUseHint={true}
                onHintFetched={mockOnHintFetched}
            />
        );

        const option = screen.getByLabelText('Definirea unui contract');
        fireEvent.click(option);
        expect(mockOnSelectOption).toHaveBeenCalledWith(101);
    });

});
