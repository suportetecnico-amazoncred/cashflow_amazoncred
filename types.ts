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

export type MovementType = 'entry' | 'withdrawal' | 'credit_use' | 'payment' | 'savings_transfer';

export interface Transaction {
  id: string;
  clientId: string;
  type: MovementType;
  amount: number;
  description: string;
  timestamp: number;
  paymentMethod: string;
  installments?: number; 
}

export type ViewState = 'welcome' | 'dashboard' | 'operations' | 'clients' | 'savings' | 'loans';