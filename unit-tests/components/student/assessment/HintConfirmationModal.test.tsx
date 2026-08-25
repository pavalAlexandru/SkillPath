import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HintConfirmationModal } from '@/components/assessment/HintConfirmationModal';

describe('HintConfirmationModal UI Component', () => {
    it('does not render when isOpen is false', () => {
        const { container } = render(
            <HintConfirmationModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders correctly when isOpen is true', () => {
        render(
            <HintConfirmationModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
        );
        expect(screen.getByText('Confirmare Indiciu')).toBeDefined();
        expect(screen.getByText(/Ai dreptul la/i)).toBeDefined();
    });

    it('calls onClose when clicking "Anulează"', () => {
        const onCloseMock = vi.fn();
        render(
            <HintConfirmationModal isOpen={true} onClose={onCloseMock} onConfirm={vi.fn()} />
        );
        const cancelButton = screen.getByRole('button', { name: /Anulează/i });
        fireEvent.click(cancelButton);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('calls onConfirm when clicking "Folosește indiciul"', () => {
        const onConfirmMock = vi.fn();
        render(
            <HintConfirmationModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirmMock} />
        );
        const confirmButton = screen.getByRole('button', { name: /Folosește indiciul/i });
        fireEvent.click(confirmButton);
        expect(onConfirmMock).toHaveBeenCalled();
    });
});
