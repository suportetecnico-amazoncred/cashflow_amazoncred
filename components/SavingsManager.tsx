
import React, { useState } from 'react';
import { Client } from '../types.js';

interface SavingsProps {
  clients: Client[];
  onTransfer: (clientId: string, amount: number, description: string) => void;
}

const SavingsManager: React.FC<SavingsProps> = ({ clients, onTransfer }) => {
  const activeClient = clients[0];
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || amount <= 0) return;
    onTransfer(activeClient.id, amount, description);
    setAmount(0);
    setDescription('');
  };

  if (!activeClient) return <div className="p-10 text-center text-slate-400">Carregando...</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Minha Poupança</h2>
        <p className="text-slate-500 text-sm">Fortaleça sua reserva financeira.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <form onSubmit={handleTransfer} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 space-y-6">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">Transferir Agora</h3>
          
          <div className="p-4 bg-emerald-50 rounded-xl md:rounded-2xl border border-emerald-100 flex justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase">Disponível</p>
                <p className="text-lg md:text-xl font-black text-emerald-800">{formatCurrency(activeClient.balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-emerald-600 uppercase">Na Poupança</p>
                <p className="text-lg md:text-xl font-black text-emerald-800">{formatCurrency(activeClient.savings)}</p>
              </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase">Quanto poupar? (R$)</label>
            <input
              required
              type="number"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-4 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-transparent text-xl md:text-2xl font-bold focus:border-emerald-500 outline-none transition-all"
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase">Qual o objetivo?</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-transparent text-sm font-semibold focus:border-emerald-500 outline-none transition-all"
              placeholder="Ex: Viagem, Carro, Casa e Emergência..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
          >
            Confirmar Depósito
          </button>
        </form>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2 md:mb-4">Total Acumulado</p>
                <h3 className="text-3xl md:text-5xl font-black text-emerald-50">{formatCurrency(activeClient.savings)}</h3>
                <p className="text-slate-400 text-xs md:text-sm mt-4">Sua reserva segura na Amazoncred.</p>
             </div>
             <div className="absolute top-[-10%] right-[-10%] text-7xl md:text-9xl opacity-10 select-none">🐷</div>
          </div>
          
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
             <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm md:text-base">
               <span className="text-lg">📊</span> Dica Financeira
             </h4>
             <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
               Guardar ao menos 10% de cada depósito ajuda a construir sua liberdade financeira mais rápido.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsManager;
