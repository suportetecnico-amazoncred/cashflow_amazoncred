import { GoogleGenAI } from "@google/genai";
import { Client } from "../types.js";

export const getFinancialInsight = async (client: Client): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Atue como um mentor financeiro da Amazoncred. 
      Analise os dados deste cliente:
      - Saldo em Conta: R$ ${client.balance}
      - Dívida de Empréstimo: R$ ${client.creditUsed}
      - Reserva na Poupança: R$ ${client.savings}
      - Valor da Parcela Atual: R$ ${client.installmentValue}

      Gere uma dica financeira extremamente curta (máximo 140 caracteres), motivadora e profissional. 
      Não use markdown pesado. Seja direto. Se ele não tiver dívida, parabenize. Se a dívida for alta, sugira cautela ou poupança.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Continue gerindo suas finanças com sabedoria!";
  } catch (error) {
    console.error("Erro ao obter insight da IA:", error);
    return "Mantenha o foco nos seus objetivos financeiros!";
  }
};