import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { notifyQuestionOutcome, getUserNotifications, deleteNotification } from '@/server/actions/notifications';
import { adminClient, studentClient, setMockUserRole } from '../vitest.integration.setup';

describe('Notifications Integration', () => {
    let createdNotificationIds: number[] = [];
    let studentUserId: string;

    beforeAll(async () => {
        setMockUserRole('STUDENT');
        const { data: { user } } = await studentClient.auth.getUser();
        studentUserId = user!.id;
    });

    afterAll(async () => {
        if (createdNotificationIds.length > 0) {
            await adminClient.from('notifications').delete().in('id', createdNotificationIds);
        }
    });

    test('should create, retrieve, and delete notification', async () => {
        const { data: catData } = await adminClient.from('questions').select('category_id').limit(1).single();
        const categoryId = catData?.category_id || 1;

        // 1. Setup a fake question in DB for the notification logic (which expects the question creator)
        const { data: qData } = await adminClient.from('questions').insert({
            category_id: categoryId,
            question_text: `Temp for Notification ${Date.now()}`,
            difficulty: 'EASY',
            question_type: 'SINGLE',
            status: 'PENDING',
            created_by: studentUserId
        }).select('id').single();

        expect(qData).toBeDefined();
        const testQuestionId = qData!.id;

        // 2. Trigger notification (simulating mentor action)
        setMockUserRole('MENTOR');
        await notifyQuestionOutcome(testQuestionId, 'APPROVED');

        // 3. Check notification as student
        setMockUserRole('STUDENT');
        const notifications = await getUserNotifications();
        const notification = notifications.find(n => n.reference_id === testQuestionId);
        
        expect(notification).toBeDefined();
        expect(notification!.title).toContain('Approved');
        
        if (notification) {
            createdNotificationIds.push(notification.id);
        }

        // 4. Delete notification
        await deleteNotification(notification!.id);

        const newNotifications = await getUserNotifications();
        const stillExists = newNotifications.find(n => n.id === notification!.id);
        expect(stillExists).toBeUndefined();

        // Cleanup temp question
        await adminClient.from('questions').delete().eq('id', testQuestionId);
    });
});
