
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  loanTotal: number;
  installmentValue: number;
  totalInstallments: number;
  creditUsed: number;
  balance: number;
  savings: number;
  createdAt: number;
}

export type MovementType = 'entry' | 'withdrawal' | 'credit_use' | 'payment';

export interface Transaction {
  id: string;
  clientId: string;
  type: MovementType;
  amount: number;
  description: string;
  timestamp: number;
  profit: number;
  paymentMethod: string;
  installments?: number; 
}

export interface SavingsState {
  totalSavings: number;
  savingsHistory?: any[];
}

export type ViewState = 'welcome' | 'dashboard' | 'operations' | 'clients' | 'savings' | 'loans';
