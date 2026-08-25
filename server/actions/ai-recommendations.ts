'use server';

import { createClient } from '@/server/supabase/server';
import { Type, Schema } from '@google/genai';
import { generateContentWithFallback } from './ai-fallback';

export async function getWrongAnswers(assessmentId: number) {
    const supabase = await createClient();

    const { data: wrongAnswersData } = await supabase
        .from('assessment_questions')
        .select(`
            id,
            is_correct,
            position,
            question:questions (
                id,
                question_text,
                category_id,
                categories ( name ),
                options:question_options (
                    id,
                    option_text,
                    is_correct
                )
            ),
            answers:assessment_answers (
                option_id
            )
        `)
        .eq('assessment_id', assessmentId)
        .eq('is_correct', false)
        .order('position', { ascending: true });

    const wrongAnswers = (wrongAnswersData || []).map((wq: any) => {
        const selectedOptionIds = wq.answers.map((a: any) => a.option_id);
        
        return {
            position: wq.position,
            question_id: wq.question.id,
            question_text: wq.question.question_text,
            category_id: wq.question.category_id,
            category_name: wq.question.categories?.name,
            options: wq.question.options,
            selected_option_ids: selectedOptionIds
        };
    });

    return { wrongAnswers };
}

export async function generateAIRecommendations(assessmentId: number, wrongAnswers: any[]) {
    const supabase = await createClient();

    const { data: existingRecs } = await supabase
        .from('learning_recommendations')
        .select(`
            *,
            resources:recommendation_resources(*)
        `)
        .eq('assessment_id', assessmentId);

    if (existingRecs && existingRecs.length > 0) {
        return { recommendations: existingRecs };
    }

    if (!wrongAnswers || wrongAnswers.length === 0) {
        return { recommendations: [] };
    }

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            recommendations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category_id: { type: Type.INTEGER, description: "The category ID this recommendation belongs to" },
                        topic_title: { type: Type.STRING },
                        advice_description: { type: Type.STRING },
                        priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                        search_url: { type: Type.STRING, description: "A Google search URL for this topic (e.g., https://www.google.com/search?q=topic)" },
                        search_title: { type: Type.STRING, description: "A short title for the resource link" }
                    },
                    required: ["category_id", "topic_title", "advice_description", "priority", "search_url", "search_title"]
                }
            }
        }
    };

    const prompt = `
      The student just completed an assessment and got the following questions wrong: 
      ${JSON.stringify(wrongAnswers)}
      
      Provide an encouraging, highly detailed explanation of what they missed and what to improve (in Romanian).
      Group your recommendations by category_id. 
      
      For each recommendation, provide a Google search URL to help them learn the topic.
      IMPORTANT RULES FOR SEARCH URLS:
      1. The Google search query MUST be exclusively in English.
      2. Use advanced search operators to make the search precise if needed (e.g. quotation marks for exact technical phrases).
      3. Do not add exclusions (e.g. using the minus sign) unless absolutely necessary, as valid resources like Quora shouldn't be blindly excluded.
      4. Format the URL properly (e.g., https://www.google.com/search?q=%22event+loop%22).
    `;

    try {
        const response = await generateContentWithFallback(prompt, {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        });

        const data = JSON.parse(response.text || '{}');
        const generatedRecs = data.recommendations || [];
        const finalRecommendations = [];

        for (const rec of generatedRecs) {
            const { data: insertedRec, error: recError } = await supabase.from('learning_recommendations').insert({
                assessment_id: assessmentId,
                category_id: rec.category_id,
                topic_title: rec.topic_title,
                advice_description: rec.advice_description,
                priority: rec.priority,
                status: 'PENDING'
            }).select('id').single();

            const recId = insertedRec?.id || crypto.randomUUID();

            if (recError) {
                console.error("Error inserting recommendation (RLS likely):", recError);
            }

            const resource = {
                recommendation_id: recId,
                title: rec.search_title,
                url: rec.search_url
            };

            if (!recError) {
                await supabase.from('recommendation_resources').insert(resource);
            }
            
            finalRecommendations.push({
                ...rec,
                id: recId,
                resources: [resource]
            });
        }

        return { recommendations: finalRecommendations };

    } catch (error) {
        console.error("Error generating AI recommendations:", error);
        return { recommendations: [] };
    }
}
