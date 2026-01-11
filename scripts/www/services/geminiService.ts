import { GoogleGenAI, Type } from "@google/genai";
import { ShoppingItemFormData, PurchaseStatus, UsageStatus, UnitCostType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SHOPPING_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Product name" },
    category: { type: Type.STRING, description: "One of: 数码/电器, 服饰/鞋包, 美妆/护肤, 食品/饮料, 家居/日用, 图书/文具, 运动/户外, 虚拟/服务, 其他" },
    status: { type: Type.STRING, enum: [PurchaseStatus.BOUGHT, PurchaseStatus.PLANNED] },
    listPrice: { type: Type.NUMBER },
    actualPrice: { type: Type.NUMBER },
    discountRate: { type: Type.NUMBER },
    purchaseDate: { type: Type.STRING, description: "YYYY-MM-DD format if mentioned, otherwise empty or today's date if implied 'today'" },
    usageStatus: { type: Type.STRING, enum: [UsageStatus.NEW, UsageStatus.IN_USE, UsageStatus.FINISHED, UsageStatus.IDLE, UsageStatus.RETURNED] },
    unitCostType: { type: Type.STRING, enum: [UnitCostType.PER_ITEM, UnitCostType.PER_USE, UnitCostType.PER_DAY, UnitCostType.PER_GRAM, UnitCostType.TOTAL] },
    unitCost: { type: Type.NUMBER },
    link: { type: Type.STRING },
    notes: { type: Type.STRING, description: "Any other details mentioned" },
  },
  required: ["name", "actualPrice"]
};

export const parseShoppingText = async (text: string): Promise<Partial<ShoppingItemFormData> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract shopping item details from the following text into a JSON object. 
      Analyze the text to determine the product name, price (list and actual), category, and status.
      If a price is mentioned as "original" or "market price", map it to listPrice.
      If "bought" or past tense implies purchase, set status to 'bought', otherwise 'planned'.
      Calculate discountRate if both prices are available ((list - actual) / list * 100).
      Infer category from context.
      
      Text to parse: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: SHOPPING_ITEM_SCHEMA
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini parse error:", error);
    return null;
  }
};

export const parseShoppingImage = async (imageBase64: string, mimeType: string, textContext: string = ''): Promise<Partial<ShoppingItemFormData> | null> => {
  try {
    const prompt = `Analyze this image (screenshot of a product page, shopping cart, or receipt) and extract shopping item details into a JSON object.
    Look for product name, price (list and actual/paid), category, status, date, etc.
    ${textContext ? `Additional user context: ${textContext}` : ''}
    If a price is crossed out, it's the listPrice. The main price is actualPrice.
    If it looks like a completed order or receipt, set status to 'bought'.
    Infer category.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: SHOPPING_ITEM_SCHEMA
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini image parse error:", error);
    return null;
  }
};

export const suggestSpendingAdvice = async (itemsJson: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these shopping items and provide a brief, helpful financial summary and advice in Chinese. 
      Focus on spending habits, potential savings, and category distribution. Keep it under 100 words.
      Items: ${itemsJson}`,
    });
    return response.text || "暂无建议";
  } catch (error) {
    return "无法获取建议";
  }
}