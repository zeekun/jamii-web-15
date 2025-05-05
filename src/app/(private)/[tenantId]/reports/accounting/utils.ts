import { GlJournalEntry } from "@/types";
import { BalanceSheet } from "./types";

export function generateBalanceSheet(
  transactions: GlJournalEntry[]
): BalanceSheet {
  let assets = 0,
    liabilities = 0,
    equity = 0;
  let income = 0,
    expenses = 0;

  transactions.forEach(({ typeEnum, amount, glAccount }) => {
    if (amount < 0) throw new Error("Amount must be a non-negative integer");

    switch (glAccount.type.codeValue) {
      case "ASSET":
        assets += typeEnum === "DEBIT" ? amount : -amount;
        break;
      case "LIABILITY":
        liabilities += typeEnum === "CREDIT" ? amount : -amount;
        break;
      case "EQUITY":
        equity += typeEnum === "CREDIT" ? amount : -amount;
        break;
      case "INCOME":
        income += typeEnum === "CREDIT" ? amount : -amount;
        break;
      case "EXPENSE":
        expenses += typeEnum === "DEBIT" ? amount : -amount;
        break;
      default:
        console.log(`Unknown GL Account: ${glAccount.type.codeValue}`);
    }
  });

  // Compute net income
  const netIncome = income - expenses;
  equity += netIncome; // Add net income to equity

  // Ensure the equation holds
  if (assets !== liabilities + equity) {
    throw new Error(
      `Accounting equation not balanced: A=${assets}, L+E=${
        liabilities + equity
      }`
    );
  }

  return { assets, liabilities, equity, netIncome };
}
