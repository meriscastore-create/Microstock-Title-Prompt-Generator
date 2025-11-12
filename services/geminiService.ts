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
    throw new Error("Terjadi kesalahan tak terduga. Silakan coba lagi.");
};

export const generateTitle = async (keyword: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API key is not set.");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are an expert microstock title generator. Your task is to generate an SEO-optimized title based on the user's input: '${keyword}'.

**Constraints:**
*   The final title's total length MUST be under 160 characters.
*   The title MUST contain the words "seamless" and "pattern". They will naturally be included if you follow the structure below.

**Structure (Strictly Enforced):**
The title MUST follow this exact four-part structure, with each part separated by a period:
1.  **Part 1:** A short phrase identifying the main element, followed by "Pattern Vector.". It must end with a period.
2.  **Part 2:** A more descriptive sentence starting with "Seamless", including the main element, "Pattern", and supporting elements. It must end with a period.
3.  **Part 3:** A short phrase providing additional context or theme (e.g., 'Winter landscape.'). It must end with a period.
4.  **Part 4:** A final phrase for context, such as "seamless pattern Background.". It must end with a period.

**Example of the required structure and punctuation:**
\`Christmas Tree Pattern Vector. Seamless Christmas Tree Pattern with reindeer and mountain. Winter landscape. seamless pattern Background.\`

**Breakdown of the Example:**
*   Part 1: \`Christmas Tree Pattern Vector.\` (Main element)
*   Part 2: \`Seamless Christmas Tree Pattern with reindeer and mountain.\` (Descriptive sentence with supporting elements)
*   Part 3: \`Winter landscape.\` (Contextual keywords)
*   Part 4: \`seamless pattern Background.\` (Final keywords)

**Input Handling Rules:**
*   **Typo Correction:** If the input seems to have a typo (e.g., 'Chrismas Tre'), interpret the intended meaning ('Christmas Tree') and use the correct term.
*   **Comma-Separated Keywords (e.g., 'cat, playful, cartoon'):** Naturally integrate ALL of these keywords into the four-part title. The final title must be coherent, sound natural, and be easily understood by SEO.
*   **Long Phrase/Title (e.g., 'A detailed illustration of vintage flowers'):** Do not copy it. Analyze its core concepts and generate a *new, similar* title that strictly follows the required four-part structure.
*   **Simple Keyword (e.g., 'Christmas Tree'):** Use it as the main subject.

**Goal:** The final output must be a single block of text, formatted exactly as described, with a total length under 160 characters. The title must be highly descriptive and packed with relevant keywords for microstock platforms.`;

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
    color: { type: Type.STRING, description: "A descriptive phrase for a vibrant, strong, enhanced, non-gradient color palette. Format: 'description of colors'" },
    background: { type: Type.STRING, description: "A descriptive phrase for a clean, single-color background that MUST include the phrase 'solid single color'. Format: 'description, solid single color'" },
    mood: { type: Type.STRING, description: "A comma-separated list of moods, fitting the style. Format: 'mood1, mood2, mood3, ...'" },
    style: { type: Type.STRING, description: "A formatted string describing the art style. Format: 'Style Vector minimalist Pure : [Style Name] ([Characteristic 1], [Characteristic 2]), [Characteristic 3], [Characteristic 4]'." },
  }
};

