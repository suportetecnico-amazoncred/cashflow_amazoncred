
import React, { useState, useEffect, useContext } from 'react';
import { User } from 'firebase/auth';
import Sidebar from './components/Sidebar.js';
import Dashboard from './components/Dashboard.js';
import Register from './components/Register.js';
import LoanManager from './components/LoanManager.js';
import ClientManager from './components/ClientManager.js';
import SavingsManager from './components/SavingsManager.js';
import { ViewState, MovementType } from './types.js';
import { 
  onAuthChange,
  signUpWithEmail,
  signInWithEmail,
  logoutFirebase,
  saveClient,
  processTransaction
} from './services/firebaseService.js';
import { ClientContext } from './context/ClientContext.js';

const LOGO_URL = "img/sitelogo.png";

const LogoContainer: React.FC<{ size?: string }> = ({ size = "w-24 h-24" }) => (
  <div className={`${size} flex items-center justify-center bg-emerald-500/10 rounded-3xl overflow-hidden shadow-inner`}>
    <img 
      src={LOGO_URL} 
      alt="Amazoncred" 
      className="w-full h-full object-contain p-2"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent) {
          const span = document.createElement('span');
          span.textContent = '🌱';
          span.style.fontSize = size.includes('w-20') ? '2rem' : '3rem';
          parent.appendChild(span);
        }
      }}
    />
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('welcome');
  const [welcomeMode, setWelcomeMode] = useState<'signup' | 'login'>('login');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { activeClient } = useContext(ClientContext);

  useEffect(() => {
    const unsubscribe = onAuthChange(user => {
      setAuthUser(user);
      setIsLoading(false);
      if (user) {
        setView('dashboard');
      } else {
        setView('welcome');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      console.error(err);
      alert("Erro ao entrar. Verifique seu e-mail e senha.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).toLowerCase();
    const password = formData.get('password') as string;

    try {
      const userCredential = await signUpWithEmail(email, password);
      const user = userCredential.user;

      const nc = { 
        name: formData.get('name') as string, 
        email: email, 
        phone: formData.get('phone') as string, 
        installmentValue: 0,
        totalInstallments: 0,
        loanTotal: 0,
        id: user.uid,
        creditUsed: 0, 
        balance: 0, 
        savings: 0, 
        createdAt: Date.now()
      };
      
      await saveClient(nc);
    } catch (err) {
      console.error(err);
      if ((err as any).code === 'auth/email-already-in-use') {
        alert("Este e-mail já possui um cadastro. Tente fazer o login.");
        setWelcomeMode('login');
      } else {
        alert("Erro ao criar cadastro. A senha precisa ter no mínimo 6 caracteres.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSecureTransaction = async (type: MovementType, amount: number, description: string, installments?: number) => {
    setIsProcessing(true);
    try {
      const result = await processTransaction({ type, amount, description, installments });
      if (result.data.success) {
        setView('dashboard');
      } else {
        throw new Error(result.data.error || "Erro desconhecido na transação.");
      }
    } catch (err) {
      console.error("Erro na transação:", err);
      alert(`Erro ao processar: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    setTimeout(async () => {
      await logoutFirebase();
      setIsLoggingOut(false);
    }, 1500);
  };
  
  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'operations': return <Register onCompleteTransaction={handleSecureTransaction} />;
      case 'loans': return <LoanManager onConfirm={handleSecureTransaction} />;
      case 'clients': return <ClientManager />;
      case 'savings': return <SavingsManager onTransfer={handleSecureTransaction} />;
      default: return <Dashboard />;
    }
  };

  if (isLoading) {
      return (
          <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
      );
  }

  if (isLoggingOut) {
    return (
      <div className="min-h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <div className="text-center animate-in zoom-in duration-500 flex flex-col items-center">
          <LogoContainer size="w-20 h-20 mb-6" />
          <h2 className="text-2xl font-black text-white tracking-tight mt-4">Saindo...</h2>
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">Sessão encerrada com segurança</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-4">
        {isProcessing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white transition-all">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Processando...</p>
          </div>
        )}
        
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-8 flex flex-col items-center">
            <LogoContainer />
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0f172a] leading-none mt-6">
              Cash Flow<br/>
              <span className="bg-gradient-to-r from-[#00a36c] to-[#008ba3] bg-clip-text text-transparent">Amazoncred</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Gestão de Empréstimo</p>
          </div>
          <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl">
             <button onClick={() => setWelcomeMode('signup')} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-xl transition-all ${welcomeMode === 'signup' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Cadastro</button>
             <button onClick={() => setWelcomeMode('login')} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-xl transition-all ${welcomeMode === 'login' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Já sou Cliente</button>
          </div>
          {welcomeMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <input name="email" required type="email" placeholder="Seu e-mail" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all" />
              <input name="password" required type="password" placeholder="Sua senha" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all" />
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-900/10 hover:brightness-110 active:scale-[0.98] transition-all">Entrar</button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <input name="name" required placeholder="Nome Completo" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all" />
              <input name="email" required type="email" placeholder="E-mail principal" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all" />
              <input name="password" required type="password" placeholder="Crie uma senha (mín. 6 letras)" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all" />
              <input name="phone" required placeholder="Telefone" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all" />
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-900/10 hover:brightness-110 active:scale-[0.98] transition-all">Cadastrar</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white transition-all">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Processando...</p>
        </div>
      )}
      <Sidebar 
        currentView={view} 
        setView={setView} 
        onLogout={logout} 
        activeClientName={activeClient?.name}
      />
      <main className="flex-1 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12 lg:ml-64 overflow-x-hidden">
        {activeClient ? (
          <div key={view} className="view-transition">
            {renderContent()}
          </div>
        ) : (
          <div className="text-center p-10 text-slate-400 font-bold uppercase">Carregando dados...</div>
        )}
      </main>
    </div>
  );
};

export default App;
    