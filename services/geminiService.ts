import { GoogleGenAI, Type } from "@google/genai";
import { JsonPrompt } from '../types';

const FIXED_COMPOSITION = "Only a few elements are present, Elements randomly ultra airy scattered, not symmetrical, no overlaps or touching. Each stands individually with airy spacing, forming a full, distinct diamond-shaped composition without visible outlines. All elements must fit completely inside the diamond area, no parts cropped or touching edges..";
const FIXED_SETTINGS = "--ar 1:1 --v 6 --style raw --q 2 --repeat 2";

const handleApiError = (error: unknown): never => {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key not valid') || error.message.toLowerCase().includes('permission denied')) {
             throw new Error("Your API Key appears to be invalid or lacks permissions. Please enter a valid key.");
        }
    }
    throw new Error("An unexpected error occurred with the AI service. Please try again later.");
};

export const generateTitle = async (keyword: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is not set.");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Create a microstock title for the keyword(s): '${keyword}'.

**Constraint:** The total length of the final title MUST be under 180 characters.

The title must follow this specific three-part structure precisely:
1.  **First Sentence:** A short, catchy phrase with the main subject and the word "pattern".
2.  **Second Sentence:** A more descriptive sentence detailing the main subject and supporting elements.
3.  **Third Part:** A series of comma-separated, descriptive keywords and phrases. This part must include the words "seamless" and "vector background", and suggest uses like "textile" or "print".

**Goal:** The final output should be formatted exactly as shown in the examples below, staying under 180 characters. It should be natural, descriptive, and optimized for microstock search.

**Example for input 'Happy Cat':**
Happy cat pattern. Cute kitty character with heart and star. Seamless pet vector background, cartoon animal print, textile graphic illustration.

**Example for input 'Christmas Tree':**
Christmas tree pattern. Festive holiday trees with ornaments and gifts. Seamless winter vector background, forest illustration, for fabric and print.

**Example for input 'Foliage, Holly':**
Winter foliage pattern. Holly leaves and red berries composition. Seamless Christmas vector background, festive botanical print, for gift wrap and textile.`;

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
    concept: { type: Type.STRING, description: "A short, descriptive sentence with 1 main element and 2 supporting elements from the title. Must not contain the words 'seamless', 'pattern', or 'illustration'." },
    color: { type: Type.STRING, description: "A descriptive phrase for a soft, muted, pastel, non-gradient color palette. Format: 'description (color1, color2, color3, ...)'" },
    background: { type: Type.STRING, description: "A descriptive phrase for a single color background that MUST include the phrase 'solid single color'. Format: 'description, solid single color (color)'" },
    mood: { type: Type.STRING, description: "A list of moods separated by commas, matching the style. Format: 'mood1, mood2, mood3, ...'" },
    style: { type: Type.STRING, description: "One art style name followed by 4 of its characteristics, comma-separated. Format: 'Style Name, characteristic1, characteristic2, ...'" },
  }
};

export const generateJsonPrompt = async (title: string, apiKey: string): Promise<JsonPrompt> => {
    if (!apiKey) throw new Error("API Key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Based on the microstock title "${title}", generate a JSON prompt for an AI image generator. Adhere strictly to the provided schema and these rules:

    1.  **concept**: Create a descriptive sentence using the main subject and two supporting elements from the title. DO NOT use the words "seamless", "pattern", or "illustration".
        *   Example: "Cute festive kitten wearing a Santa hat, holiday winter season pet."
    2.  **color**: Describe a soft, warm, muted, pastel, natural, non-gradient color palette that fits the title's theme.
        *   Example: "soft, warm, muted, pastel, natural, non-gradient, festive winter tones (muted red, forest green, cream, light grey, beige)"
    3.  **background**: **Analyze the title for any hints about the background (e.g., 'on dark background', 'light backdrop'). Generate a matching background description.** If the title gives no hints, choose a bright, harmonious color. The description MUST always be a single color and MUST include the exact phrase "solid single color".
        *   Example (if title implies darkness): "deep, moody, solid single color (charcoal grey)."
        *   Example (default): "bright, harmonious, solid single color (light icy blue)."
    4.  **mood**: List several moods that fit the style and colors.
        *   Example: "festive, cheerful, cute, cozy, playful, happy, wholesome"
    5.  **style**: State one specific art style (e.g., Gouache painting, Scandinavian, Kawaii) followed by four of its key characteristics.
        *   Example: "Gouache painting, opaque pigments, matte finish, bold outlines"
    
    The entire response must be a single, valid JSON object that is less than 910 characters long.`;

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
    if (!apiKey) throw new Error("API Key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Based on the existing AI prompt concept and style:
    - Concept: "${currentPrompt.concept}"
    - Style: "${currentPrompt.style}"
    
    Generate a new color palette, background, and mood. The colors must remain soft, muted, pastel, and non-gradient. The background description MUST include the phrase 'solid single color'.
    Follow these formatting examples strictly:
    - "color": "soft, warm, muted, pastel, natural, non-gradient, festive winter tones (muted red, forest green, cream, light grey, beige)"
    - "background": "bright, harmonious, solid single color (light icy blue)."
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
    if (!apiKey) throw new Error("API Key is not set.");
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Based on the existing AI prompt concept:
    - Concept: "${currentPrompt.concept}"
    
    The current style is "${currentPrompt.style}". Generate a completely different style, along with a new matching color palette, background, and mood.
    Follow these formatting examples strictly:
    - "style": One specific art style followed by four of its key characteristics. Example: "Gouache painting, opaque pigments, matte finish, bold outlines"
    - "color": A descriptive phrase for a soft, non-gradient color palette. Example: "soft, warm, muted, pastel, natural, non-gradient, festive winter tones (muted red, forest green, cream, light grey, beige)"
    - "background": A descriptive phrase for a single color background that MUST include the phrase 'solid single color'. Example: "bright, harmonious, solid single color (light icy blue)."
    - "mood": A list of moods matching the new style. Example: "festive, cheerful, cute, cozy, playful, happy, wholesome"

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