export const generateJsonPrompt = async (title: string, apiKey: string): Promise<JsonPrompt> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Based on the microstock title "${title}", generate a JSON prompt for an AI image generator. Strictly adhere to the provided schema and the following rules:

    1.  **concept**: Create a descriptive sentence using the main subject and two supporting elements from the title. DO NOT use the words "seamless", "pattern", or "illustration".
        *   Example: "Cute festive kitten wearing a Santa hat, holiday winter pet."
    2.  **color**: Describe a vibrant, strong, and enhanced non-gradient color palette that fits the title's theme. DO NOT mention any specific colors.
        *   Example: "vibrant and striking festive color palette"
    3.  **background**: Describe a clean, solid, single-color background. The description MUST include the exact phrase "solid single color". DO NOT mention any specific colors. The goal is to allow for varied background colors while maintaining a clean look.
        *   Example: "clean, complementary, solid single color background"
    4.  **mood**: List several moods that fit the style and colors.
        *   Example: "festive, cheerful, cute, cozy, playful, happy, wholesome"
    5.  **style**: Choose a specific, vector-friendly art style (elegant, minimalist, or abstract), suitable for vectorization. AVOID painterly styles like watercolor or oil painting. The format MUST be exactly: \`Style Vector minimalist Pure : [Style Name] ([Characteristic 1], [Characteristic 2]), [Characteristic 3], [Characteristic 4]\`.
        *   Good Style Examples: 'Bauhaus (Functional, Geometric Purity)', 'Art Deco (Elegant, Symmetrical)', 'Minimalist Line Art (Single Weight, Expressive)', 'Japanese Zen Minimalism (Simplicity, Negative Space)'.
        *   Example Format: "Style Vector minimalist Pure : Art Deco (Glamorous, Geometric), symmetrical, elegant"
    
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
    
    Generate a new color palette, background, and mood.
    - **color**: The color palette must be vibrant, strong, and non-gradient. Describe a diverse palette and avoid overusing "warm" tones. DO NOT mention specific colors.
    - **background**: The background description MUST be for a clean, single-color background and include the phrase 'solid single color'. DO NOT mention specific colors.
    
    Strictly follow this example format:
    - "color": "vibrant, strong, and enhanced festive tones"
    - "background": "clean, high-contrast, solid single color background"
    - "mood": "energetic, joyful, lively, dynamic"

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

The current style is "${currentPrompt.style}". Generate a completely new and different style from the current one. The new style MUST be elegant, minimalist, or abstract and suitable for vectorization. AVOID painterly styles like watercolor, oil painting, or heavy textures.

You MUST select a style from the provided list or a style that is conceptually very similar.

**Curated Style List (Choose One):**

**Geometric & Abstract:**
*   Bauhaus (Functional, Geometric Purity)
*   Memphis Design (Postmodern, Bold & Quirky)
*   Swiss International Style (Grid-based, Clean Typography)
*   Art Deco (Elegant, Symmetrical, Luxurious)
*   Cubism (Fragmented, Multi-perspective)
*   Geometric Abstraction (Shapes, Lines, Forms)
*   Low Poly (Faceted, Digital Aesthetic)
*   Flat Isometric (2.5D, Clean & Technical)

**Minimalist & Line Art:**
*   Minimalist Line Art (Single Weight, Expressive)
*   Continuous Line Drawing (One-line, Fluid)
*   Japanese Zen Minimalism (Simplicity, Negative Space)
*   Scandinavian Design (Hygge, Clean, Functional)
*   Stipple Art (Dot-based Shading, Engraved Look)
*   Outline Style (Bold Outlines, Minimal Fill)

**Modern & Stylized:**
*   Corporate Membranism (Soft UI, Subtle Shadows)
*   Synthwave & Outrun (80s Retro, Neon Grids)
*   Psychedelic Art (Swirling, Distorted, Vibrant)
*   Modern Folk Art (Simplified, Decorative, Storytelling)
*   Abstract Organic (Flowing, Nature-inspired Shapes)
*   Trompe L'oeil (Illusory, Realistic Depth)
*   Ukiyo-e Modernism (Japanese Woodblock, Flat Colors)

Also generate a new matching color palette, background, and mood.
Strictly follow this example format:
- "style": A specific art style with four characteristics. The format must be: 'Style Vector minimalist Pure : [Style Name] ([Characteristic 1], [Characteristic 2]), [Characteristic 3], [Characteristic 4]'. Example: "Style Vector minimalist Pure : Art Deco (Glamorous, Geometric), symmetrical, elegant"
- "color": A descriptive phrase for a vibrant, strong, non-gradient color palette. Avoid overusing 'warm' tones. DO NOT mention specific colors. Example: "cool and sophisticated jewel tones"
- "background": A descriptive phrase for a clean, single-color background that MUST include the phrase 'solid single color'. DO NOT mention specific colors. Example: "clean, bold, solid single color background"
- "mood": A list of moods that fit the new new style. Example: "elegant, luxurious, sophisticated, modern"

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