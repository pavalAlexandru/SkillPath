import { StudentLevel, DifficultyLevel } from '@/types/assesments';

export interface DifficultyCount {
    EASY: number;
    MEDIUM: number;
    HARD: number;
}

export interface AssessmentConfig {
    /** Număr total de întrebări per test standard (între 2 și 50) */
    standardQuestionCount: number;

    /** Număr total de întrebări pentru testul de onboarding (între 10 și 100) */
    onboardingQuestionCount: number;

    /** Distribuția fixă a întrebărilor pentru onboarding pe dificultăți */
    onboardingDifficultyDistribution: DifficultyCount;

    /** Numărul exact de întrebări (EASY, MEDIUM, HARD) pentru fiecare nivel la testul standard */
    difficultyDistribution: Record<StudentLevel, DifficultyCount>;

    /** Punctajul minim (în procente, 1 - 100) pentru promovare / Level-Up */
    passingScorePercentage: number;

    /** Punctajul sub care o arie este considerată slabă (în procente, 1 - 100) */
    reviewThresholdPercentage: number;
}

// -------------------------------------------------------------
// VALORILE CONFIGURABILE (Modifică direct aici numerele dorite)
// -------------------------------------------------------------
const RAW_CONFIG: AssessmentConfig = {
    // 1. Număr întrebări test standard (Limita: 2 - 50)
    standardQuestionCount: 10,

    // 2. Număr întrebări onboarding (Limita: 10 - 100)
    onboardingQuestionCount: 15,

    // Distribuția exactă pentru Onboarding (Suma este egală cu onboardingQuestionCount = 15)
    onboardingDifficultyDistribution: {
        EASY: 6,
        MEDIUM: 6,
        HARD: 3,
    },

    // Distribuția exactă pe nivele pentru testul standard (Suma pe fiecare nivel este egală cu standardQuestionCount = 10)
    difficultyDistribution: {
        JUNIOR: {
            EASY: 5,
            MEDIUM: 3,
            HARD: 2,
        },
        MIDDLE: {
            EASY: 2,
            MEDIUM: 5,
            HARD: 3,
        },
        SENIOR: {
            EASY: 1,
            MEDIUM: 3,
            HARD: 6,
        },
    },

    // 3. Praguri de notare (Limita: 1 - 100)
    passingScorePercentage: 90,
    reviewThresholdPercentage: 60,
};

// -------------------------------------------------------------
// VALIDATOR AUTOMAT (Aruncă eroare clară dacă o regulă este încălcată)
// -------------------------------------------------------------
function validateConfig(cfg: AssessmentConfig): AssessmentConfig {
    // Validare limite Standard (2 - 50)
    if (cfg.standardQuestionCount < 2 || cfg.standardQuestionCount > 50) {
        throw new Error(
            `[AssessmentConfig Error] standardQuestionCount (${cfg.standardQuestionCount}) trebuie să fie între 2 și 50.`
        );
    }

    // Validare limite Onboarding (10 - 100)
    if (cfg.onboardingQuestionCount < 10 || cfg.onboardingQuestionCount > 100) {
        throw new Error(
            `[AssessmentConfig Error] onboardingQuestionCount (${cfg.onboardingQuestionCount}) trebuie să fie între 10 și 100.`
        );
    }

    // Validare sumă Onboarding
    const onbSum =
        cfg.onboardingDifficultyDistribution.EASY +
        cfg.onboardingDifficultyDistribution.MEDIUM +
        cfg.onboardingDifficultyDistribution.HARD;
    if (onbSum !== cfg.onboardingQuestionCount) {
        throw new Error(
            `[AssessmentConfig Error] Suma dificultăților la Onboarding (${onbSum}) nu este egală cu onboardingQuestionCount (${cfg.onboardingQuestionCount}).`
        );
    }

    // Validare sume per nivel la testul Standard
    const levels: StudentLevel[] = ['JUNIOR', 'MIDDLE', 'SENIOR'];
    for (const lvl of levels) {
        const dist = cfg.difficultyDistribution[lvl];
        const levelSum = dist.EASY + dist.MEDIUM + dist.HARD;
        if (levelSum !== cfg.standardQuestionCount) {
            throw new Error(
                `[AssessmentConfig Error] Suma dificultăților pentru nivelul ${lvl} (${levelSum}) nu este egală cu standardQuestionCount (${cfg.standardQuestionCount}).`
            );
        }
    }

    // Validare praguri procentuale (1 - 100)
    if (cfg.passingScorePercentage < 1 || cfg.passingScorePercentage > 100) {
        throw new Error(
            `[AssessmentConfig Error] passingScorePercentage (${cfg.passingScorePercentage}) trebuie să fie între 1 și 100.`
        );
    }

    if (cfg.reviewThresholdPercentage < 1 || cfg.reviewThresholdPercentage > 100) {
        throw new Error(
            `[AssessmentConfig Error] reviewThresholdPercentage (${cfg.reviewThresholdPercentage}) trebuie să fie între 1 și 100.`
        );
    }

    if (cfg.reviewThresholdPercentage > cfg.passingScorePercentage) {
        throw new Error(
            `[AssessmentConfig Error] reviewThresholdPercentage (${cfg.reviewThresholdPercentage}) nu poate fi mai mare decât passingScorePercentage (${cfg.passingScorePercentage}).`
        );
    }

    return cfg;
}

export const ASSESSMENT_CONFIG = validateConfig(RAW_CONFIG);