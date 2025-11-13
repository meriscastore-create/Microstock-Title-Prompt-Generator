import { GoogleGenAI, Type } from "@google/genai";
import { JsonPrompt } from '../types';

const FIXED_COMPOSITION = "Only a few elements are present, Elements randomly ultra airy scattered, not symmetrical, no overlaps or touching. Each stands individually with airy spacing, forming a full, distinct diamond-shaped composition without visible outlines. All elements must fit completely inside the diamond area, no parts cropped or touching edges..";
const FIXED_SETTINGS = "--ar 1:1 --v 6 --style raw --q 2 --repeat 2";

const handleApiError = (error: unknown): never => {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        if (error.name === 'AbortError') {
            throw new Error("Request aborted by user.");
        }
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

export const generateTrendKeywords = async (apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });
  
    const currentDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

    const prompt = `You are a microstock trend analyst with deep expertise in Shutterstock and Adobe Stock. Your task is to identify EXACTLY 10 high-demand keywords that will be trending or are consistently popular, starting from today, ${currentDate}.

**Analysis Criteria:**
1.  **Forward-Looking (8 Keywords):** Analyze upcoming seasons, holidays (like Halloween, Christmas, Diwali, Hanukkah), and global events. Predict what designers and marketers will be searching for soon. Include at least one keyword that is not event-based but represents a popular aesthetic or concept (e.g., 'Cottagecore', 'Abstract 3D shapes').
2.  **Evergreen Birthday Themes (2 Keywords):** Your list MUST include two distinct, commercially popular birthday-themed keywords. These are essential as they are in demand year-round. Examples: 'Kids Birthday Party', 'Cute Animal Birthday'.
3.  **Platform Relevance:** Focus on concepts that are commercially viable and popular on Shutterstock and Adobe Stock.
4.  **Conciseness:** Each keyword should be a short, descriptive phrase of 2-4 words.

**!! CRITICAL OUTPUT FORMAT !!**
- Your entire response MUST be a single line of text.
- It must contain EXACTLY 10 keywords, separated by a comma.
- **DO NOT** add any introductory text, explanations, numbers, bullet points, or markdown formatting.

**Example of a perfect response:**
Cozy Fall Aesthetic, Minimalist Christmas, Cyber Monday Deals, Hanukkah Dreidels, Diwali Lanterns, Abstract 3D Shapes, AI Technology Concept, Winter Solstice, Kids Birthday Party, Cute Animal Birthday

**Your Mission:**
Generate the 10 keywords now, ensuring 2 are birthday-themed.`;
  
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

export const generateUniqueKeywords = async (baseKeywords: string, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a creative director for a microstock agency, an expert at creating commercially successful niche concepts.
    
    **Theme:** "${baseKeywords}"

    **Your Task:**
    Generate EXACTLY ONE common, popular, and commercially relevant keyword to combine with the theme. This new keyword should be a popular search term itself but create a unique, marketable, and eye-catching vector illustration concept when combined.
    
    **!! CRITICAL CONSTRAINTS !!**
    1.  **Avoid Absurdity:** The keyword should be common and easily recognizable (e.g., 'cats', 'botanical', 'technology', 'food'). Do not use overly obscure, abstract, or nonsensical words. The goal is a creative combination of popular topics.
    2.  **Format:** Return ONLY the single new keyword (e.g., "botanical").
    3.  **Brevity:** The keyword must be a single word.
    4.  **Exclusivity:** DO NOT include the original keywords in your response.
    5.  **Clean Output:** DO NOT add any explanation, introductory text, or markdown formatting.

    **Examples of Excellent Responses (Creative but not Absurd):**
    - Theme: "Vintage Floral Pattern" -> Response: "insects"
    - Theme: "Cyber Monday Banners" -> Response: "origami"
    - Theme: "Minimalist Christmas Background" -> Response: "geometric"

    Generate the single keyword for the theme "${baseKeywords}" now.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text.trim().replace(/\*/g, '');
    } catch (error) {
        handleApiError(error);
    }
};


