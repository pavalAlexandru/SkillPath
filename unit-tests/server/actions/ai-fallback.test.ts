import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
    generateContent: vi.fn(),
}));

vi.mock('@google/genai', () => ({
    GoogleGenAI: class {
        models = { generateContent: mocks.generateContent };
    },
}));

import { generateContentWithFallback } from '@/server/actions/ai-fallback';

describe('generateContentWithFallback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        (globalThis as Record<string, unknown>).activeModelIndex = 0;
    });

    it('limitează timeout-ul și reîncercările SDK-ului ca să cadă rapid pe următorul model', async () => {
        mocks.generateContent.mockResolvedValue({ text: 'ok' });

        await generateContentWithFallback('prompt', { responseMimeType: 'application/json' });

        const arg = mocks.generateContent.mock.calls[0][0];
        expect(arg.config.responseMimeType).toBe('application/json');
        expect(arg.config.httpOptions.timeout).toBe(30_000);
        expect(arg.config.httpOptions.retryOptions.attempts).toBe(2);
    });

    it('trece la următorul model când primul răspunde 503', async () => {
        mocks.generateContent
            .mockRejectedValueOnce(Object.assign(new Error('high demand'), { status: 503 }))
            .mockResolvedValueOnce({ text: 'ok' });

        const response = await generateContentWithFallback('prompt');

        expect(response.text).toBe('ok');
        expect(mocks.generateContent).toHaveBeenCalledTimes(2);
        expect(mocks.generateContent.mock.calls[0][0].model).not.toBe(mocks.generateContent.mock.calls[1][0].model);
    });

    it('reține modelul care a funcționat pentru apelurile următoare', async () => {
        mocks.generateContent
            .mockRejectedValueOnce(Object.assign(new Error('high demand'), { status: 503 }))
            .mockResolvedValue({ text: 'ok' });

        await generateContentWithFallback('prompt');
        const modelCareAMers = mocks.generateContent.mock.calls[1][0].model;

        await generateContentWithFallback('prompt');

        expect(mocks.generateContent.mock.calls[2][0].model).toBe(modelCareAMers);
    });
});
