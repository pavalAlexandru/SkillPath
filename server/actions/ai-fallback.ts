import { GoogleGenAI, GenerateContentConfig } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS_CASCADE = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash'
];

// Folosim globalThis pentru a păstra indexul între reîncărcările de HMR din dezvoltare
const globalAny = globalThis as any;
if (globalAny.activeModelIndex === undefined) {
    globalAny.activeModelIndex = 0;
}

export async function generateContentWithFallback(
    prompt: string,
    config?: GenerateContentConfig
) {
    let lastError: any = null;

    for (let i = 0; i < MODELS_CASCADE.length; i++) {
        const currentIndex = (globalAny.activeModelIndex + i) % MODELS_CASCADE.length;
        const model = MODELS_CASCADE[currentIndex];

        try {
            console.log(`Încercare generare cu modelul: ${model}...`);
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config,
            });
            
            // Reține modelul care a funcționat
            globalAny.activeModelIndex = currentIndex;
            
            return response;
        } catch (error: any) {
            console.error(`Eroare cu modelul ${model}:`, error?.message || error);
            lastError = error;
            
            // Verificăm dacă eroarea este de la o cerere invalidă (400)
            const isBadRequest = error?.status === 400 && !error?.message?.includes('not found') && !error?.message?.includes('models/');
            
            if (isBadRequest) {
                // Pentru erori clare de prompt/validare, aruncăm imediat
                throw error;
            }
            
            // Pentru orice altă eroare (404, 429, 500, timeout, fetch failed etc.), cădem înapoi
            console.log(`Eroare la modelul ${model}. Cădem înapoi la următorul...`);
            continue;
        }
    }

    throw new Error(`Toate modelele (${MODELS_CASCADE.length}) au epuizat cota zilnică sau au eșuat. Ultima eroare: ${lastError?.message}`);
}
