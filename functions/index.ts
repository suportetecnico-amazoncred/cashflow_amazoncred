
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Definindo a região para otimizar a latência para usuários no Brasil
const REGION = "southamerica-east1";

// Interface para os dados recebidos do cliente
interface TransactionData {
  type: "entry" | "withdrawal" | "credit_use" | "payment" | "savings_transfer";
  amount: number;
  description: string;
  installments?: number;
}

export const processTransaction = functions
  .region(REGION)
  .https.onCall(async (data: TransactionData, context) => {
    // 1. Validação de Autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "O usuário precisa estar autenticado para realizar uma transação."
      );
    }
    const uid = context.auth.uid;
    const { type, amount, description, installments } = data;

    // 2. Validação dos Dados de Entrada
    if (!type || typeof amount !== "number" || amount <= 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Dados da transação inválidos."
      );
    }

    const clientRef = db.collection("clients").doc(uid);
    const transactionsRef = db.collection("transactions");

    try {
      // Usando uma transação do Firestore para garantir consistência (tudo ou nada)
      await db.runTransaction(async (t) => {
        const clientDoc = await t.get(clientRef);

        if (!clientDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found", "Cliente não encontrado."
          );
        }

        const clientData = clientDoc.data()!;
        const updates: { [key: string]: any } = {};
        let newTransaction: any = {
          clientId: uid,
          type,
          amount,
          description: description || "Operação",
          timestamp: Date.now(),
          paymentMethod: "Operação Online",
          profit: 0,
        };

        // 3. Lógica de Negócio Segura
        switch (type) {
          case "entry":
            updates.balance = admin.firestore.FieldValue.increment(amount);
            newTransaction.paymentMethod = "Depósito";
            break;

          case "withdrawal":
            if (clientData.balance < amount) {
              throw new Error("Saldo insuficiente para saque.");
            }
            updates.balance = admin.firestore.FieldValue.increment(-amount);
            newTransaction.paymentMethod = "Saque";
            break;
          
          case "savings_transfer":
            if (clientData.balance < amount) {
              throw new Error("Saldo insuficiente para transferir para a poupança.");
            }
            updates.balance = admin.firestore.FieldValue.increment(-amount);
            updates.savings = admin.firestore.FieldValue.increment(amount);
            newTransaction.paymentMethod = "Interno";
            break;

          case "credit_use":
            if (clientData.creditUsed > 0) {
              throw new Error("Já existe um empréstimo ativo.");
            }
            if (!installments || installments <= 0) {
              throw new Error("Número de parcelas inválido.");
            }
            updates.loanTotal = amount;
            updates.creditUsed = amount;
            updates.totalInstallments = installments;
            updates.installmentValue = amount / installments;
            newTransaction.installments = installments;
            newTransaction.paymentMethod = "Empréstimo";
            break;

          case "payment":
            if (clientData.balance < amount) {
              throw new Error("Saldo insuficiente para realizar o pagamento.");
            }
            if (amount > clientData.creditUsed + 0.01) {
              throw new Error("O valor do pagamento é maior que a dívida.");
            }
            updates.balance = admin.firestore.FieldValue.increment(-amount);
            updates.creditUsed = admin.firestore.FieldValue.increment(-amount);
            newTransaction.paymentMethod = "Pagamento Parcela";
            break;
          
          default:
            throw new Error("Tipo de transação desconhecido.");
        }

        // 4. Executando as Atualizações
        t.update(clientRef, updates);
        t.set(transactionsRef.doc(), newTransaction);
      });

      return { success: true, message: "Transação concluída com sucesso!" };
    } catch (error: any) {
      console.error("Erro na transação:", error);
      throw new functions.https.HttpsError(
        "aborted",
        error.message || "Não foi possível completar a transação."
      );
    }
  });
    