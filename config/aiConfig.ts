export interface AiConfig {
    /** Câte întrebări poate genera un mentor cu AI în 24 de ore (1 - 100) */
    dailyGenerationLimitPerMentor: number;

    /** Maxim de întrebări per lot generat, per categorie (1 - 10) */
    maxQuestionsPerBatch: number;
}

import staticSettings from './settings.json';

// -------------------------------------------------------------
// VALORILE CONFIGURABILE
// -------------------------------------------------------------
let aiSettings: AiConfig;

if (typeof window === 'undefined') {
    // Server-side: citire dinamică fără rebuild
    const fs = eval('require("fs")');
    const path = eval('require("path")');
    const filePath = path.join(process.cwd(), 'config', 'settings.json');
    aiSettings = JSON.parse(fs.readFileSync(filePath, 'utf8')).ai;
} else {
    // Client-side: folosim importul static ca fallback
    aiSettings = staticSettings.ai;
}

export const aiConfig: AiConfig = aiSettings;
