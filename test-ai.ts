import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: 'Hi',
        });
        console.log("SUCCESS:", response.text);
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e);
        console.log("STATUS:", e.status);
    }
}
run();
