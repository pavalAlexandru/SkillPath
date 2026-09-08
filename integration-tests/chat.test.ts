import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { sendMessage, getRecentMessages } from '@/server/actions/chat';
import { adminClient, setMockUserRole } from '../vitest.integration.setup';

describe('Chat Integration', () => {
    let testMessageIds: string[] = [];
    const uniqueMessage = `Hello Vitest Chat ${Date.now()}`;

    beforeAll(() => {
        setMockUserRole('STUDENT');
    });

    afterAll(async () => {
        if (testMessageIds.length > 0) {
            await adminClient.from('chat_messages').delete().in('id', testMessageIds);
        }
        await adminClient.from('chat_messages').delete().like('content', 'Hello Vitest Chat%');
    });

    test('should allow user to send and retrieve chat messages', async () => {
        // 1. Send message
        await sendMessage(uniqueMessage);

        // 2. Retrieve messages
        const messages = await getRecentMessages(10);
        
        const found = messages.find(m => m.content === uniqueMessage);
        expect(found).toBeDefined();
        
        if (found) {
            testMessageIds.push(found.id);
        }
    });
});
