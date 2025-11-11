import { GoogleGenAI, Type } from "@google/genai";
import { JsonPrompt } from '../types';

const FIXED_COMPOSITION = "Only a few elements are present, Elements randomly ultra airy scattered, not symmetrical, no overlaps or touching. Each stands individually with airy spacing, forming a full, distinct diamond-shaped composition without visible outlines. All elements must fit completely inside the diamond area, no parts cropped or touching edges..";
const FIXED_SETTINGS = "--ar 1:1 --v 6 --style raw --q 2 --repeat 2";

const handleApiError = (error: unknown): never => {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key not valid') || error.message.toLowerCase().includes('permission denied')) {
             throw new Error("Kunci API Anda tampaknya tidak valid atau kurang izin. Silakan masukkan kunci yang valid.");
        }
    }
    throw new Error("Terjadi kesalahan tak terduga dengan layanan AI. Silakan coba lagi nanti.");
};

export const generateTitle = async (keyword: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("Kunci API belum diatur.");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Buat judul microstock untuk kata kunci: '${keyword}'.

**Batasan:** Panjang total judul akhir HARUS di bawah 180 karakter.

Judul harus mengikuti struktur tiga bagian ini dengan tepat:
1.  **Kalimat Pertama:** Frasa pendek yang menarik dengan subjek utama dan kata "pola".
2.  **Kalimat Kedua:** Kalimat yang lebih deskriptif yang merinci subjek utama dan elemen pendukung.
3.  **Bagian Ketiga:** Serangkaian kata kunci dan frasa deskriptif yang dipisahkan koma. Bagian ini harus menyertakan kata "seamless" dan "latar belakang vektor", dan menyarankan penggunaan seperti "tekstil" atau "cetak".

**Tujuan:** Output akhir harus diformat persis seperti yang ditunjukkan pada contoh di bawah, dengan panjang di bawah 180 karakter. Judul harus terdengar alami, deskriptif, dan dioptimalkan untuk pencarian microstock.

**Contoh untuk input 'Kucing Gembira':**
Pola kucing gembira. Karakter anak kucing lucu dengan hati dan bintang. Latar belakang vektor hewan peliharaan seamless, cetakan hewan kartun, ilustrasi grafis tekstil.

**Contoh untuk input 'Pohon Natal':**
Pola pohon Natal. Pohon liburan meriah dengan ornamen dan hadiah. Latar belakang vektor musim dingin seamless, ilustrasi hutan, untuk kain dan cetak.

**Contoh untuk input 'Dedaunan, Holly':**
Pola dedaunan musim dingin. Daun holly dan komposisi buah beri merah. Latar belakang vektor Natal seamless, cetakan botani meriah, untuk bungkus kado dan tekstil.`;

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
    concept: { type: Type.STRING, description: "Kalimat deskriptif singkat dengan 1 elemen utama dan 2 elemen pendukung dari judul. Tidak boleh mengandung kata 'seamless', 'pattern', atau 'illustration'." },
    color: { type: Type.STRING, description: "Frasa deskriptif untuk palet warna lembut, kalem, pastel, non-gradien. Format: 'deskripsi (warna1, warna2, warna3, ...)'" },
    background: { type: Type.STRING, description: "Frasa deskriptif untuk latar belakang satu warna yang HARUS menyertakan frasa 'solid single color'. Format: 'deskripsi, solid single color (warna)'" },
    mood: { type: Type.STRING, description: "Daftar suasana hati yang dipisahkan koma, sesuai dengan gaya. Format: 'suasana1, suasana2, suasana3, ...'" },
    style: { type: Type.STRING, description: "Satu nama gaya seni diikuti oleh 4 karakteristiknya, dipisahkan koma. Format: 'Nama Gaya, karakteristik1, karakteristik2, ...'" },
  }
};

export const generateJsonPrompt = async (title: string, apiKey: string): Promise<JsonPrompt> => {
    if (!apiKey) throw new Error("Kunci API belum diatur.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Berdasarkan judul microstock "${title}", buat prompt JSON untuk generator gambar AI. Patuhi secara ketat skema yang disediakan dan aturan berikut:

    1.  **concept**: Buat kalimat deskriptif menggunakan subjek utama dan dua elemen pendukung dari judul. JANGAN gunakan kata "seamless", "pattern", atau "illustration".
        *   Contoh: "Anak kucing meriah yang lucu mengenakan topi Santa, hewan peliharaan musim dingin liburan."
    2.  **color**: Jelaskan palet warna yang lembut, hangat, kalem, pastel, alami, dan non-gradien yang sesuai dengan tema judul.
        *   Contoh: "nada musim dingin meriah yang lembut, hangat, kalem, pastel, alami, non-gradien (merah kalem, hijau hutan, krem, abu-abu muda, krem)"
    3.  **background**: **Analisis judul untuk petunjuk tentang latar belakang (misalnya, 'di latar belakang gelap', 'latar belakang terang'). Buat deskripsi latar belakang yang cocok.** Jika judul tidak memberikan petunjuk, pilih warna yang cerah dan serasi. Deskripsi HARUS selalu satu warna dan HARUS menyertakan frasa persis "solid single color".
        *   Contoh (jika judul menyiratkan kegelapan): "dalam, murung, solid single color (abu-abu arang)."
        *   Contoh (default): "cerah, serasi, solid single color (biru es muda)."
    4.  **mood**: Sebutkan beberapa suasana hati yang sesuai dengan gaya dan warna.
        *   Contoh: "meriah, ceria, lucu, nyaman, menyenangkan, bahagia, sehat"
    5.  **style**: Sebutkan satu gaya seni spesifik (misalnya, lukisan Gouache, Skandinavia, Kawaii) diikuti oleh empat karakteristik utamanya.
        *   Contoh: "Lukisan guas, pigmen buram, hasil akhir matte, garis tebal"
    
    Seluruh respons harus berupa satu objek JSON yang valid dan panjangnya kurang dari 910 karakter.`;

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
    if (!apiKey) throw new Error("Kunci API belum diatur.");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Berdasarkan konsep dan gaya prompt AI yang ada:
    - Konsep: "${currentPrompt.concept}"
    - Gaya: "${currentPrompt.style}"
    
    Buat palet warna, latar belakang, dan suasana hati yang baru. Warna harus tetap lembut, kalem, pastel, dan non-gradien. Deskripsi latar belakang HARUS menyertakan frasa 'solid single color'.
    Ikuti contoh format ini dengan ketat:
    - "color": "nada musim dingin meriah yang lembut, hangat, kalem, pastel, alami, non-gradien (merah kalem, hijau hutan, krem, abu-abu muda, krem)"
    - "background": "cerah, serasi, solid single color (biru es muda)."
    - "mood": "meriah, ceria, lucu, nyaman, menyenangkan, bahagia, sehat"

    Kembalikan hanya objek JSON dengan field "color", "background", dan "mood".`;

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
    if (!apiKey) throw new Error("Kunci API belum diatur.");
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Berdasarkan konsep prompt AI yang ada:
    - Konsep: "${currentPrompt.concept}"
    
    Gaya saat ini adalah "${currentPrompt.style}". Buat gaya yang sama sekali berbeda, bersama dengan palet warna, latar belakang, dan suasana hati baru yang cocok.
    Ikuti contoh format ini dengan ketat:
    - "style": Satu gaya seni spesifik diikuti oleh empat karakteristik utamanya. Contoh: "Lukisan guas, pigmen buram, hasil akhir matte, garis tebal"
    - "color": Frasa deskriptif untuk palet warna lembut non-gradien. Contoh: "nada musim dingin meriah yang lembut, hangat, kalem, pastel, alami, non-gradien (merah kalem, hijau hutan, krem, abu-abu muda, krem)"
    - "background": Frasa deskriptif untuk latar belakang satu warna yang HARUS menyertakan frasa 'solid single color'. Contoh: "cerah, serasi, solid single color (biru es muda)."
    - "mood": Daftar suasana hati yang cocok dengan gaya baru. Contoh: "meriah, ceria, lucu, nyaman, menyenangkan, bahagia, sehat"

    Kembalikan hanya objek JSON dengan field "style", "color", "background", dan "mood".`;
    
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