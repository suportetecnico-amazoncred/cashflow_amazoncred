
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
  onSnapshot
} from "firebase/firestore";
import { Client, Transaction } from "../types.js";

// Configurações atualizadas do novo banco de dados cashflow-cred-5afb2
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
