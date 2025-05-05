"use client";
import React, { useState } from "react";
import { useDeleteV2, useGet } from "@/api";
import { LoanTransaction, SavingsAccountTransaction } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { formattedDate } from "@/utils/dates";
import { Popconfirm, Typography } from "antd";
import { formatNumber } from "@/utils/numbers";
import MyButton from "@/components/my-button";
import { UndoOutlined } from "@ant-design/icons";
import toast from "@/utils/toast";
import NotFound from "@/app/not-found";
const { Title } = Typography;

export default function Page() {
  const { tenantId, id, transactionId, loanId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const router = useRouter();

  const {
    status: transactionStatus,
    data: transaction,
    error: transactionError,
  } = useGet<LoanTransaction>(
    `${tenantId}/loan-transactions/${transactionId}`,
    [`${tenantId}/loan-transactions/${transactionId}`]
  );

  const { mutate: undoTransaction } = useDeleteV2(
    `${tenantId}/loan-transactions`,
    [
      `${tenantId}/loans`,
      `${loanId}`,
      `${tenantId}/loan-transactions?filter={"where":{"loanId":${loanId},"isReversed":false},"order":["id DESC"]}`,
    ]
  );

  if (isNaN(Number(transactionId))) {
    return <NotFound />;
  }

  if (transactionStatus === "error") {
    return (
      <Alert_ message={"Error"} description={transactionError} type={"error"} />
    );
  }

  if (transactionStatus === "pending") {
    return <Loading />;
  }

  const handleUndoOk = () => {
    setConfirmLoading(true);

    undoTransaction(Number(transactionId), {
      onSuccess: () => {
        setIsModalOpen(false);
        setConfirmLoading(false);
        toast({
          type: "success",
          response: `Transaction reversed successfully.`,
        });
        router.push(
          `/${tenantId}/clients/${id}/loan-accounts/${loanId}/transactions`
        );
      },
      onError(error, variables, context) {
        setConfirmLoading(false);
        toast({
          type: "error",
          response: error,
        });
      },
    });
  };

  if (transactionStatus === "success" && transaction.isReversed) {
    return (
      <Alert_
        type="error"
        message="Error 404"
        description={"Transaction not found"}
      />
    );
  }

  if (transactionStatus === "success" && transaction) {
    return (
      <>
        {transaction.manuallyAdjustedOrReversed ? (
          <Alert_
            message={"Error"}
            description={"This transaction has been reversed"}
            type={"error"}
          />
        ) : (
          <>
            <div className="flex justify-between">
              <Title level={4}>Loan Transaction</Title>

              <Popconfirm
                title={`This transaction will be reversed.`}
                placement="bottomLeft"
                open={isModalOpen}
                onConfirm={handleUndoOk}
                okButtonProps={{ loading: confirmLoading }}
                onCancel={() => {
                  setIsModalOpen(false);
                }}
              >
                <MyButton
                  type={"danger"}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  icon={<UndoOutlined />}
                >
                  Undo
                </MyButton>
              </Popconfirm>
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full border-solid border-[1px] mt-3 border-gray-200">
                <tr className="text-lg">
                  <th className="w-[10rem]">Transaction ID:</th>
                  <td>{transaction.id}</td>
                </tr>
                <tr>
                  <th>Type:</th>
                  <td>{transaction.transactionTypeEnum}</td>
                </tr>
                <tr>
                  <th>Transaction Date:</th>
                  <td>{formattedDate(transaction.transactionDate)}</td>
                </tr>

                <tr>
                  <th>Currency:</th>
                  <td>{transaction.loan.currencyCode}</td>
                </tr>
                <tr>
                  <th>Amount:</th>
                  <td>{formatNumber(transaction.amount, 2)}</td>
                </tr>
              </table>
            </div>
          </>
        )}
      </>
    );
  }

  return null;
}
