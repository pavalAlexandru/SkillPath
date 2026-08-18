import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/shared/Navbar';

describe('UI Base Components', () => {
    it('randeaza butonul cu textul si varianta corecta', () => {
        render(<Button variant="primary">Conectare</Button>);
        const button = screen.getByRole('button', { name: /conectare/i });
        expect(button).toBeDefined();
        expect(button.className).toContain('bg-indigo-600');
    });

    it('randeaza cardul cu elementele copil', () => {
        render(
            <Card>
                <p>Continut Card</p>
            </Card>
        );
        expect(screen.getByText('Continut Card')).toBeDefined();
    });

    it('randeaza navbarul cu badge-ul de rol si linkurile', () => {
        const items = [{ label: 'Dashboard', href: '/dashboard' }];
        render(<Navbar roleBadge="STUDENT" userEmail="test@skillpath.ro" items={items} />);

        expect(screen.getByText('STUDENT')).toBeDefined();
        expect(screen.getByText('test@skillpath.ro')).toBeDefined();
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeDefined();
    });
});