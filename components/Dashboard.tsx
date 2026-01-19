import React, { useMemo, useContext } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ClientContext } from '../context/ClientContext.js';
import { formatCurrency, formatTime } from '../utils/formatters.js';

const Dashboard: React.FC = () => {
  const { activeClient, transactions } = useContext(ClientContext);

  if (!activeClient) return null;

  const installmentsData = useMemo(() => {
    if (activeClient.totalInstallments === 0 || activeClient.installmentValue === 0) {
      return { paid: 0, remaining: 0, percentage: 0 };
    }
    const paid = Math.round((activeClient.loanTotal - activeClient.creditUsed) / activeClient.installmentValue);
    return {
      paid,
      remaining: Math.max(0, activeClient.totalInstallments - paid),
      percentage: activeClient.loanTotal > 0 ? (((activeClient.loanTotal - activeClient.creditUsed) / activeClient.loanTotal) * 100) : 0
    };
  }, [activeClient]);

  const chartData = useMemo(() => 
    transactions.slice(0, 10).reverse().map(t => ({
      name: formatTime(t.timestamp),
      valor: t.amount,
    })), [transactions]);

  const StatsCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => (
    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 flex items-center md:block hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl md:rounded-2xl ${color} bg-opacity-10 text-lg md:text-xl mr-4 md:mr-0 md:mb-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
        <p className="text-xl md:text-2xl font-black text-slate-900 mt-0 md:mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Resumo Financeiro</h2>
          <p className="text-slate-500 text-sm">Controle de empréstimo e conta digital.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard title="Saldo em Conta" value={formatCurrency(activeClient.balance)} icon="🏦" color="text-emerald-600 bg-emerald-600" />
        <StatsCard title="Dívida do Plano" value={formatCurrency(activeClient.creditUsed)} icon="📉" color="text-red-600 bg-red-600" />
        <StatsCard title="Poupança" value={formatCurrency(activeClient.savings)} icon="🐷" color="text-indigo-600 bg-indigo-600" />
        <StatsCard title="Parcelas Restantes" value={`${installmentsData.remaining} / ${activeClient.totalInstallments}`} icon="📅" color="text-amber-600 bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-800">Evolução do Pagamento</h3>
                  <p className="text-xs md:text-sm text-slate-400">Contrato Ativo</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Valor Contratado</p>
                  <p className="text-lg md:text-xl font-black text-slate-800">{formatCurrency(activeClient.loanTotal)}</p>
                </div>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-[10px] md:text-sm font-bold">
                  <span className="text-emerald-600 uppercase">Pagas: {installmentsData.paid}</span>
                  <span className="text-slate-400 uppercase">Faltam: {installmentsData.remaining}</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex gap-1 p-1">
                   {activeClient.totalInstallments > 0 ? Array.from({ length: activeClient.totalInstallments }).map((_, i) => (
                     <div 
                      key={i} 
                      className={`flex-1 rounded-sm transition-all duration-500 ${
                        i < installmentsData.paid ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                     />
                   )) : (
                     <div className="flex-1 bg-slate-100 rounded-sm"></div>
                   )}
                </div>
             </div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 min-h-[300px]">
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6">Movimentações Recentes</h3>
            <div className="h-48 md:h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "Valor"]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} name="Valor" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase text-[10px]">Sem dados para exibir</div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4 md:space-y-6">
          <div className="bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-base md:text-lg font-bold mb-2">Quitação do Plano</h3>
              <p className="text-slate-400 text-xs md:text-sm">Progresso para zerar este contrato.</p>
            </div>
            <div className="py-6">
              <div className="flex justify-between mb-2 text-xs font-black uppercase tracking-widest text-emerald-400">
                <span>{installmentsData.percentage.toFixed(1)}% Pago</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-1000" 
                  style={{ width: `${Math.min(installmentsData.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
             <p className="text-slate-400 text-[10px] font-black uppercase mb-3">Valor da Parcela</p>
             <h4 className="text-lg font-bold text-slate-800 mb-1">{formatCurrency(activeClient.installmentValue)}</h4>
             <p className="text-xs text-slate-500 mb-6 leading-tight">Mantenha seu saldo em conta para o débito automático conforme acordado no contrato.</p>
             <div className="w-full bg-emerald-50 text-emerald-600 p-3 rounded-xl text-center font-bold text-[10px] border border-emerald-100 uppercase">
                {activeClient.creditUsed > 0 ? 'Situação: Em aberto' : 'Situação: Quitado ✅'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;