export const generateTitle = async (keyword: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API key is not set.");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are a world-class microstock SEO and title generation expert. Your task is to generate a descriptive, high-quality title for a vector illustration based on user keywords.

**The Structure:**
The title must consist of **three distinct parts, separated by a period (.)**. You must use words and phrases that are popular and common in the microstock industry.

**!! CRITICAL CONSTRAINTS !!**
1. The entire generated title **MUST NOT EXCEED 170 characters** in total. Be concise.
2. The final output must be a clean string, with **NO MARKDOWN FORMATTING** like asterisks (*) or backticks (\`).

**User Keywords:** '${keyword}'

**Your Process:**

1.  **Analyze All Keywords:** Identify the main subject, theme, atmosphere, and any supporting elements from the user's keywords. Your goal is to intelligently incorporate **all concepts** from the user's input across the three parts of the title.
2.  **Construct the 3-Part Title:**

    *   **Part 1: Thematic Introduction.**
        *   This part **MUST** follow the structure: "[atmosphere] [main theme] pattern vector."
        *   The [atmosphere] should be a single descriptive word (e.g., 'cozy', 'winter', 'happy', 'cute').
        *   The [main theme] is the core idea from the user's keywords (e.g., 'Christmas', 'birthday', 'valentine').
        *   The phrase **MUST** end with the words "pattern vector."
        *   *Example for 'Christmas, Festive, Tree':* "Festive Christmas pattern vector."
        *   *Example for 'Birthday, Pet, Cute':* "Cute Birthday Pet pattern vector."

    *   **Part 2: Descriptive Core.**
        *   This part describes the visual elements. It **MUST** contain the word "seamless" and "pattern".
        *   The structure **MUST** be: "Seamless [main subject] pattern with [element], [element], and [element]."
        *   **CRITICAL: DO NOT use the phrase "pattern of". The structure must be "[subject] pattern".**
        *   Use the main visual subject and other visual elements from the user's keywords here.
        *   **CRITICAL: All elements (the main subject and supporting elements) must be single nouns ONLY. List elements directly.** For example, use "reindeer, moon, stars", not "flying reindeer, glowing moon, shimmering stars".
        *   **CRITICAL: The connecting word between the main subject and supporting elements MUST be "with".** Do not use "featuring," "and," or other variations.
        *   If the user's keywords are broad (like 'Christmas'), you MUST brainstorm and add specific, popular single-noun elements for the supporting elements (e.g., 'gingerbread', 'candy cane', 'snowflake').
        *   *Example based on 'Christmas Tree':* "Seamless Christmas tree pattern with gingerbread, candy cane, and snowflake."

    *   **Part 3: Concluding Phrase.**
        *   A short, descriptive summary phrase that reinforces the theme. Use any remaining thematic keywords here.
        *   It must act as a strong, keyword-rich conclusion, often ending with words like "Background", "Pattern", or "Design".
        *   **CRITICAL: DO NOT describe applications or uses (e.g., do not use "for textile print").**
        *   **DO NOT start with the word "For".**
        *   *Examples:* "Merry Christmas Gifting Seamless Pattern Background.", "Cute Animal Birthday Party Pattern.", "Festive Holiday Seamless Background."

**Your Mission:**
Apply this exact process to the keywords: '${keyword}'. Generate one single, high-quality, three-part title, strictly adhering to all critical constraints.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    // Clean up any potential markdown that might slip through and ensure spacing after periods.
    const title = response.text.trim().replace(/\*/g, '');
    return title.replace(/\.(?!\s|$)/g, '. ');
  } catch (error) {
    handleApiError(error);
  }
};

export const changeTitleElements = async (currentTitle: string, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert microstock title editor. Your task is to revise a given 3-part title by changing ONLY the supporting descriptive elements in the second part, while keeping the main subject and overall structure intact.

**Original Title to Revise:**
"${currentTitle}"

**Your Process:**
1.  **Analyze:** Identify the main subject (e.g., 'Christmas Tree') and the supporting elements (e.g., 'gingerbread', 'candy canes') from the second part of the title.
2.  **Preserve Structure:** Keep Part 1 (Thematic Introduction) and Part 3 (Concluding Phrase) almost exactly the same as the original. Minor, natural-sounding variations are acceptable if necessary.
3.  **Revise Core Description (Part 2):**
    *   Replace the original supporting elements with **two or three new, different, but equally popular and relevant single-noun elements** that fit the main subject.
    *   Maintain the strict structure: "Seamless [main subject] pattern with [new element], [new element], and [new element]."
    *   **CRITICAL: DO NOT use the phrase "pattern of". The structure must be "[subject] pattern".**
    *   **CRITICAL: The new elements must be single nouns.** (e.g., "reindeer", "snowflake", not "flying reindeer").

**!! CRITICAL CONSTRAINTS !!**
- The entire revised title **MUST NOT EXCEED 170 characters**.
- The output MUST be a single, clean string with **NO MARKDOWN FORMATTING**.
- **DO NOT change the main subject.**
- The new elements must be different from the ones in the original title.

**Example:**
- **Original:** "Festive Christmas pattern vector. Seamless Christmas tree pattern with gingerbread and candy canes. Merry Christmas Seamless Pattern Background."
- **Excellent Revision:** "Festive Christmas pattern vector. Seamless Christmas tree pattern with reindeer and snowflakes. Merry Christmas Seamless Pattern Background."

Now, apply this exact process to revise the title: "${currentTitle}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const title = response.text.trim().replace(/\*/g, '');
        return title.replace(/\.(?!\s|$)/g, '. ');
    } catch (error) {
        handleApiError(error);
    }
};

export const generateJsonPrompt = async (title: string, apiKey: string): Promise<JsonPrompt> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a creative AI art director. Your task is to expand a microstock title into a complete, descriptive JSON prompt for an AI image generator. You must choose the BEST possible style that fits the theme.

**Microstock Title:** "${title}"

**Your Process:**
1.  **Analyze Theme:** Deeply analyze the title to understand its core theme, subject matter, and mood (e.g., 'Christmas', 'vintage', 'cute animal').
2.  **Select the Perfect Style:**
    *   Choose the most commercially appealing and artistically appropriate vector-friendly style for this theme.
    *   **CRITICAL STYLE CONSTRAINTS:** AVOID photorealistic, 3D rendering, complex shading, or painterly styles (like watercolor, oil painting). Focus on styles that work well as clean, scalable vector graphics (e.g., Flat Graphic, Kawaii, Art Deco, Line Art, Memphis).
3.  **Generate a VIBRANT & DIVERSE Palette:**
    *   Create a matching color palette. It MUST be vibrant, eye-catching, and thematically appropriate.
    *   **CRITICAL COLOR CONSTRAINT:** Do not default to blue-dominant palettes unless the theme explicitly requires it (e.g., 'ocean life'). Strive for color diversity.
4.  **Construct the JSON:** Generate a single, valid JSON object with five fields: "concept", "color", "background", "mood", and "style".

**!! CRITICAL JSON FIELD CONSTRAINTS !!**

*   **concept:**
    *   A single descriptive sentence elaborating on the title's visual elements.
    *   Add rich adjectives to the simple nouns from the title.
    *   **DO NOT** include the words "seamless," "pattern," or "illustration."
    *   *Example:* "A delightful Christmas tree scene, with festive gingerbread cookies and sweet candy canes."

*   **color:**
    *   A descriptive phrase for a non-gradient color palette.
    *   **MUST** start with the exact phrase "non-gradient color".
    *   The palette should be vibrant and well-suited to the chosen style and theme.
    *   **DO NOT** mention specific color names (e.g., "red", "blue").
    *   *Example:* "non-gradient color, Festive Holiday Hues, Cheerful Contrast, Warm & Cozy Tones, Bright Finish"

*   **background:**
    *   A descriptive phrase for a clean, single-color background.
    *   **MUST** include the exact phrase "solid single color".
    *   *Example:* "solid single color, Smooth Surface, Minimal Distraction, Clear Focus"

*   **mood:**
    *   A list of 4-5 adjectives reflecting the overall mood.
    *   *Example:* "Festive, Joyful, Cozy, Whimsical, Cheerful"

*   **style:**
    *   The format **MUST** be: 'style vector detail : [Style Name] ([Characteristic 1], [Characteristic 2], [Characteristic 3], [Characteristic 4])'.
    *   *Example:* "style vector detail : Children's Book (Soft Lines, Gentle Proportions, Expressive Gestures, Storytelling Focus)"

**Your Mission:**
Generate the complete JSON object for the title "${title}", ensuring every field strictly adheres to its constraints. The final output must be only the JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      concept: { type: Type.STRING },
                      color: { type: Type.STRING },
                      background: { type: Type.STRING },
                      mood: { type: Type.STRING },
                      style: { type: Type.STRING },
                    },
                    required: ["concept", "color", "background", "mood", "style"],
                }
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

    const prompt = `You are an AI specializing in creating MAXIMUM IMPACT color palettes. Your task is to generate a new, HYPER-SATURATED and ELECTRIC color palette, background, and mood. The goal is 100% color boost, pure energy, and zero subtlety.

**Existing Prompt Context:**
- **Concept:** "${currentPrompt.concept}"
- **Style:** "${currentPrompt.style}"

**Your Task:**
Generate a JSON object with new values for "color", "background", and "mood". The new palette MUST be EXPLOSIVELY VIBRANT, with MAXIMUM SATURATION and an almost NEON glow. It must be impossible to ignore.

**!! CRITICAL CONSTRAINTS !!**
1.  **Absolutely NO subtle, pastel, muted, desaturated, or faded colors.** The output should feel like it's glowing.
2.  **color:**
    *   The description MUST start with the exact phrase "non-gradient color".
    *   It must describe a palette of pure, intense, high-energy colors. Use words like 'electric', 'luminous', 'hyper-saturated', 'vivid'.
    *   Do NOT mention specific color names (e.g., "red", "blue").
3.  **background:**
    *   The description MUST include the exact phrase "solid single color".
    *   It should describe a background that amplifies the intensity of the main palette.
4.  **mood:**
    *   Provide a list of 4-5 adjectives reflecting extreme energy and vibrancy.

**Example of a MAXIMUM VIBRANCY Output:**
{
  "color": "non-gradient color, Electric Neon Hues, Hyper-Saturated Tones, Luminous Contrast, Maximum Vibrancy, High-Energy Palette",
  "background": "solid single color, Intense High-Gloss Surface, Pure Energy Focus, Zero Distractions",
  "mood": "Electric, Dynamic, Hypnotic, Bold, Unforgettable"
}

**Important:** The final output must be a single, valid JSON object with only the "color", "background", and "mood" keys.`;

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

export const changeStyle = async (currentPrompt: JsonPrompt, previousStyles: string[], apiKey: string): Promise<Partial<JsonPrompt>> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an expert AI Art Director. Your mission is to generate a new, compelling, and commercially viable artistic direction for a given concept, ensuring it is distinct from styles already attempted.

**Core Concept:**
"${currentPrompt.concept}"

**Styles Already Attempted (DO NOT REPEAT):**
${previousStyles.map(s => `- ${s}`).join('\n')}

**Your Task:**
Generate a completely new and different style, along with a matching color palette, background, and mood.

**!! CRITICAL CONSTRAINTS !!**
1.  **Style Uniqueness:** The new style **MUST BE SUBSTANTIALLY DIFFERENT** from all styles in the "Already Attempted" list.
2.  **Vector & Raster Friendliness:** The style **MUST** be suitable for clean, scalable vector illustration.
    *   **AVOID:** Photorealistic rendering, 3D styles, complex gradients, heavy textures, painterly effects (e.g., watercolor, oil).
    *   **FAVOR:** Flat graphics, line art, geometric styles, stylized illustrations (e.g., Art Deco, Memphis, Ukiyo-e, Corporate Membranism, Modern Folk Art).
3.  **Color Diversity & Vibrancy:**
    *   Generate an EXPLOSIVELY VIBRANT and HYPER-SATURATED color palette that matches the new style.
    *   **DO NOT** default to a blue-heavy palette unless the concept demands it. Be creative and diverse with color.

**Required JSON Output Format:**
You must return a single, valid JSON object with "style", "color", "background", and "mood" fields.

*   **style:** A specific art style with four characteristics.
    *   Format: \`style vector detail : [Style Name] ([Characteristic 1], [Characteristic 2], [Characteristic 3], [Characteristic 4])\`
    *   *Example:* "style vector detail : Art Deco (Glamorous Forms, Geometric Precision, Symmetrical Layout, Elegant Lines)"

*   **color:** A descriptive phrase for a non-gradient color palette.
    *   **MUST** start with "non-gradient color".
    *   **MUST** describe a VIBRANT, HYPER-SATURATED palette.
    *   **DO NOT** mention specific color names.
    *   *Example:* "non-gradient color, Electric Neon Palette, Luminous High-Contrast, Hyper-Saturated Tones"

*   **background:** A descriptive phrase for a clean, single-color background.
    *   **MUST** include the phrase "solid single color".
    *   **DO NOT** mention specific colors.
    *   *Example:* "solid single color, high-impact, pure energy focus"

*   **mood:** A list of 4-5 adjectives that fit the new style.
    *   *Example:* "energetic, luxurious, sophisticated, modern"

**Your Mission:**
Generate the JSON object for the concept "${currentPrompt.concept}", strictly adhering to all constraints.`;
    
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