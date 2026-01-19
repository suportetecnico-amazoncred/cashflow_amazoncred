import React, { useContext } from 'react';
import { MovementType } from '../types.js';
import { ClientContext } from '../context/ClientContext.js';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters.js';

const ClientManager: React.FC = () => {
  const { activeClient, transactions } = useContext(ClientContext);
  
  if (!activeClient) return <div className="p-10 text-center text-slate-400">Carregando...</div>;

  const translateType = (type: MovementType | string) => {
    const types: Record<string, string> = {
      'entry': 'DEPÓSITO',
      'withdrawal': 'SAQUE',
      'credit_use': 'EMPRÉSTIMO',
      'payment': 'PAGAMENTO',
      'savings_transfer': 'POUPANÇA'
    };
    return types[type] || type.toUpperCase();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Extrato & Perfil</h2>
        <p className="text-slate-500 text-sm">Seu histórico completo de movimentações.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 h-fit order-2 lg:order-1">
          <div className="flex flex-row lg:flex-col items-center lg:text-center space-x-4 lg:space-x-0 lg:space-y-4">
            <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black">
              {activeClient.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 truncate">{activeClient.name}</h3>
              <p className="text-slate-400 text-xs truncate">{activeClient.email}</p>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-50 text-xs md:text-sm">
             <div className="flex justify-between">
               <span className="font-bold text-slate-400 uppercase">Telefone</span>
               <span className="font-bold text-slate-700">{activeClient.phone}</span>
             </div>
             <div className="flex justify-between">
               <span className="font-bold text-slate-400 uppercase">Plano</span>
               <span className="font-bold text-slate-700">{formatCurrency(activeClient.loanTotal)}</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
           <h3 className="text-lg md:text-xl font-black text-slate-800">Minhas Transações</h3>
           <div className="space-y-2 md:space-y-3">
             {transactions.length === 0 ? (
               <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase text-xs">
                 Nenhuma movimentação ainda
               </div>
             ) : (
               transactions.map(t => (
                 <div key={t.id} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-5">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-lg md:text-2xl ${
                        t.type === 'entry' || t.type === 'payment' ? 'bg-emerald-50 text-emerald-600' : 
                        t.type === 'savings_transfer' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {t.type === 'entry' ? '💰' : t.type === 'withdrawal' ? '💸' : t.type === 'credit_use' ? '🏦' : t.type === 'savings_transfer' ? '🐷' : '✅'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm md:text-base">{t.description}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatDate(t.timestamp)} • {formatTime(t.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base md:text-xl font-black ${
                        t.type === 'entry' || t.type === 'payment' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {t.type === 'entry' || t.type === 'payment' ? '+' : '-'} {formatCurrency(t.amount)}
                      </p>
                      <p className="text-[8px] md:text-[10px] text-slate-300 font-black uppercase">{translateType(t.type)}</p>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientManager;