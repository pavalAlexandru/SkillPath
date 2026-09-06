export interface AiConfig {
    /** Câte întrebări poate genera un mentor cu AI în 24 de ore (1 - 100) */
    dailyGenerationLimitPerMentor: number;

    /** Maxim de întrebări per lot generat, per categorie (1 - 10) */
    maxQuestionsPerBatch: number;
}

// -------------------------------------------------------------
// VALORILE CONFIGURABILE (Modifică direct aici numerele dorite)
// -------------------------------------------------------------
export const aiConfig: AiConfig = {
    dailyGenerationLimitPerMentor: 10,
    maxQuestionsPerBatch: 5,
};
