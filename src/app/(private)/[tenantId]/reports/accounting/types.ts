export interface GlAccount {
  id: number;
  name: string;
  glCode: string;
  type: {
    codeValue: string;
  };
}

export interface Currency {
  code: string;
  symbol: string;
  decimalDigits: number;
}

export interface Office {
  id: number;
  name: string;
}

export interface GlJournalEntry {
  id: number;
  transactionId: string;
  typeEnum: "DEBIT" | "CREDIT";
  amount: number;
  entryDate: string;
  officeId: number;
  currencyId: string;
  glAccountId: number;
  office: Office;
  currency: Currency;
  glAccount: GlAccount;
}

export interface TrialBalanceRow {
  key: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
}

// Define more flexible category mappings based on account ranges or patterns
export interface CategoryMapping {
  name: string;
  type: "OPERATING" | "INVESTING" | "FINANCING";
  patterns: {
    codeStartsWith?: string[];
    codeRange?: [string, string];
    accountType?: string[];
  };
}

// Define the structure for cash flow items
export interface CashFlowItem {
  key: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  category: "OPERATING" | "INVESTING" | "FINANCING";
  categoryName: string;
  amount: number;
}

// Define the structure for cash flow summary items
export interface CashFlowSummary {
  key: string;
  description: string;
  amount: number;
  isTotal?: boolean;
  isBold?: boolean;
  isSubtotal?: boolean;
}

// Default category mappings (can be overridden from API)
export const DEFAULT_CATEGORY_MAPPINGS: CategoryMapping[] = [
  // Operating Activities
  {
    name: "Operating Activities - Revenue",
    type: "OPERATING",
    patterns: {
      accountType: ["INCOME"],
    },
  },
  {
    name: "Operating Activities - Expenses",
    type: "OPERATING",
    patterns: {
      accountType: ["EXPENSE"],
    },
  },
  {
    name: "Operating Activities - Current Assets",
    type: "OPERATING",
    patterns: {
      accountType: ["ASSET"],
      // Additional pattern to exclude long-term assets if needed
      codeStartsWith: ["1"], // Typically current assets start with 1
    },
  },
  {
    name: "Operating Activities - Current Liabilities",
    type: "OPERATING",
    patterns: {
      accountType: ["LIABILITY"],
      // Additional pattern to exclude long-term liabilities if needed
      codeStartsWith: ["2"], // Typically current liabilities start with 2
    },
  },

  // Investing Activities
  {
    name: "Investing Activities - Fixed Assets",
    type: "INVESTING",
    patterns: {
      accountType: ["ASSET"],
      // Additional pattern to specifically target fixed/long-term assets
      codeStartsWith: ["15", "16"], // Property, equipment
    },
  },

  // Financing Activities
  {
    name: "Financing Activities - Debt",
    type: "FINANCING",
    patterns: {
      accountType: ["LIABILITY"],
      // Additional pattern to specifically target long-term debt
      codeStartsWith: ["23", "24"], // Loans, long-term debt
    },
  },
  {
    name: "Financing Activities - Equity",
    type: "FINANCING",
    patterns: {
      accountType: ["EQUITY"],
    },
  },
];

export interface BalanceSheetAccount {
  key: string;
  glCode: string;
  name: string;
  amount: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
}

export interface BalanceSheetData {
  assets: BalanceSheetAccount[];
  liabilities: BalanceSheetAccount[];
  equity: BalanceSheetAccount[];
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export type BalanceSheet = {
  assets: number;
  liabilities: number;
  equity: number;
  netIncome: number;
};
