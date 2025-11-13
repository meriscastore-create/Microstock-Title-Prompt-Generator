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
      style: "style vector detail : Typographic (Bold Letterforms, GridAlignment, Minimal Decoration, Clear Hierarchy, Modern Balance)"
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

    const prompt = `You are a creative AI art director. Your task is to expand a simple, SEO-friendly microstock title into a rich, descriptive "concept" for an AI image generator.

**Microstock Title:** "${title}"

**Your Process:**
1.  **Identify Core Elements:** From the second part of the title, identify the main subject and the simple, single-noun supporting elements (e.g., subject: 'bird', elements: 'leaf', 'branch').
2.  **Elaborate Creatively:** Create a single, descriptive sentence for the "concept". In this sentence, you MUST add descriptive adjectives and richer context to the simple nouns. Transform the basic elements into a vivid scene.
    *   **CRITICAL:** This is where you add the creativity that was forbidden in the title.
    *   You can use phrases like "featuring," "with a combination of," etc.
    *   Example Transformation:
        *   Title Elements: 'bird, leaf, branch'
        *   **Excellent "concept":** "A cute flying bird featuring a combination of autumn leaves and a cozy tree branch."
        *   Title Elements: 'Christmas tree, gingerbread, candy cane'
        *   **Excellent "concept":** "A delightful Christmas tree scene, with festive gingerbread cookies and sweet candy canes."
3.  **Constraints:**
    *   The "concept" MUST NOT contain the words "seamless," "pattern," or "illustration."
    *   The entire output must be a single, valid JSON object containing only the "concept" field.

Generate the JSON "concept" now based on the title.`;

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
                    },
                    required: ["concept"],
                }
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

Also generate a new matching color palette, background, and mood. The color palette must have MAXIMUM VIBRANCY and be HYPER-SATURATED, glowing with energy.

Strictly follow this example format:
- "style": A specific art style with four characteristics. The format must be: 'style vector detail : [Style Name] ([Characteristic 1], [Characteristic 2], [Characteristic 3], [Characteristic 4])'. Example: "style vector detail : Art Deco (Glamorous Forms, Geometric Precision, Symmetrical Layout, Elegant Lines)"
- "color": A descriptive phrase for a non-gradient color palette. It MUST start with "non-gradient color". The palette must be EXPLOSIVELY VIBRANT and HYPER-SATURATED. It must NOT mention specific colors. Example: "non-gradient color, Electric Neon Palette, Luminous High-Contrast, Hyper-Saturated Tones"
- "background": A descriptive phrase for a clean, single-color background that MUST include the phrase 'solid single color'. DO NOT mention specific colors. Example: "clean, bold, solid single color background"
- "mood": A list of moods that fit the new new style. Example: "energetic, luxurious, sophisticated, modern"

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