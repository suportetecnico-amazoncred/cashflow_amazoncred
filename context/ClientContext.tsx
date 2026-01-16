
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthChange, listenToClientData, listenToTransactions } from '../services/firebaseService.js';
import { Client, Transaction } from '../types.js';
import { User } from 'firebase/auth';

interface ClientContextData {
  activeClient: Client | null;
  transactions: Transaction[];
  authUser: User | null;
}

export const ClientContext = createContext<ClientContextData>({
  activeClient: null,
  transactions: [],
  authUser: null,
});

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthChange(user => {
      setAuthUser(user);
      if (!user) {
        setActiveClient(null);
        setTransactions([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const unsubClient = listenToClientData(authUser.uid, (client) => {
      setActiveClient(client);
    });

    const unsubTxs = listenToTransactions(authUser.uid, (txs) => {
      setTransactions(txs);
    });

    return () => {
      unsubClient();
      unsubTxs();
    };
  }, [authUser]); // CORREÇÃO: Removido 'view' das dependências para otimizar performance.

  return (
    <ClientContext.Provider value={{ activeClient, transactions, authUser }}>
      {children}
    </ClientContext.Provider>
  );
};
    