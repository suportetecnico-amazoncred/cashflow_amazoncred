
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  onSnapshot,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
// Removida a importação de 'getFunctions' e 'httpsCallable'
import { Client, Transaction, MovementType } from "../types.js";

const firebaseConfig = {
  apiKey: "AIzaSyALTpd7IOCrvD5FNHhd3ZJ-PnjdXcfXUYo",
  authDomain: "cashflow-cred-5afb2.firebaseapp.com",
  projectId: "cashflow-cred-5afb2",
  storageBucket: "cashflow-cred-5afb2.firebasestorage.app",
  messagingSenderId: "352296609239",
  appId: "1:352296609239:web:ed619e29f7f735d1791792"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Funções de Autenticação Segura
export const signUpWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutFirebase = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Funções de Banco de Dados (Leitura e Criação Inicial)
export const saveClient = async (client: Partial<Client>) => {
  await setDoc(doc(db, "clients", client.id!), client);
};

export const listenToClientData = (clientId: string, callback: (client: Client) => void) => {
  return onSnapshot(doc(db, "clients", clientId), (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback(docSnapshot.data() as Client);
    }
  });
};

export const listenToTransactions = (clientId: string, callback: (transactions: Transaction[]) => void) => {
  const q = query(
    collection(db, "transactions"), 
    where("clientId", "==", clientId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const txs: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      txs.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    txs.sort((a, b) => b.timestamp - a.timestamp);
    callback(txs);
  });
};

// NOVA Lógica de Transação Segura no Cliente
interface TransactionData {
  type: MovementType;
  amount: number;
  description: string;
  installments?: number;
}

export const processTransaction = async (data: TransactionData): Promise<{ success: boolean, message: string }> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { type, amount, description, installments } = data;
  const uid = user.uid;
  const clientRef = doc(db, "clients", uid);
  const newTransactionRef = doc(collection(db, "transactions")); // Gera um novo ID

  try {
    await runTransaction(db, async (transaction) => {
      const clientDoc = await transaction.get(clientRef);
      if (!clientDoc.exists()) {
        throw new Error("Cliente não encontrado.");
      }

      const clientData = clientDoc.data() as Client;
      const updates: Partial<Client> = {};
      const newTransaction: Omit<Transaction, 'id'> = {
        clientId: uid,
        type,
        amount,
        description: description || "Operação",
        timestamp: Date.now(),
        paymentMethod: "Operação Online",
        profit: 0,
      };

      switch (type) {
        case "entry":
          updates.balance = clientData.balance + amount;
          newTransaction.paymentMethod = "Depósito";
          break;

        case "withdrawal":
          if (clientData.balance < amount) throw new Error("Saldo insuficiente para saque.");
          updates.balance = clientData.balance - amount;
          newTransaction.paymentMethod = "Saque";
          break;
        
        case "savings_transfer":
          if (clientData.balance < amount) throw new Error("Saldo insuficiente para transferir.");
          updates.balance = clientData.balance - amount;
          updates.savings = clientData.savings + amount;
          newTransaction.paymentMethod = "Interno";
          break;

        case "credit_use":
          if (clientData.creditUsed > 0) throw new Error("Já existe um empréstimo ativo.");
          if (!installments || installments <= 0) throw new Error("Número de parcelas inválido.");
          updates.loanTotal = amount;
          updates.creditUsed = amount;
          updates.totalInstallments = installments;
          updates.installmentValue = amount / installments;
          newTransaction.installments = installments;
          newTransaction.paymentMethod = "Empréstimo";
          break;

        case "payment":
          if (clientData.balance < amount) throw new Error("Saldo insuficiente para pagar.");
          if (amount > clientData.creditUsed + 0.01) throw new Error("Valor do pagamento é maior que a dívida.");
          updates.balance = clientData.balance - amount;
          updates.creditUsed = clientData.creditUsed - amount;
          newTransaction.paymentMethod = "Pagamento Parcela";
          break;
        
        default:
          throw new Error("Tipo de transação desconhecido.");
      }
      
      transaction.update(clientRef, updates);
      transaction.set(newTransactionRef, newTransaction);
    });

    return { success: true, message: "Transação concluída com sucesso!" };
  } catch (error) {
    console.error("Erro na transação client-side:", error);
    const errorMessage = error instanceof Error ? error.message : "Não foi possível completar a transação.";
    // Lançar o erro novamente para que o App.tsx possa pegá-lo
    throw new Error(errorMessage);
  }
};


export { db, auth };
