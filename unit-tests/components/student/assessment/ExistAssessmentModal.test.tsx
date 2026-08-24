import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExitAssessmentModal } from '@/components/assessment/ExitAssessmentModal';

describe('ExitAssessmentModal Component', () => {
    it('nu randează nimic dacă isOpen este false', () => {
        const { container } = render(
            <ExitAssessmentModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('randează titlul și textul de avertizare când isOpen este true', () => {
        render(
            <ExitAssessmentModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
        );

        expect(screen.getByText('Sigur vrei să părăsești testul?')).toBeDefined();
        expect(screen.getByText(/Progresul tău actual și răspunsurile selectate vor fi pierdute/i)).toBeDefined();
    });

    it('apelează onClose la apăsarea butonului "Rămâi în test"', () => {
        const onCloseMock = vi.fn();
        render(
            <ExitAssessmentModal isOpen={true} onClose={onCloseMock} onConfirm={vi.fn()} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Rămâi în test/i }));
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('apelează onConfirm la apăsarea butonului "Părăsește testul"', () => {
        const onConfirmMock = vi.fn();
        render(
            <ExitAssessmentModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirmMock} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Părăsește testul/i }));
        expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });
});