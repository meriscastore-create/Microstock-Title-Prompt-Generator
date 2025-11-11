import { GoogleGenAI, Type } from "@google/genai";
import { JsonPrompt } from '../types';

const FIXED_COMPOSITION = "Only a few elements are present, Elements randomly ultra airy scattered, not symmetrical, no overlaps or touching. Each stands individually with airy spacing, forming a full, distinct diamond-shaped composition without visible outlines. All elements must fit completely inside the diamond area, no parts cropped or touching edges..";
const FIXED_SETTINGS = "--ar 1:1 --v 6 --style raw --q 2 --repeat 2";

const handleApiError = (error: unknown): never => {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes('api key not valid') || lowerCaseMessage.includes('permission denied')) {
             throw new Error("Your API key seems to be invalid or lacks permissions. Please enter a valid key.");
        }
        if (lowerCaseMessage.includes('quota') || lowerCaseMessage.includes('rate limit')) {
            throw new Error("API telah mencapai limit.");
        }
    }
    throw new Error("Ayo coba lagi.");
};

export const generateTitle = async (keyword: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API key is not set.");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are an expert microstock title generator. Your task is to generate an SEO-optimized title based on the user's input: '${keyword}'.

**Constraint:** The final title's total length MUST be under 160 characters.

**Structure (Strictly Enforced):**
The title must follow this exact three-part structure:
1.  **First Sentence:** A short, engaging phrase including the main subject.
2.  **Second Sentence:** A more descriptive sentence detailing the main subject and its key elements or style.
3.  **Third Part:** A series of comma-separated, high-value microstock keywords. This part MUST include "seamless pattern" and "vector illustration". Also include other relevant terms from this list: "background", "design", "texture", "wallpaper", "fabric", "textile", "wrapping paper", "print", "graphic".

**Input Handling Rules:**
*   **Typo Correction:** If the input seems to have a typo (e.g., 'Chrismas Tre'), interpret the intended meaning ('Christmas Tree') and use the correct term for the title.
*   **If the input is comma-separated keywords (e.g., 'cat, playful, cartoon'):** Combine them to create a cohesive theme.
*   **If the input is a long phrase or a full title (e.g., 'A detailed illustration of vintage flowers'):** Do not copy it. Analyze its core concepts and generate a *new, similar* title that follows the required structure.
*   **If the input is a simple keyword (e.g., 'Christmas Tree'):** Use it as the main subject.

**Goal:** The final output must be a single block of text, formatted exactly as shown in the examples, with a total length under 160 characters. The title must sound natural, be highly descriptive, and be packed with relevant keywords for microstock platforms.

**Example for 'Foliage, Holly' input (comma-separated):**
Winter foliage pattern. Holly leaves and red berries in a festive composition. Seamless pattern, vector illustration, Christmas background, botanical print, for gift wrap and textile design.

**Example for 'A beautiful seamless pattern with Christmas trees and gifts' input (long phrase):**
Christmas tree seamless pattern. Festive holiday trees with ornaments and gifts on a winter background. Vector illustration, wallpaper design, for fabric, print, wrapping paper.

**Example for 'Happy Cat' input (simple keyword):**
Happy cute cat pattern. Adorable kitten characters with hearts and stars in a playful cartoon style. Seamless pattern, vector illustration, animal background, textile print, fabric design.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    handleApiError(error);
  }
};

const jsonPromptSchema = {
  type: Type.OBJECT,
  properties: {
    concept: { type: Type.STRING, description: "A short descriptive sentence with 1 main element and 2 supporting elements from the title. It must not contain the words 'seamless', 'pattern', or 'illustration'." },
    color: { type: Type.STRING, description: "A descriptive phrase for a soft, muted, pastel, non-gradient color palette. Format: 'description (color1, color2, color3, ...)'" },
    background: { type: Type.STRING, description: "A descriptive phrase for a single-color background that MUST include the phrase 'solid single color'. Format: 'description, solid single color (color)'" },
    mood: { type: Type.STRING, description: "A comma-separated list of moods, fitting the style. Format: 'mood1, mood2, mood3, ...'" },
    style: { type: Type.STRING, description: "One art style name followed by its 4 characteristics, comma-separated. Format: 'Style Name, characteristic1, characteristic2, ...'" },
  }
};

