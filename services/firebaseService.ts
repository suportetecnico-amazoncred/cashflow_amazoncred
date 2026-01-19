import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  onSnapshot,
  runTransaction
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
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
export const db = getFirestore(app);
export const auth = getAuth(app);

export const signUpWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutFirebase = () => signOut(auth);
export const onAuthChange = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);

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
  const q = query(collection(db, "transactions"), where("clientId", "==", clientId));
  return onSnapshot(q, (querySnapshot) => {
    const txs: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      txs.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    txs.sort((a, b) => b.timestamp - a.timestamp);
    callback(txs);
  });
};

interface TransactionData {
  type: MovementType;
  amount: number;
  description: string;
  installments?: number;
  installmentValue?: number;
}

export const processTransaction = async (data: TransactionData): Promise<{ success: boolean, message: string }> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado.");

  const { type, amount, description, installments, installmentValue } = data;
  const uid = user.uid;
  const clientRef = doc(db, "clients", uid);
  const newTransactionRef = doc(collection(db, "transactions"));

  try {
    await runTransaction(db, async (transaction) => {
      const clientDoc = await transaction.get(clientRef);
      if (!clientDoc.exists()) throw new Error("Cliente não encontrado.");
      
      const clientData = clientDoc.data() as Client;
      const updates: Partial<Client> = {};
      const newTransaction: Omit<Transaction, 'id'> = {
        clientId: uid,
        type,
        amount,
        description: description || "Operação",
        timestamp: Date.now(),
        paymentMethod: "Operação Online"
      };

      const EPSILON = 0.01;

      switch (type) {
        case "entry":
          updates.balance = Math.round((clientData.balance + amount) * 100) / 100;
          newTransaction.paymentMethod = "Depósito";
          break;
        case "withdrawal":
          if (clientData.balance < amount) throw new Error("Saldo insuficiente.");
          updates.balance = Math.round((clientData.balance - amount) * 100) / 100;
          newTransaction.paymentMethod = "Saque";
          break;
        case "savings_transfer":
          if (clientData.balance < amount) throw new Error("Saldo insuficiente.");
          updates.balance = Math.round((clientData.balance - amount) * 100) / 100;
          updates.savings = Math.round((clientData.savings + amount) * 100) / 100;
          newTransaction.paymentMethod = "Interno";
          break;
        case "credit_use":
          if (clientData.creditUsed > EPSILON) throw new Error("Empréstimo já ativo.");
          updates.loanTotal = amount;
          updates.creditUsed = amount;
          updates.totalInstallments = installments || 0;
          updates.installmentValue = installmentValue || 0;
          newTransaction.installments = installments;
          newTransaction.paymentMethod = "Empréstimo";
          break;
        case "payment":
          if (clientData.balance < amount) throw new Error("Saldo insuficiente.");
          const newCreditUsed = Math.max(0, Math.round((clientData.creditUsed - amount) * 100) / 100);
          updates.balance = Math.round((clientData.balance - amount) * 100) / 100;
          updates.creditUsed = newCreditUsed;
          newTransaction.paymentMethod = "Pagamento";
          if (newCreditUsed <= EPSILON) {
            updates.creditUsed = 0;
            updates.loanTotal = 0;
            updates.totalInstallments = 0;
            updates.installmentValue = 0;
          }
          break;
      }
      transaction.update(clientRef, updates);
      transaction.set(newTransactionRef, newTransaction);
    });
    return { success: true, message: "Sucesso!" };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Erro na transação.");
  }
};