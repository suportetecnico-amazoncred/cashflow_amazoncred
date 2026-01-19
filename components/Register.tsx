import React, { useState, useContext } from 'react';
import { MovementType } from '../types.js';
import { MOVEMENT_CATEGORIES } from '../constants.js';
import { ClientContext } from '../context/ClientContext.js';
import { formatCurrency } from '../utils/formatters.js';

interface OperationsProps {
  onCompleteTransaction: (type: MovementType, amount: number, description: string, installments?: number) => void;
}

const Register: React.FC<OperationsProps> = ({ onCompleteTransaction }) => {
  const { activeClient } = useContext(ClientContext);
  const [type, setType] = useState<MovementType>('entry');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  const QUICK_ITEMS = [
    { label: 'Venda Geral', value: 50, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Serviço', value: 100, color: 'bg-cyan-100 text-cyan-700' },
    { label: 'Manutenção', value: 35, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Outros', value: 10, color: 'bg-slate-100 text-slate-700' },
  ];

  const handleQuickItem = (item: typeof QUICK_ITEMS[0]) => {
    setType('entry');
    setAmount(item.value);
    setDescription(item.label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || amount <= 0) return;

    if (type === 'withdrawal' && activeClient.balance < amount) {
      alert("⚠️ Saldo insuficiente!");
      return;
    }
    if (type === 'payment' && activeClient.balance < amount) {
      alert(`⚠️ Saldo insuficiente para pagar esta parcela de ${formatCurrency(amount)}.`);
      return;
    }
    if (type === 'payment' && amount > activeClient.creditUsed + 0.01) {
      alert("⚠️ Valor maior que a dívida total.");
      return;
    }

    onCompleteTransaction(
      type, 
      amount, 
      description || MOVEMENT_CATEGORIES.find(c => c.id === type)?.label || 'Operação'
    );
    
    setAmount(0);
    setDescription('');
  };

  if (!activeClient) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Frente de Caixa</h2>
        <p className="text-slate-500 text-sm">Registre vendas e movimente sua conta rapidamente.</p>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Venda Rápida (Atalhos)</label>
        <div className="flex flex-wrap gap-3">
          {QUICK_ITEMS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickItem(item)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 hover:brightness-95 ${item.color}`}
            >
              + {item.label} ({formatCurrency(item.value)})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="p-3 md:p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase mb-1">Saldo</p>
            <p className="text-xs md:text-lg font-black text-emerald-800 truncate">{formatCurrency(activeClient.balance)}</p>
          </div>
          <div className="p-3 md:p-4 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-[8px] md:text-[10px] font-black text-red-600 uppercase mb-1">Dívida</p>
            <p className="text-xs md:text-lg font-black text-red-800 truncate">{formatCurrency(activeClient.creditUsed)}</p>
          </div>
          <div className="p-3 md:p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-[8px] md:text-[10px] font-black text-amber-600 uppercase mb-1">Parcela</p>
            <p className="text-xs md:text-lg font-black text-amber-800 truncate">{formatCurrency(activeClient.installmentValue)}</p>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 space-y-6 md:space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Tipo de Operação</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
            {MOVEMENT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setType(cat.id as MovementType);
                  setAmount(cat.id === 'payment' ? activeClient.installmentValue : 0);
                }}
                className={`p-4 md:p-6 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  type === cat.id 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-105' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
                }`}
              >
                <span className="text-2xl md:text-3xl">{cat.icon}</span>
                <span className="text-[9px] md:text-[10px] font-black text-center uppercase leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase">Valor (R$)</label>
            <input
              required
              type="number"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-[60px] p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 outline-none text-xl font-bold"
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-[60px] p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 outline-none text-sm font-bold"
              placeholder="Opcional..."
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-xl"
        >
          Confirmar Lançamento
        </button>
      </form>
    </div>
  );
};

export default Register;