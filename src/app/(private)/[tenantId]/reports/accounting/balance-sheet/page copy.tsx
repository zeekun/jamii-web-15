"use client";
import { useGet } from "@/api";
import { GlJournalEntry } from "@/types";
import { Typography } from "antd";
import { useParams } from "next/navigation";

const { Title } = Typography;

type BalanceSheet = {
  assets: number;
  liabilities: number;
  equity: number;
  netIncome: number;
};

function generateBalanceSheet(transactions: GlJournalEntry[]): BalanceSheet {
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

const BalanceSheetTable = ({
  title,
  data,
  totalAmount,
  netIncome,
}: {
  title: string;
  data: Record<string, { glCode: string; name: string; totalAmount: number }>;
  totalAmount: number;
  netIncome?: number;
}) => (
  <div>
    <Title level={4} className="mt-6 text-center">
      {title}
    </Title>
    <table className="w-full table-fixed mt-3">
      <thead>
        <tr className="bg-gray-700 text-white text-left">
          <th className="pl-10">GL CODE</th>
          <th className="text-center">Name</th>
          <th className="text-right pr-10">Balance</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(data).map((groupedAccount, i) => (
          <tr
            key={groupedAccount.glCode}
            className={i % 2 === 0 ? "bg-blue-200" : "bg-white"}
          >
            <td className="pl-10">{groupedAccount.glCode}</td>
            <td className="text-center">{groupedAccount.name}</td>
            <td className="text-right pr-10">
              {groupedAccount.totalAmount.toLocaleString()}
            </td>
          </tr>
        ))}

        {title === "Equities" && (
          <tr className="bg-blue-200">
            <td className="pl-10"></td>
            <td className="text-center">Retained Earnings</td>
            <td className="text-right pr-10">
              {netIncome && netIncome.toLocaleString()}
            </td>
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr className="font-bold bg-gray-200">
          <td></td>
          <td className="text-center">Total :</td>
          <td className="text-right pr-10">{totalAmount.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default function Page() {
  const { tenantId } = useParams();

  const {
    status: journalStatus,
    data: journalData,
    error: journalError,
  } = useGet<GlJournalEntry[]>(`${tenantId}/gl-journal-entries`, [
    `${tenantId}/gl-journal-entries`,
  ]);

  const { assets, liabilities, equity, netIncome } =
    journalStatus === "success"
      ? generateBalanceSheet(journalData)
      : { assets: 0, liabilities: 0, equity: 0, netIncome: 0 };

  // Generate grouped data for Asset, Liability, and Equity
  const groupedAssets =
    journalStatus === "success"
      ? journalData
          .filter((account) => account.glAccount.type.codeValue === "ASSET")
          .reduce<
            Record<
              string,
              { glCode: string; name: string; totalAmount: number }
            >
          >((acc, account) => {
            const { glCode, name } = account.glAccount;
            if (!acc[glCode]) {
              acc[glCode] = { glCode, name, totalAmount: 0 };
            }
            acc[glCode].totalAmount +=
              account.typeEnum === "DEBIT" ? account.amount : -account.amount;
            return acc;
          }, {})
      : {};

  const groupedLiabilities =
    journalStatus === "success"
      ? journalData
          .filter((account) => account.glAccount.type.codeValue === "LIABILITY")
          .reduce<
            Record<
              string,
              { glCode: string; name: string; totalAmount: number }
            >
          >((acc, account) => {
            const { glCode, name } = account.glAccount;
            if (!acc[glCode]) {
              acc[glCode] = { glCode, name, totalAmount: 0 };
            }
            acc[glCode].totalAmount +=
              account.typeEnum === "CREDIT" ? account.amount : -account.amount;
            return acc;
          }, {})
      : {};

  const groupedEquities =
    journalStatus === "success"
      ? journalData
          .filter((account) => account.glAccount.type.codeValue === "EQUITY")
          .reduce<
            Record<
              string,
              { glCode: string; name: string; totalAmount: number }
            >
          >((acc, account) => {
            const { glCode, name } = account.glAccount;
            if (!acc[glCode]) {
              acc[glCode] = { glCode, name, totalAmount: 0 };
            }
            acc[glCode].totalAmount +=
              account.typeEnum === "CREDIT" ? account.amount : -account.amount;
            return acc;
          }, {})
      : {};

  return (
    <div style={{ margin: "auto", width: "80%" }}>
      <Title className="text-center" level={3}>
        Balance Sheet
      </Title>

      {/* Assets Table */}
      <BalanceSheetTable
        title="Assets"
        data={groupedAssets}
        totalAmount={assets}
      />

      {/* Liabilities Table */}
      <BalanceSheetTable
        title="Liabilities"
        data={groupedLiabilities}
        totalAmount={liabilities}
      />

      {/* Equities Table */}
      <BalanceSheetTable
        title="Equities"
        data={groupedEquities}
        totalAmount={equity}
        netIncome={netIncome}
      />
    </div>
  );
}
