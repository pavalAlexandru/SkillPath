import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createCategory, toggleCategoryActive } from '@/server/actions/categories';
import { toggleStudentActive } from '@/server/actions/students';
import { adminClient, setMockUserRole, studentClient } from '../vitest.integration.setup';

describe('Mentor Actions Integration', () => {
    let createdCategoryIds: number[] = [];
    let studentUserId: string;

    beforeAll(async () => {
        setMockUserRole('MENTOR');
        
        // Find the student user id to test toggle
        const { data: { user } } = await studentClient.auth.getUser();
        studentUserId = user!.id;
    });

    afterAll(async () => {
        // Cleanup all categories created
        if (createdCategoryIds.length > 0) {
            await adminClient.from('categories').delete().in('id', createdCategoryIds);
        }
        await adminClient.from('categories').delete().like('name', 'Test Category %');
        
        // Ensure student is active again if test fails
        if (studentUserId) {
            await adminClient.from('profiles').update({ is_active: true }).eq('id', studentUserId);
        }
    });

    test('mentor can create and toggle a category', async () => {
        const uniqueCatName = `Test Category ${Date.now()}`;
        
        const fd = new FormData();
        fd.append('name', uniqueCatName);
        fd.append('description', 'Test Description');
        fd.append('level', 'JUNIOR');
        
        await createCategory(fd);

        // Verify it was created
        const { data: cat } = await adminClient
            .from('categories')
            .select('id, is_active')
            .eq('name', uniqueCatName)
            .single();

        expect(cat).toBeTruthy();
        expect(cat?.is_active).toBe(true);
        createdCategoryIds.push(cat!.id);

        // Toggle it to false
        const toggleFd = new FormData();
        toggleFd.append('id', cat!.id.toString());
        toggleFd.append('is_active', 'true'); // The current value is true, so passing 'true' will toggle to false in code

        await toggleCategoryActive(toggleFd);

        // Verify it was toggled
        const { data: updatedCat } = await adminClient
            .from('categories')
            .select('is_active')
            .eq('id', cat!.id)
            .single();

        expect(updatedCat?.is_active).toBe(false);
    });

    test('mentor can toggle student status', async () => {
        // Find initial status
        const { data: profile } = await adminClient
            .from('profiles')
            .select('is_active')
            .eq('id', studentUserId)
            .single();
            
        const initialStatus = profile?.is_active ?? true;

        const fd = new FormData();
        fd.append('id', studentUserId);
        fd.append('is_active', String(initialStatus)); // if true, it toggles to false

        await toggleStudentActive(fd);

        const { data: updatedProfile } = await adminClient
            .from('profiles')
            .select('is_active')
            .eq('id', studentUserId)
            .single();

        expect(updatedProfile?.is_active).toBe(!initialStatus);
        
        // Revert it
        const revertFd = new FormData();
        revertFd.append('id', studentUserId);
        revertFd.append('is_active', String(!initialStatus));
        await toggleStudentActive(revertFd);
    });
});
