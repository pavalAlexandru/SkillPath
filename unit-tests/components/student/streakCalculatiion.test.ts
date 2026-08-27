import { describe, it, expect } from 'vitest';

// Extragem funcția pură pentru testare unitară izolată
function calculateRealStreak(dates: string[]): number {
    if (!dates || dates.length === 0) return 0;

    const completedDates = new Set(dates);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
        return 0;
    }

    let streak = 0;
    const checkDate = new Date();
    if (!completedDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (completedDates.has(checkStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

describe('Unit Test - Streak Calculation', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
    const fourDaysAgo = new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0];

    it('returnează 0 când nu există activitate', () => {
        expect(calculateRealStreak([])).toBe(0);
    });

    it('returnează 1 dacă testul a fost dat doar azi', () => {
        expect(calculateRealStreak([today])).toBe(1);
    });

    it('returnează 3 pentru o serie consecutivă (azi, ieri, alaltăieri)', () => {
        expect(calculateRealStreak([today, yesterday, twoDaysAgo])).toBe(3);
    });

    it('menține seria activă dacă ultimul test a fost ieri (încă nu a dat azi)', () => {
        expect(calculateRealStreak([yesterday, twoDaysAgo])).toBe(2);
    });

    it('resetează seria la 0 dacă există o pauză de 2 zile', () => {
        expect(calculateRealStreak([fourDaysAgo])).toBe(0);
    });
});