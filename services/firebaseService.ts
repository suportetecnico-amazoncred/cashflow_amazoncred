
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc, 
  addDoc, 
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { Client, Transaction } from "../types.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7glaW9yCMHt6oResv0_mL87bWe4s9wVQ",
  authDomain: "cashflow-cred.firebaseapp.com",
  projectId: "cashflow-cred",
  storageBucket: "cashflow-cred.firebasestorage.app",
  messagingSenderId: "875952674480",
  appId: "1:875952674480:web:d327374330f8c69b158d75",
  measurementId: "G-F06844992C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveClient = async (client: Client) => {
  await setDoc(doc(db, "clients", client.id), client);
};

export const getClientByEmail = async (email: string): Promise<Client | null> => {
  const q = query(collection(db, "clients"), where("email", "==", email.toLowerCase()));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Client;
  }
  return null;
};

export const saveTransaction = async (transaction: Transaction) => {
  await addDoc(collection(db, "transactions"), transaction);
};

export const updateClientBalances = async (clientId: string, data: Partial<Client>) => {
  const clientRef = doc(db, "clients", clientId);
  await updateDoc(clientRef, data);
};

export const listenToClientData = (clientId: string, callback: (client: Client) => void) => {
  return onSnapshot(doc(db, "clients", clientId), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Client);
    }
  });
};

export const listenToTransactions = (clientId: string, callback: (transactions: Transaction[]) => void) => {
  // Ordenando diretamente na query para performance superior
  const q = query(
    collection(db, "transactions"), 
    where("clientId", "==", clientId),
    orderBy("timestamp", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const txs: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      txs.push(doc.data() as Transaction);
    });
    callback(txs);
  });
};

export { db };
