
import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, TrendData, Region } from "../types";

export const fetchTrends = async (mode: AppMode, region: Region): Promise<TrendData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.Gemini API Key || '' });
  
  const regionContext = region === 'arab' 
    ? "Focus exclusively on Egypt and the Arab world. Look for trends in Arabic and English popular in this region (MENA)." 
    : "Focus on International/Foreign trends (USA, Europe, Global West). Look for globally viral trends.";

  const modeContext = mode === 'global'
    ? "Analyze general social media trends across Facebook, TikTok, Instagram, X (Twitter), and YouTube."
    : "Identify top social media trends for NGOs and humanitarian impact. Focus on HIGH-REACH topics such as Gaza support, digging wells, charity (Sadaqah), education initiatives, and environmental activism.";

  const prompt = `
    ${regionContext}
    ${modeContext}
    
    TIME FRAME: Focus on the LAST 3 MONTHS, with a heavy emphasis on TODAY and the current week. I need the freshest, most up-to-date data.
    
    CRITICAL QUANTITY RULES:
    - You MUST provide EXACTLY 6 items for the 'music' category.
    - You MUST provide EXACTLY 6 items for the 'content' category.
    - You MUST provide EXACTLY 6 items for the 'hashtag' category.
    - TOTAL = 18 items. Do not provide fewer than 6 per category.
    
    CONTENT FOCUS:
    - For 'Content', focus on specific high-reach posts, viral topics, or trending discussions (e.g., specific humanitarian stories for NGOs).
    - For 'Music', focus on the top 6 trending tracks/artists currently being used in reels/tiktoks.
    - For 'Hashtag', focus on the top 6 tags with the highest velocity today.
    
    PLATFORMS: 
    - Facebook MUST be included alongside TikTok, Instagram, X, and YouTube.
    
    OUTPUT:
    - For each item, provide a valid URL (direct or search link).
    - Return the result as a JSON object with 'items' and 'analysis'.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING, description: "One of: music, content, hashtag" },
                platform: { type: Type.ARRAY, items: { type: Type.STRING } },
                engagement: { type: Type.STRING },
                momentum: { type: Type.NUMBER },
                description: { type: Type.STRING },
                url: { type: Type.STRING, description: "A direct link or search link" }
              },
              required: ["title", "category", "platform", "engagement", "momentum", "description", "url"]
            }
          },
          analysis: { type: Type.STRING, description: "A strategic overview of the current landscape" }
        },
        required: ["items", "analysis"]
      }
    },
  });

  const text = response.text || '{}';
  const rawData = JSON.parse(text);
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Contextual Source',
    uri: chunk.web?.uri || '#'
  })) || [];

  return {
    items: rawData.items || [],
    analysis: rawData.analysis || '',
    sources: sources
  };
};
