import React, { useEffect, useState } from 'react';
import { Client } from '../types.js';
import { getFinancialInsight } from '../services/geminiService.js';

interface AIInsightsProps {
  client: Client;
}

const AIInsights: React.FC<AIInsightsProps> = ({ client }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      const text = await getFinancialInsight(client);
      setInsight(text);
      setLoading(false);
    };

    fetchInsight();
  }, [client.id, client.creditUsed, client.balance]); // Atualiza se dados críticos mudarem

  return (
    <div className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-white/40 backdrop-blur-md border border-emerald-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-200 animate-pulse">
          ✨
        </div>
        <div className="flex-1">
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Dica Amazoncred AI</h4>
          {loading ? (
            <div className="space-y-2">
              <div className="h-2 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-2 bg-slate-100 rounded-full w-1/2 animate-pulse"></div>
            </div>
          ) : (
            <p className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed italic">
              "{insight}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;