import { GoogleGenAI, Type } from "@google/genai";
import { JsonPrompt } from '../types';

const FIXED_COMPOSITION = "Only a few elements are present, Elements randomly ultra airy scattered, not symmetrical, no overlaps or touching. Each stands individually with airy spacing, forming a full, distinct diamond-shaped composition without visible outlines. All elements must fit completely inside the diamond area, no parts cropped or touching edges..";
const FIXED_SETTINGS = "--ar 1:1 --v 6 --style raw --q 2 --repeat 2";

// --- START: Hardcoded Template Values ---
const PROMPT_TEMPLATES = [
    {
      color: "non-gradient color, Balanced Contrast, Consistent Tone, Unified Palette, Clean Finish, Visual Harmony",
      background: "solid single color, Smooth Surface, Minimal Distraction, Clear Focus, Stable Visual Base, Simple Depth",
      mood: "Playful, Expressive, Lighthearted, Creative, Engaging",
      style: "style vector detail : Kawaii (Rounded Shapes, Clean Lines, Simplified Forms, Minimal Shading, Cute Aesthetic)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Clear Separation, Unified Tone, Consistent Brightness, Gentle Harmony",
      background: "solid single color, Neutral Surface, Simple Depth, Clear Focus, Soft Composition, Minimal Distraction",
      mood: "Playful, Youthful, Energetic, Friendly, Fun",
      style: "style vector detail : Chibi (Exaggerated Proportions, Large Heads, Expressive Faces, Simplified Anatomy, Playful Feel)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Functional Palette, Clear Tone, Stable Finish, Unified Harmony",
      background: "solid single color, Neutral Base, Visual Stability, Minimal Distraction, Clear Layout, Smooth Surface",
      mood: "Energetic, Dynamic, Expressive, Cheerful, Fun",
      style: "style vector detail : Cartoon (Bold Outlines, Dynamic Shapes, Exaggerated Motion, Expressive Characters, Fun Aesthetic)"
    },
    {
      color: "non-gradient color, Balanced Saturation, Subtle Grain, Vintage Tone, Soft Contrast, Clean Separation",
      background: "solid single color, Neutral Base, Smooth Surface, Simple Layout, Clear Composition, Minimal Texture",
      mood: "Nostalgic, Playful, Retro, Warm, Cheerful",
      style: "style vector detail : Retro Cartoon (Thick Lines, Vintage Curves, Simplified Forms, Classic Proportions, Nostalgic Vibe)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Consistent Tone, Unified Palette, Clear Separation, Simple Finish",
      background: "solid single color, Neutral Field, Minimal Distraction, Clear Focus, Light Surface, Clean Layout",
      mood: "Creative, Playful, Spontaneous, Expressive, Free",
      style: "style vector detail : Doodle Art (Freehand Lines, Playful Flow, Irregular Shapes, Spontaneous Energy, Casual Composition)"
    },
    {
      color: "non-gradient color, Soft Contrast, Gentle Tone, Consistent Harmony, Unified Finish, Balanced Depth",
      background: "solid single color, Clean Surface, Smooth Texture, Minimal Detail, Clear Focus, Visual Calm",
      mood: "Dreamy, Playful, Imaginative, Joyful, Light",
      style: "style vector detail : Whimsical (Curved Forms, Flowing Lines, Dreamlike Movement, Imaginative Details, Playful Rhythm)"
    },
    {
      color: "non-gradient color, Flat Tone, Clear Contrast, Balanced Saturation, Consistent Harmony, Honest Finish",
      background: "solid single color, Smooth Plane, Simple Layout, Stable Surface, Clean Composition, Visual Clarity",
      mood: "Sincere, Playful, Innocent, Honest, Expressive",
      style: "style vector detail : Naive Art (Childlike Simplicity, Flat Perspective, Bold Forms, Unrefined Lines, Honest Expression)"
    },
    {
      color: "non-gradient color, Decorative Harmony, Balanced Contrast, Consistent Tone, Clear Finish, Symbolic Palette",
      background: "solid single color, Simple Layout, Clear Focus, Soft Surface, Minimal Detail, Stable Base",
      mood: "Cultural, Warm, Expressive, Traditional, Artistic",
      style: "style vector detail : Folk Art (Handcrafted Look, Decorative Patterns, Symbolic Motifs, Simple Forms, Cultural Warmth)"
    },
    {
      color: "non-gradient color, Soft Contrast, Gentle Harmony, Consistent Tone, Unified Finish, Balanced Palette",
      background: "solid single color, Clean Surface, Simple Layout, Clear Focus, Smooth Plane, Minimal Distraction",
      mood: "Warm, Friendly, Narrative, Joyful, Gentle",
      style: "style vector detail : Children's Book (Soft Lines, Gentle Proportions, Expressive Gestures, Storytelling Focus, Warm Feel)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Consistent Tone, Faceted Harmony, Smooth Finish, Modern Clarity",
      background: "solid single color, Simple Field, Clear Focus, Stable Surface, Minimal Detail, Clean Geometry",
      mood: "Modern, Structured, Cool, Analytical, Sleek",
      style: "style vector detail : Low Poly (Angular Surfaces, Faceted Shapes, Sharp Geometry, Simplified Detail, Digital Aesthetic)"
    },
    {
      color: "non-gradient color, Bold Contrast, Balanced Tone, Clear Separation, Unified Harmony, Strong Finish",
      background: "solid single color, Simple Grid, Clean Surface, Stable Layout, Clear Space, Minimal Noise",
      mood: "Energetic, Playful, Dynamic, Creative, Bold",
      style: "style vector detail : Memphis Style (Geometric Shapes, Bold Patterns, Irregular Grids, Playful Layouts, 80s Energy)"
    },
    {
      color: "non-gradient color, Low Contrast, Balanced Tone, Unified Palette, Clear Finish, Visual Calm",
      background: "solid single color, Smooth Surface, Simple Layout, Clear Focus, Minimal Detail, Stable Space",
      mood: "Calm, Elegant, Clean, Focused, Modern",
      style: "style vector detail : Minimalist (Clean Composition, Simple Geometry, Balanced Space, Few Elements, Refined Clarity)"
    },
    {
      color: "non-gradient color, Bold Contrast, Vivid Intensity, Unified Palette, Clean Finish, Graphic Clarity",
      background: "solid single color, Smooth Surface, Clear Focus, Minimal Texture, Balanced Space, Simple Layout",
      mood: "Energetic, Bold, Playful, Confident, Expressive",
      style: "style vector detail : Pop Art (Bold Outlines, High Contrast, Comic Halftones, Simplified Forms, Retro Graphic Aesthetic)"
    },
    {
      color: "non-gradient color, Flat Tone, Clear Contrast, Consistent Brightness, Balanced Harmony, Clean Finish",
      background: "solid single color, Neutral Plane, Simple Layout, Clear Structure, Smooth Surface, Minimal Noise",
      mood: "Modern, Practical, Direct, Clean, Functional",
      style: "style vector detail : Flat Graphic (Simplified Shapes, No Depth, Solid Forms, Clean Edges, Modern Design Look)"
    },
    {
      color: "non-gradient color, Balanced Tone, Clear Separation, Visual Harmony, Consistent SatURATION, Clean Finish",
      background: "solid single color, Smooth Plane, Simple Focus, Minimal Texture, Clear Layout, Stable Composition",
      mood: "Elegant, Calm, Artistic, Precise, Contemporary",
      style: "style vector detail : Line Art (Continuous Lines, Minimal Detail, Simplified Forms, Expressive Curves, Elegant Flow)"
    },
    {
      color: "non-gradient color, Flat Tone, Balanced Contrast, Unified Finish, Clear Separation, Visual Clarity",
      background: "solid single color, Minimal Layout, Clear Composition, Smooth Plane, Neutral Focus, Stable Base",
      mood: "Modern, Clean, Graphic, Structured, Professional",
      style: "style vector detail : Outline Art (Defined Contours, Clean Edges, Simplified Silhouettes, Uniform Weight, Graphic Precision)"
    },
    {
      color: "non-gradient color, Balanced Tone, Clear Harmony, Visual Brightness, Unified Palette",
      background: "solid single color, Clean Surface, Clear Composition, Minimal Depth, Smooth Plane, Balanced Focus",
      mood: "Playful, Trendy, Modern, Youthful, Fun",
      style: "style vector detail : Sticker Art (Thick Outlines, Simplified Icons, Smooth Shapes, Graphic Pop, Playful Design)"
    },
    {
      color: "non-gradient color, Balanced Tone, Clear Contrast, Consistent Geometry, Clean Finish, Unified Harmony",
      background: "solid single color, Smooth Plane, Structured Grid, Minimal Detail, Clear Focus, Stable Composition",
      mood: "Modern, Ordered, Structured, Precise, Intelligent",
      style: "style vector detail : Geometric (Sharp Angles, Symmetrical Shapes, Repetitive Patterns, Clear Edges, Structured Layout)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Dynamic Tone, Unified Palette, Clean Finish, Expressive Flow",
      background: "solid single color, Smooth Plane, Minimal Depth, Clear Focus, Stable Layout, Subtle Composition",
      mood: "Creative, Expressive, Modern, Conceptual, Artistic",
      style: "style vector detail : Abstract (Free Forms, Dynamic Composition, Simplified Shapes, Expressive Lines, Conceptual Aesthetic)"
    },
    {
      color: "non-gradient color, Strong Contrast, Functional Palette, Clear Tone, Balanced Harmony, Visual Strength",
      background: "solid single color, Structured Grid, Minimal Noise, Clean Surface, Clear Focus, Stable Base",
      mood: "Industrial, Progressive, Constructive, Modern, Bold",
      style: "style vector detail : Constructivism (Geometric Structures, Angular Shapes, Dynamic Layouts, Bold Composition, Functional Design)"
    },
    {
      color: "non-gradient color, Bold Contrast, Minimal Palette, Flat Tone, Consistent Geometry, Clear Balance",
      background: "solid single color, Clean Plane, Stable Focus, Clear Layout, Minimal Texture, Neutral Surface",
      mood: "Rational, Modern, Conceptual, Minimal, Analytical",
      style: "style vector detail : Suprematism (Abstract Forms, Geometric Blocks, Pure Composition, Balanced Space, Non-Representational Layout)"
    },
    {
      color: "non-gradient color, Primary Harmony, Balanced Contrast, Functional Palette, Clear Separation, Unified Finish",
      background: "solid single color, Structured Layout, Clear Focus, Clean Surface, Smooth Plane, Stable Visual Balance",
      mood: "Modern, Rational, Balanced, Clean, Professional",
      style: "style vector detail : Bauhaus (Geometric Shapes, Functional Layouts, Clean Lines, Balanced Space, Constructive Aesthetic)"
    },
    {
      color: "non-gradient color, Clean Contrast, Minimal Palette, Balanced Tone, Subtle Harmony, Clear Finish",
      background: "solid single color, Smooth Plane, Neutral Focus, Simple Layout, Minimal Distraction, Stable Composition",
      mood: "Structured, Functional, Clean, Organized, Neutral",
      style: "style vector detail : Swiss Style (Grid Systems, Clear Typography, Balanced Space, Clean Alignment, Modernist Precision)"
    },
    {
      color: "non-gradient color, Functional Palette, Clear Contrast, Balanced Tone, Unified Finish, Visual Harmony",
      background: "solid single color, Structured Layout, Clean Surface, Minimal Detail, Clear Focus, Stable Composition",
      mood: "Rational, Modern, Objective, Professional, Functional",
      style: "style vector detail : Modernist (Grid Alignment, Simple Forms, Clean Typography, Structured Layout, Functional Aesthetic)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Clear Tone, Consistent Harmony, Unified Finish, Visual Balance",
      background: "solid single color, Clean Plane, Neutral Surface, Clear Structure, Minimal Noise, Stable Focus",
      mood: "Clean, Typographic, Structured, Modern, Refined",
      style: "style vector detail : Typographic (Bold Letterforms, Grid Alignment, Minimal Decoration, Clear Hierarchy, Modern Balance)"
    },
    {
      color: "non-gradient color, Balanced Tone, Clear Harmony, Subtle Contrast, Unified Finish, Visual Purity",
      background: "solid single color, Smooth Surface, Stable Composition, Clear Focus, Minimal Noise, Simple Layout",
      mood: "Calm, Focused, Elegant, Modern, Sophisticated",
      style: "style vector detail : Monochromatic (Single Hue Range, Tonal Balance, Depth through Value, Unified Mood, Minimal Aesthetic)"
    },
    {
      color: "non-gradient color, Strong Contrast, Unified Tone, Clear Balance, Clean Separation, Consistent Depth",
      background: "solid single color, Smooth Field, Clear Focus, Simple Layout, Stable Space, Minimal Texture",
      mood: "Clever, Modern, Elegant, Conceptual, Balanced",
      style: "style vector detail : Negative Space (Visual Balance, Clever Silhouettes, Simplified Composition, Dual Perception, Minimal Structure)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Consistent Tone, Clear Definition, Unified Finish, Smooth Harmony",
      background: "solid single color, Structured Layout, Clear Focus, Minimal Texture, Neutral Plane, Stable Composition",
      mood: "Technical, Clean, Modern, Structured, Innovative",
      style: "style vector detail : Isometric (3D Perspective, Parallel Lines, Structured Depth, Clean Geometry, Precise Layout)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Artistic Tone, Unified Palette, Clear Finish, Consistent Harmony",
      background: "solid single color, Clean Surface, Clear Focus, Smooth Plane, Minimal Detail, Stable Layout",
      mood: "Creative, Expressive, Artistic, Engaging, Warm",
      style: "style vector detail : Illustrative (Detailed Drawing, Expressive Lines, Stylized Forms, Clear Composition, Narrative Touch)"
    },
    {
      color: "non-gradient color, Balanced Tone, Soft Contrast, Unified Finish, Consistent Harmony, Visual Fluidity",
      background: "solid single color, Smooth Surface, Minimal Texture, Clear Focus, Stable Layout, Simple Depth",
      mood: "Organic, Natural, Flowing, Soft, Calm",
      style: "style vector detail : Organic Shapes (Curved Lines, Natural Forms, Smooth Flow, Asymmetrical Balance, Soft Geometry)"
    },
    {
      color: "non-gradient color, Subtle Contrast, Balanced Tone, Consistent Finish, Unified Harmony, Ethereal Clarity",
      background: "solid single color, Smooth Field, Clean Layout, Minimal Detail, Clear Focus, Light Structure",
      mood: "Mystical, Calm, Dreamy, Reflective, Balanced",
      style: "style vector detail : Celestial (Circular Motifs, Flowing Lines, Spatial Balance, Symbolic Shapes, Mystical Geometry)"
    },
    {
      color: "non-gradient color, Clear Contrast, Structured Tone, Unified Harmony, Consistent Finish, Visual Stability",
      background: "solid single color, Clean Surface, Defined Layout, Minimal Texture, Clear Focus, Stable Plane",
      mood: "Professional, Technical, Structured, Rational, Detailed",
      style: "style vector detail : Architectural (Precise Lines, Structural Geometry, Grid Balance, Scaled Proportions, Technical Clarity)"
    },
    {
      color: "non-gradient color, Harmonized Tone, Clear Balance, Subtle Contrast, Unified Finish, Visual Flow",
      background: "solid single color, Repetitive Layout, Clean Surface, Minimal Noise, Stable Composition, Balanced Rhythm",
      mood: "Calm, Decorative, Balanced, Elegant, Repetitive",
      style: "style vector detail : Pattern-based (Repetitive Motifs, Structured Grids, Consistent Rhythm, Clear Symmetry, Visual Harmony)"
    },
    {
      color: "non-gradient color, Gentle Contrast, Balanced Tone, Subtle Depth, Unified Finish, Consistent Harmony",
      background: "solid single color, Soft Texture, Smooth Plane, Minimal Noise, Clear Focus, Stable Composition",
      mood: "Soft, Calm, Subtle, Natural, Gentle",
      style: "style vector detail : Subtle Texture (Fine Grain, Smooth Gradation, Gentle Patterns, Soft Surface, Minimal Aesthetic)"
    },
    {
      color: "non-gradient color, Balanced Contrast, Clear Harmony, Unified Finish, Consistent Tone, Visual Strength",
      background: "solid single color, Stable Plane, Clear Focus, Clean Surface, Minimal Detail, Structured Layout",
      mood: "Symbolic, Bold, Classic, Confident, Timeless",
      style: "style vector detail : Emblematic (Symmetrical Shapes, Centered Layout, Bold Outline, Simplified Motifs, Iconic Composition)"
    },
    {
      color: "non-gradient color, Clear Contrast, Unified Tone, Balanced Harmony, Simple Finish, Visual Definition",
      background: "solid single color, Smooth Plane, Clear Focus, Minimal Distraction, Stable Layout, Clean Surface",
      mood: "Elegant, Bold, Defined, Calm, Modern",
      style: "style vector detail : Silhouette (Solid Shapes, Defined Outlines, Simplified Forms, Negative Space, Visual Focus)"
    },
    {
      color: "non-gradient color, Consistent Tone, Balanced Contrast, Unified Finish, Clean Harmony, Smooth Flow",
      background: "solid single color, Clear Surface, Minimal Detail, Stable Layout, Balanced Focus, Simple Plane",
      mood: "Graceful, Artistic, Fluid, Elegant, Peaceful",
      style: "style vector detail : Calligraphic (Flowing Lines, Expressive Curves, Rhythmic Forms, Handcrafted Motion, Elegant Composition)"
    },
    {
      color: "non-gradient color, Balanced Tone, Subtle Contrast, Unified Finish, Visual Calm, Consistent Harmony",
      background: "solid single color, Smooth Surface, Minimal Texture, Clear Focus, Balanced Layout, Simple Depth",
      mood: "Tranquil, Calm, Meditative, Minimal, Harmonious",
      style: "style vector detail : Zen-inspired (Balanced Forms, Empty Space, Gentle Lines, Natural Flow, Peaceful Composition)"
    },
    {
      color: "non-gradient color, Soft Contrast, Neutral Harmony, Balanced Tone, Unified Finish, Clean Simplicity",
      background: "solid single color, Smooth Surface, Minimal Distraction, Clear Focus, Stable Layout, Light Texture",
      mood: "Calm, Cozy, Minimal, Functional, Inviting",
      style: "style vector detail : Nordic Design (Clean Geometry, Natural Balance, Simple Lines, Functional Layout, Warm Minimalism)"
    },
    {
      color: "non-gradient color, Subtle Contrast, Harmonious Tone, Balanced Saturation, Unified Finish, Natural Calm",
      background: "solid single color, Smooth Plane, Clear Composition, Minimal Texture, Stable Focus, Visual Serenity",
      mood: "Serene, Balanced, Elegant, Minimal, Peaceful",
      style: "style vector detail : Japanese Aesthetic (Asymmetrical Balance, Natural Flow, Refined Simplicity, Subtle Lines, Timeless Harmony)"
    }
];
// --- END: Hardcoded Template Values ---

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
  
  const prompt = `You are a world-class microstock SEO and title generation expert. Your task is to generate a descriptive, high-quality title for a vector illustration based on user keywords.

**The Structure:**
The title must consist of **three distinct parts, separated by a period (.)**. You must use words and phrases that are popular and common in the microstock industry.

**!! CRITICAL CONSTRAINTS !!**
1. The entire generated title **MUST NOT EXCEED 170 characters** in total. Be concise.
2. The final output must be a clean string, with **NO MARKDOWN FORMATTING** like asterisks (*) or backticks (\`).

**User Keywords:** '${keyword}'

**Your Process:**

1.  **Analyze Keywords:** Identify the main subject, and overall idea from the user's keywords.
2.  **Construct the 3-Part Title:**

    *   **Part 1: Thematic Statement.**
        *   This is a short, powerful phrase that captures the main idea or occasion.
        *   **Crucially, DO NOT use instructional words like "theme", "event", or "sub-category" in your actual response.**
        *   *Example for 'Christmas, Festive':* "Festive Christmas Holiday Celebration."

    *   **Part 2: Descriptive Core.**
        *   This part describes the visual elements. It **MUST** contain the word "seamless".
        *   **CRITICAL: Your primary goal is to create VARIETY. Do not use the same structure for every title.**
        *   **CRITICAL: DO NOT start this phrase with the article 'A'.**
        *   It **MUST** mention the main subject from the keywords PLUS 2-3 other relevant supporting elements.
        *   **CRITICAL: List elements directly. DO NOT use descriptive adjectives like 'flying', 'glowing', or 'shimmering'.** For example, use "reindeer, moon, and stars", not "flying reindeer, glowing moon, and shimmering stars".
        *   If the user's keywords are broad (like 'Christmas'), you MUST brainstorm and add specific, popular elements (e.g., 'gingerbread', 'candy canes', 'snowflakes').
        *   **Here is a list of excellent, varied structures. Use them as inspiration to create diverse and natural-sounding descriptions:**
            *   "Seamless [main subject] pattern with [element 2] and [element 3]."
            *   "Seamless pattern featuring [main subject], [element 2], and [element 3]."
            *   "Seamless [main subject] and [element 2] pattern with [element 3]."
            *   "Seamless [main subject] background with [element 2] and [element 3] accents."
            *   "Vector seamless pattern of [main subject] with [element 2] and [element 3]."
            *   "Seamless illustration pattern of [main subject], [element 2], and [element 3]."
            *   "Seamless [main subject] print featuring [element 2] and [element 3]."
            *   "Seamless pattern of [main subject] with [element 2] and [element 3] details."
            *   "Seamless [main subject] motif with [element 2] and [element 3]."
            *   "Seamless pattern design with [main subject], [element 2], and [element 3]."
        *   *Example based on 'Christmas Tree':* "Seamless Christmas tree pattern with gingerbread cookies and candy canes."

    *   **Part 3: Application Only.**
        *   Describe **ONLY** the potential uses for the illustration. **DO NOT mention the style** (e.g., do not use words like 'vector', 'cartoon', 'whimsical', 'flat design').
        *   Mention common uses like 'textile print', 'wrapping paper', 'fabric design', 'holiday background', 'wallpaper'.
        *   *Example:* "For textile print, fabric design, and festive wrapping paper background."

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

const conceptSchema = {
    type: Type.OBJECT,
    properties: {
      concept: { type: Type.STRING, description: "A short descriptive sentence with 1 main element and 2 supporting elements from the title. It must not contain the words 'seamless', 'pattern', or 'illustration'." },
    }
};


export const generateJsonPrompt = async (title: string, apiKey: string): Promise<JsonPrompt> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Based on the microstock title "${title}", generate a JSON object with just one key: "concept".

    1.  **concept**: Create a descriptive sentence using the main subject and two supporting elements from the title. DO NOT use the words "seamless", "pattern", or "illustration".
        *   Example for title "Christmas Tree Pattern...": "Cute festive Christmas Tree with reindeer and mountain."
    
    The entire response must be a single, valid JSON object containing only the "concept" field.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: conceptSchema
            }
        });

        const parsedJson = JSON.parse(response.text);
        
        const randomTemplate = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];

        return {
            concept: parsedJson.concept,
            composition: FIXED_COMPOSITION,
            color: randomTemplate.color,
            background: randomTemplate.background,
            mood: randomTemplate.mood,
            style: randomTemplate.style,
            settings: FIXED_SETTINGS,
        };
    } catch (error) {
        handleApiError(error);
    }
};


export const changeColor = async (currentPrompt: JsonPrompt, apiKey: string): Promise<Partial<JsonPrompt>> => {
    if (!apiKey) throw new Error("API key is not set.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert in visual design and color theory. Your task is to generate a new color palette, background description, and mood based on an existing art prompt, while strictly adhering to specific constraints.

**Existing Prompt Context:**
- **Concept:** "${currentPrompt.concept}"
- **Style:** "${currentPrompt.style}"

**Your Task:**
Generate a JSON object with new values for "color", "background", and "mood" that are thematically consistent with the provided concept and style.

**Strict Constraints:**
1.  **color:**
    *   The description MUST start with the exact phrase "non-gradient color".
    *   It must describe a color palette that fits the given style (e.g., if the style is 'Kawaii', the colors should be soft and cute; if it's 'Pop Art', they should be bold and vibrant).
    *   Do NOT mention specific color names (e.g., "red", "blue"). Describe the feeling or quality of the colors.
2.  **background:**
    *   The description MUST include the exact phrase "solid single color".
    *   It should describe a background that complements the concept and new color palette.
3.  **mood:**
    *   Provide a list of 4-5 adjectives describing the mood that aligns with the new color and background, as well as the original style.

**Example Output Format (for a 'Pop Art' style):**
{
  "color": "non-gradient color, Bold Contrast, Vivid Intensity, Unified Palette, Graphic Clarity",
  "background": "solid single color, Smooth Surface, Clear Focus, Minimal Texture, Balanced Space",
  "mood": "Energetic, Bold, Playful, Confident, Expressive"
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