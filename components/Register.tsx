
import React, { useState, useContext } from 'react';
import { MovementType } from '../types.js';
import { MOVEMENT_CATEGORIES } from '../constants.js';
import { ClientContext } from '../context/ClientContext.js';

interface OperationsProps {
  onCompleteTransaction: (type: MovementType, amount: number, description: string, installments?: number) => void;
}

const Register: React.FC<OperationsProps> = ({ onCompleteTransaction }) => {
  const { activeClient } = useContext(ClientContext);
  const [type, setType] = useState<MovementType>('entry');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'entry': return 'Ex: Vendas, Depósito...';
      case 'withdrawal': return 'Ex: Saque...';
      case 'payment': return 'Ex: Parcela de Março...';
      default: return 'Descreva a operação...';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || amount <= 0) return;

    // A validação de saldo agora é feita no backend, mas mantemos no frontend para UX.
    if (type === 'withdrawal' && activeClient.balance < amount) {
      alert("⚠️ Saldo insuficiente! Você não possui saldo em conta para realizar este saque.");
      return;
    }
    if (type === 'payment' && activeClient.balance < amount) {
      alert(`⚠️ Operação negada! Seu saldo atual (${formatCurrency(activeClient.balance)}) é insuficiente para pagar esta parcela de ${formatCurrency(amount)}. Faça um depósito primeiro.`);
      return;
    }
    if (type === 'payment' && amount > activeClient.creditUsed + 0.01) {
      alert("⚠️ Valor inválido! O valor informado é maior que a sua dívida total atual.");
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

  if (!activeClient) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando dados...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Operações</h2>
        <p className="text-slate-500 text-sm">Depósitos, Saques e Pagamento de Empréstimo.</p>
      </header>
      <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="p-3 md:p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-center overflow-hidden">
            <p className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase mb-1 truncate">Saldo</p>
            <p className="text-xs md:text-lg font-black text-emerald-800 truncate">{formatCurrency(activeClient.balance)}</p>
          </div>
          <div className="p-3 md:p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col justify-center overflow-hidden">
            <p className="text-[8px] md:text-[10px] font-black text-red-600 uppercase mb-1 truncate">Dívida Total</p>
            <p className="text-xs md:text-lg font-black text-red-800 truncate">{formatCurrency(activeClient.creditUsed)}</p>
          </div>
          <div className="p-3 md:p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-center overflow-hidden">
            <p className="text-[8px] md:text-[10px] font-black text-amber-600 uppercase mb-1 truncate">Parcela</p>
            <p className="text-xs md:text-lg font-black text-amber-800 truncate">{formatCurrency(activeClient.installmentValue)}</p>
          </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 space-y-6 md:space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest">O que deseja fazer?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
            {MOVEMENT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setType(cat.id as MovementType);
                  if (cat.id === 'payment' && activeClient.installmentValue > 0) {
                    setAmount(activeClient.installmentValue);
                  } else {
                    setAmount(0);
                  }
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
            <div className="relative">
              <input
                required
                type="number"
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0,00"
                className="w-full h-[60px] p-4 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 outline-none text-xl font-bold transition-all"
              />
              {type === 'payment' && (
                <p className="absolute -bottom-5 left-0 text-[9px] font-black text-emerald-600 uppercase">Sugerido: {formatCurrency(activeClient.installmentValue)}</p>
              )}
            </div>
          </div>
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-black text-slate-700 uppercase">Observação / Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full h-[60px] p-4 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 outline-none text-sm font-bold transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-lg md:text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 mt-4"
        >
          Confirmar Lançamento
        </button>
      </form>
    </div>
  );
};

export default Register;
    