'use server';

import { generateContentWithFallback } from './ai-fallback';

export async function getQuickHint(questionText: string, options: string[]) {
    try {
        const prompt = `
You are a helpful programming tutor. The student is currently taking a test and needs a quick hint.
Question: ${questionText}
Options: ${options.join(', ')}

Provide a concise, encouraging hint (1-2 sentences) that points them in the right direction WITHOUT giving away the exact answer. Speak in Romanian.
        `;

        const response = await generateContentWithFallback(prompt);

        return response.text || "Nu am putut genera un indiciu în acest moment.";
    } catch (error) {
        console.error("AI Hint Error:", error);
        return "Serviciul de indicii este indisponibil momentan.";
    }
}
