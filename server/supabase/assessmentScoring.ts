import { QuestionOption } from '@/types/assesments';

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function calculateSingleQuestionScore(
    selectedIds: number[],
    options: QuestionOption[]
): { score: number; isCorrect: boolean } {
    const correctOptions = options.filter((o) => o.isCorrect);
    const incorrectOptions = options.filter((o) => !o.isCorrect);

    const N = correctOptions.length;
    const M = incorrectOptions.length;

    if (N === 0 || selectedIds.length === 0) {
        return { score: 0, isCorrect: false };
    }

    let correctChosen = 0;
    let incorrectChosen = 0;

    selectedIds.forEach((id) => {
        if (correctOptions.some((o) => o.id === id)) {
            correctChosen++;
        } else {
            incorrectChosen++;
        }
    });

    const penaltyPerWrong = M > 0 ? 1 / M : 0;
    const rewardPerCorrect = 1 / N;

    const rawScore = correctChosen * rewardPerCorrect - incorrectChosen * penaltyPerWrong;
    const finalScore = Math.max(0, rawScore);

    return {
        score: finalScore,
        isCorrect: finalScore === 1,
    };
}