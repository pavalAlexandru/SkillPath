import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getQuickHint } from '@/server/actions/ai-hint';
import { generateContentWithFallback } from '@/server/actions/ai-fallback';

vi.mock('@/server/actions/ai-fallback', () => ({
    generateContentWithFallback: vi.fn(),
}));

describe('ai-hint action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('returns the generated hint text', async () => {
        (generateContentWithFallback as any).mockResolvedValue({
            text: 'Acesta este un indiciu util.'
        });

        const result = await getQuickHint('Ce este React?', ['Bibliotecă', 'Framework', 'Limbaj']);
        
        expect(generateContentWithFallback).toHaveBeenCalled();
        expect(result).toBe('Acesta este un indiciu util.');
    });

    it('returns a fallback message when generateContentWithFallback fails', async () => {
        (generateContentWithFallback as any).mockRejectedValue(new Error('AI Error'));

        const result = await getQuickHint('Test', ['A', 'B']);

        expect(console.error).toHaveBeenCalled();
        expect(result).toBe('Serviciul de indicii este indisponibil momentan.');
    });

    it('returns a fallback message when response text is empty', async () => {
        (generateContentWithFallback as any).mockResolvedValue({
            text: null
        });

        const result = await getQuickHint('Test', ['A', 'B']);

        expect(result).toBe('Nu am putut genera un indiciu în acest moment.');
    });
});
