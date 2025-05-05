import { useGet } from "@/api";
import {
  GLAccount,
  GLAccountType,
  GlJournalEntry,
  ProcessedGLAccount,
} from "@/types";

interface GLAccountsHookResult {
  options: any[];
  status: "error" | "success" | "pending";
  error: any;
}

export const useGLAccounts = (
  type: GLAccountType,
  tenantId: string | string[],
  usage?: "HEADER" | "DETAIL"
): GLAccountsHookResult => {
  const { status, data, error } = useGet<GLAccount[]>(
    `${tenantId}/gl-accounts?types=${type}${
      usage ? `&usage=${usage}` : ""
    }&filter={"where":{"isActive":true}}`,
    [
      `${tenantId}/gl-accounts?types=${type}${
        usage ? `&usage=${usage}` : ""
      }&filter={"where":{"isActive":true}}`,
    ]
  );

  let options: any[] = [];

  if (status === "success") {
    options = data.map((account: GLAccount) => ({
      value: account.id,
      label: `${account.type.codeValue} (${account.glCode}) ${account.name}`,
    }));
  }

  return { options, status, error };
};

interface GLAccountsDataResult {
  status: string;
  error?: any;
  data?: GLAccount[];
}

export const useGLAccountsData = (
  type: GLAccountType,
  tenantId: string | string[]
): { data: ProcessedGLAccount[] | undefined; status: string; error: any } => {
  const {
    status: accountStatus,
    data: accountsData,
    error: accountsError,
  } = useGet<GLAccount[]>(`${tenantId}/gl-accounts?types=${type}`, [
    `${tenantId}/gl-accounts?types=${type}`,
  ]);

  const {
    status: journalStatus,
    data: journalData,
    error: journalError,
  } = useGet<GlJournalEntry[]>(`${tenantId}/gl-journal-entries`, [
    `${tenantId}/gl-journal-entries`,
  ]);

  if (journalStatus === "success") {
    console.log("journalData", journalData);
  }

  // Filter and process the data
  const processedData: ProcessedGLAccount[] | undefined = accountsData
    ?.filter(
      (account) =>
        account.usage.codeValue !== "HEADER" && account.type.codeValue === type
    ) // Exclude HEADER accounts and filter by GLAccountType
    .map((account) => {
      const relatedJournalEntries = journalData?.filter(
        (entry) => entry.glAccountId === account.id
      );

      const totalAmount = relatedJournalEntries?.reduce((sum, entry) => {
        if (entry.typeEnum === "DEBIT") {
          // Debit decreases asset and revenue, increases expense and liability
          // Adjust this based on the account type logic
          if (
            account.type.codeValue === "ASSET" ||
            account.type.codeValue === "EXPENSE"
          ) {
            return sum + (entry.amount || 0); // Debit increases asset/expense
          } else if (
            account.type.codeValue === "LIABILITY" ||
            account.type.codeValue === "EQUITY" ||
            account.type.codeValue === "INCOME"
          ) {
            return sum - (entry.amount || 0); // Debit decreases liability/equity/revenue
          }
        } else if (entry.typeEnum === "CREDIT") {
          // Credit increases liability, equity, and revenue, decreases asset and expense
          if (
            account.type.codeValue === "ASSET" ||
            account.type.codeValue === "EXPENSE"
          ) {
            return sum - (entry.amount || 0); // Credit decreases asset/expense
          } else if (
            account.type.codeValue === "LIABILITY" ||
            account.type.codeValue === "EQUITY" ||
            account.type.codeValue === "INCOME"
          ) {
            return sum + (entry.amount || 0); // Credit increases liability/equity/revenue
          }
        }
        return sum;
      }, 0);

      return {
        glCode: account.glCode,
        name: account.name,
        totalAmount,
      };
    });

  const combinedStatus =
    accountStatus === "pending" || journalStatus === "pending"
      ? "pending"
      : accountStatus;
  const combinedError = accountsError || journalError;

  return { data: processedData, status: combinedStatus, error: combinedError };
};
