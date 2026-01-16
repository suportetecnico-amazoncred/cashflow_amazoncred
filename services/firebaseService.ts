
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  onSnapshot
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Client, Transaction } from "../types.js";

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
const functions = getFunctions(app, 'southamerica-east1'); // Especifique a região, se necessário

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
      txs.push(doc.data() as Transaction);
    });
    txs.sort((a, b) => b.timestamp - a.timestamp);
    callback(txs);
  });
};

// Chamada Segura para a Cloud Function
export const processTransaction = httpsCallable(functions, 'processTransaction');

export { db, auth };
    