import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAIRecommendations, getWrongAnswers } from '@/server/actions/ai-recommendations';
import { generateContentWithFallback } from '@/server/actions/ai-fallback';

const mocks = vi.hoisted(() => ({
    fromMock: vi.fn(),
    selectMock: vi.fn(),
    eqMock: vi.fn(),
    orderMock: vi.fn(),
    insertMock: vi.fn(),
    singleMock: vi.fn(),
}));

vi.mock('@/server/supabase/server', () => ({
    createClient: () => ({
        from: mocks.fromMock,
    })
}));

vi.mock('@/server/actions/ai-fallback', () => ({
    generateContentWithFallback: vi.fn(),
}));

describe('ai-recommendations action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Default mock chain for select
        mocks.fromMock.mockReturnValue({
            select: mocks.selectMock,
            insert: mocks.insertMock,
        });

        mocks.selectMock.mockReturnValue({
            eq: mocks.eqMock,
            single: mocks.singleMock,
        });

        mocks.eqMock.mockReturnValue({
            eq: mocks.eqMock,
            order: mocks.orderMock,
        });
        
        mocks.orderMock.mockResolvedValue({ data: [] }); // For getWrongAnswers default
    });

    describe('getWrongAnswers', () => {
        it('fetches and formats wrong answers correctly', async () => {
            const dbResponse = [
                {
                    position: 1,
                    question: {
                        id: 10,
                        question_text: 'What is Next.js?',
                        category_id: 2,
                        categories: { name: 'React' },
                        options: [{ id: 100, option_text: 'Framework', is_correct: true }]
                    },
                    answers: [{ option_id: 101 }]
                }
            ];

            mocks.orderMock.mockResolvedValue({ data: dbResponse });

            const result = await getWrongAnswers(1);

            expect(mocks.fromMock).toHaveBeenCalledWith('assessment_questions');
            expect(result.wrongAnswers).toHaveLength(1);
            expect(result.wrongAnswers[0].question_id).toBe(10);
            expect(result.wrongAnswers[0].selected_option_ids).toEqual([101]);
        });
    });

    describe('generateAIRecommendations', () => {
        beforeEach(() => {
            // Re-setup eqMock to return actual data since generateAIRecommendations awaits eq directly
            mocks.eqMock.mockResolvedValue({ data: null });
        });

        it('returns existing recommendations if they exist', async () => {
            const mockExisting = [{ id: 1, topic_title: 'React' }];
            mocks.eqMock.mockResolvedValueOnce({ data: mockExisting });

            const result = await generateAIRecommendations(123, [{ question_id: 1 } as any]);

            expect(mocks.fromMock).toHaveBeenCalledWith('learning_recommendations');
            expect(result.recommendations).toEqual(mockExisting);
            expect(generateContentWithFallback).not.toHaveBeenCalled();
        });

        it('returns empty array if no wrong answers are provided', async () => {
            mocks.eqMock.mockResolvedValueOnce({ data: [] });

            const result = await generateAIRecommendations(123, []);

            expect(result.recommendations).toEqual([]);
            expect(generateContentWithFallback).not.toHaveBeenCalled();
        });

        it('generates new recommendations and saves them to the database', async () => {
            mocks.eqMock.mockResolvedValueOnce({ data: [] });

            const aiResponse = {
                recommendations: [
                    {
                        category_id: 1,
                        topic_title: 'Hooks',
                        advice_description: 'Learn hooks',
                        priority: 'HIGH',
                        search_url: 'http://google.com',
                        search_title: 'React Hooks'
                    }
                ]
            };
            (generateContentWithFallback as any).mockResolvedValue({
                text: JSON.stringify(aiResponse)
            });

            // Mock insert chain for learning_recommendations (insert -> select -> single)
            mocks.insertMock.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: 'new-rec-id' }, error: null })
                })
            });

            // Mock insert for recommendation_resources (just insert)
            mocks.insertMock.mockResolvedValueOnce({ error: null });

            const result = await generateAIRecommendations(123, [{ question_id: 1 } as any]);

            expect(generateContentWithFallback).toHaveBeenCalled();
            expect(mocks.fromMock).toHaveBeenCalledWith('learning_recommendations');
            expect(mocks.fromMock).toHaveBeenCalledWith('recommendation_resources');
            
            expect(result.recommendations).toHaveLength(1);
            expect(result.recommendations[0].id).toBe('new-rec-id');
            expect(result.recommendations[0].resources[0].url).toBe('http://google.com');
        });

        it('returns empty array on AI error', async () => {
            mocks.eqMock.mockResolvedValueOnce({ data: [] });
            (generateContentWithFallback as any).mockRejectedValue(new Error('AI Failed'));

            const result = await generateAIRecommendations(123, [{ question_id: 1 } as any]);

            expect(result.recommendations).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });
    });
});
