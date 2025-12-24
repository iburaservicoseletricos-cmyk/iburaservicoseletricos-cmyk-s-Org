
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateQuestions(subject: string, examType: string, startOffset: number = 0): Promise<any[]> {
  const ai = getAI();
  // Instruímos a IA a simular que está puxando de um banco de 1000 questões, usando o offset para variar o conteúdo.
  const prompt = `Atue como um sistema de banco de dados de 1000 questões de alta qualidade. 
  Gere uma sequência de 10 questões inéditas de nível difícil para o concurso ${examType} sobre a matéria ${subject}.
  Considere que o aluno já resolveu ${startOffset} questões deste banco, então gere questões subsequentes e diferentes.
  As questões devem seguir o padrão de múltipla escolha (A, B, C, D, E). 
  Retorne um array de objetos JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              subject: { type: Type.STRING },
              text: { type: Type.STRING, description: "O enunciado da questão" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array com exatamente 5 opções"
              },
              correctAnswer: { type: Type.INTEGER, description: "Índice de 0 a 4 da resposta correta" },
              explanation: { type: Type.STRING, description: "Explicação detalhada da resposta" }
            },
            required: ["id", "subject", "text", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Erro ao gerar questões:", error);
    return [];
  }
}

export async function generatePerformanceAnalysis(history: any[]): Promise<string> {
  const ai = getAI();
  const prompt = `Analise o seguinte histórico de simulados de um aluno e forneça dicas de estudo personalizadas: ${JSON.stringify(history)}. Seja motivador e use tom militar. Mencione o progresso dele rumo às 1000 questões por matéria.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "Continue focado na missão, soldado!";
  } catch (error) {
    return "Erro ao analisar desempenho.";
  }
}
