"use client";
import { Typography } from "antd";
import { useState } from "react";
import { AccountTransferDetail, Client } from "@/types";
import CreateModal from "@/components/create.modal";
import { useParams } from "next/navigation";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import { formatNumber } from "@/utils/numbers";
import { formattedDate } from "@/utils/dates";
import StandingInstructionsForm from "./standing-instructions.form";
import MyDataTable from "@/components/data-table";
const { Title } = Typography;

// type AccountTransferDetail = {
//   fromSavingsAccount?: { accountNo: string };
//   fromLoanAccount?: { accountNo: string };
//   toSavingsAccount?: { accountNo: string };
//   toLoanAccount?: { accountNo: string };
//   fromClientId: number;
//   toClientId: number;
//   accountTransferStandingInstruction?: {
//     instructionType: string;
//     amount: number;
//     validFrom: string;
//     validTill?: string;
//   };
// };

type ColumnType = {
  title: string;
  dataIndex: string;
  key: string;
  render?: (text: any, record: AccountTransferDetail) => React.ReactNode;
};

export default function StandingInstructionsDataTable(props: {
  client: Client;
}) {
  const { tenantId, id } = useParams();
  const { client } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status, data, error } = useGet(
    `${tenantId}/account-transfer-details?filter={"where":{"fromClientId":${id}}}`,
    [
      `${tenantId}/account-transfer-details?filter={"where":{"fromClientId":${id}}}`,
    ]
  );

  const columns: ColumnType[] = [
    {
      title: "From Account",
      dataIndex: "fromAccount",
      key: "fromAccount",
      render: (_, record) => {
        if (record.fromSavingsAccount) {
          return `${record.fromSavingsAccount.accountNo} (Savings Account)`;
        }

        if (record.fromLoanAccount) {
          return `${record.fromLoanAccount.accountNo} (Loan Account)`;
        }
      },
    },
    {
      title: "Beneficiary",
      dataIndex: "beneficiary",
      key: "beneficiary",
      render: (_, record) => {
        const beneficiary =
          record.fromClientId === record.toClientId
            ? "Own Account"
            : "External Account";
        return beneficiary;
      },
    },
    {
      title: "To Account",
      dataIndex: "toAccount",
      key: "toAccount",
      render: (_, record) => {
        if (record.toSavingsAccount) {
          return `${record.toSavingsAccount.accountNo} (Savings Account)`;
        }

        if (record.toLoanAccount) {
          return `${record.toLoanAccount.accountNo} (Loan Account)`;
        }
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_, record) =>
        `${
          record.accountTransferStandingInstruction?.instructionType || ""
        } ${formatNumber(record.accountTransferStandingInstruction?.amount)}`,
    },
    {
      title: "Validity",
      dataIndex: "toAccount",
      key: "toAccount",
      render: (_, record) =>
        `${formattedDate(
          record.accountTransferStandingInstruction?.validFrom || ""
        )} ${
          record.accountTransferStandingInstruction?.validTill
            ? ` to ${formattedDate(
                record.accountTransferStandingInstruction?.validTill
              )}`
            : ""
        }`,
    },
  ];

  if (status === "success") {
    console.log(data);
  }

  const currentPath = window.location.pathname;

  return (
    <>
      <div className="mb-5 flex justify-between">
        <Title level={4}>Standing Instructions</Title>
        <CreateModal
          pageTitle={"Standing Instruction"}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          submitType="create"
          CreateForm={<StandingInstructionsForm client={client} />}
        />
      </div>

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <MyDataTable<AccountTransferDetail>
          columns={columns}
          data={data as any}
          loading={status === "pending" ? true : false}
          redirectUrl={`${currentPath}/standing-instructions`}
        />
      )}
    </>
  );
}
