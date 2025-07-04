import React, { useState, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface AISuvicharCardProps {
  prompt: string;
}

const AISuvicharCard: React.FC<AISuvicharCardProps> = ({ prompt }) => {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuote = async () => {
      if (!process.env.API_KEY) {
        setError('API Key not found.');
        setLoading(false);
        setQuote('AI feature is disabled. Please configure the API Key.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: prompt,
        });
        
        // Remove quotes if the AI includes them
        let text = response.text.trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('“') && text.endsWith('”'))) {
            text = text.substring(1, text.length - 1);
        }
        setQuote(text);

      } catch (err) {
        console.error("Failed to fetch AI quote:", err);
        setError('Could not fetch a thought for the day.');
        setQuote('The journey of a thousand miles begins with a single step.'); // Fallback quote
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [prompt]);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 text-white p-6 rounded-lg shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2">✨ Thought for the Day</h3>
            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-white/30 rounded w-3/4"></div>
                    <div className="h-4 bg-white/30 rounded w-1/2"></div>
                </div>
            ) : (
                <p className="text-lg italic">"{quote}"</p>
            )}
             <p className="text-xs mt-3 opacity-70 text-right">Powered by Gemini</p>
        </div>
    </div>
  );
};

export default AISuvicharCard;
