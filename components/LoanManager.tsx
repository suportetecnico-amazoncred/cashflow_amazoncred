
import React, { useState } from 'react';
import { Client, MovementType } from '../types.js';

interface LoanManagerProps {
  activeClient: Client;
  onConfirm: (clientId: string, type: MovementType, amount: number, description: string, installments: number) => void;
}

const LoanManager: React.FC<LoanManagerProps> = ({ activeClient, onConfirm }) => {
  const [instValue, setInstValue] = useState<number>(0);
  const [instCount, setInstCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const total = instValue * instCount;
  const hasActiveLoan = activeClient.creditUsed > 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total <= 0 || instCount <= 0 || hasActiveLoan) return;
    
    setLoading(true);
    try {
      await onConfirm(
        activeClient.id, 
        'credit_use', 
        total, 
        `Novo Empréstimo: ${instCount}x de ${formatCurrency(instValue)}`,
        instCount
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-10">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Novo Empréstimo</h2>
        <p className="text-slate-500 text-sm">Crie seu empréstimo de forma rápida.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {hasActiveLoan ? (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-amber-100 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-4xl">⏳</div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Empréstimo em Andamento</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Você já possui um empréstimo ativo com saldo devedor de <span className="font-bold text-slate-700">{formatCurrency(activeClient.creditUsed)}</span>. 
                <br/>Para criar um novo, é necessário quitar o atual primeiro.
              </p>
            </div>
            <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase">Progresso de Quitação</p>
               <div className="flex justify-between mt-2 mb-1 text-[10px] font-bold text-emerald-600">
                 <span>{(((activeClient.loanTotal - activeClient.creditUsed) / activeClient.loanTotal) * 100).toFixed(0)}% Pago</span>
               </div>
               <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-emerald-500" 
                   style={{ width: `${((activeClient.loanTotal - activeClient.creditUsed) / activeClient.loanTotal) * 100}%` }}
                 ></div>
               </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApply} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Valor da Parcela (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={instValue || ''}
                  onChange={(e) => setInstValue(Number(e.target.value))}
                  placeholder="Ex: 150,00"
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none text-2xl font-bold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantidade de Parcelas</label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 12].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setInstCount(n)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all ${instCount === n ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
                <input
                  required
                  type="number"
                  value={instCount || ''}
                  onChange={(e) => setInstCount(Number(e.target.value))}
                  placeholder="Ou digite o número..."
                  className="w-full p-4 mt-2 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-slate-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-center text-[10px] font-black text-slate-400 uppercase mb-4">Total: <span className="text-emerald-600">{formatCurrency(total)}</span></p>
              <button
                type="submit"
                disabled={loading || total <= 0}
                className="w-full py-5 bg-[#0f172a] text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Processando...' : 'Criar'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💡</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Regra de Contratação</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Você pode ter apenas um empréstimo ativo por vez. A criação de um novo pode ser feito após a quitação total das parcelas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanManager;