export const generateJsonPrompt = async (title: string, apiKey: string): Promise<JsonPrompt> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Based on the microstock title "${title}", generate a JSON prompt for an AI image generator. Strictly adhere to the provided schema and the following rules:

    1.  **concept**: Create a descriptive sentence using the main subject and two supporting elements from the title. DO NOT use the words "seamless", "pattern", or "illustration".
        *   Example: "Cute festive kitten wearing a Santa hat, holiday winter pet."
    2.  **color**: Describe a soft, warm, muted, pastel, natural, non-gradient color palette that fits the title's theme.
        *   Example: "soft, warm, muted, pastel, natural, non-gradient festive winter tones (muted red, forest green, cream, light grey, beige)"
    3.  **background**: **Analyze the title for clues about the background (e.g., 'on a dark background', 'light background'). Create a matching background description.** If the title provides no clues, pick a light, matching color. The description MUST always be a single color and MUST include the exact phrase "solid single color".
        *   Example (if title implies dark): "deep, moody, solid single color (charcoal grey)."
        *   Example (default): "light, matching, solid single color (pale ice blue)."
    4.  **mood**: List several moods that fit the style and colors.
        *   Example: "festive, cheerful, cute, cozy, playful, happy, wholesome"
    5.  **style**: List one specific art style (e.g., Gouache painting, Scandinavian, Kawaii) followed by its four key characteristics.
        *   Example: "Gouache painting, opaque pigments, matte finish, bold lines"
    
    The entire response must be a single, valid JSON object and be less than 910 characters long.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: jsonPromptSchema
            }
        });

        const parsedJson = JSON.parse(response.text);
        
        return {
            ...parsedJson,
            composition: FIXED_COMPOSITION,
            settings: FIXED_SETTINGS,
        };
    } catch (error) {
        handleApiError(error);
    }
};


export const changeColor = async (currentPrompt: JsonPrompt, apiKey: string): Promise<Partial<JsonPrompt>> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Based on the existing AI prompt's concept and style:
    - Concept: "${currentPrompt.concept}"
    - Style: "${currentPrompt.style}"
    
    Generate a new color palette, background, and mood. The colors should remain soft, muted, pastel, and non-gradient. The background description MUST include the phrase 'solid single color'.
    Strictly follow this example format:
    - "color": "soft, warm, muted, pastel, natural, non-gradient festive winter tones (muted red, forest green, cream, light grey, beige)"
    - "background": "light, matching, solid single color (pale ice blue)."
    - "mood": "festive, cheerful, cute, cozy, playful, happy, wholesome"

    Return only a JSON object with "color", "background", and "mood" fields.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        color: { type: Type.STRING },
                        background: { type: Type.STRING },
                        mood: { type: Type.STRING },
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        handleApiError(error);
    }
};

export const changeStyle = async (currentPrompt: JsonPrompt, apiKey: string): Promise<Partial<JsonPrompt>> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Based on the existing AI prompt's concept:
    - Concept: "${currentPrompt.concept}"
    
    The current style is "${currentPrompt.style}". Generate a completely different style, along with a new matching color palette, background, and mood.
    Strictly follow this example format:
    - "style": One specific art style followed by its four key characteristics. Example: "Gouache painting, opaque pigments, matte finish, bold lines"
    - "color": A descriptive phrase for a soft non-gradient color palette. Example: "soft, warm, muted, pastel, natural, non-gradient festive winter tones (muted red, forest green, cream, light grey, beige)"
    - "background": A descriptive phrase for a single-color background that MUST include the phrase 'solid single color'. Example: "light, matching, solid single color (pale ice blue)."
    - "mood": A list of moods that fit the new style. Example: "festive, cheerful, cute, cozy, playful, happy, wholesome"

    Return only a JSON object with "style", "color", "background", and "mood" fields.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        style: { type: Type.STRING },
                        color: { type: Type.STRING },
                        background: { type: Type.STRING },
                        mood: { type: Type.STRING },
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        handleApiError(error);
    }
};