"use client";
import React, { useState } from "react";
import { useDeleteV2, useGet } from "@/api";
import { SavingsAccountTransaction } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { formattedDate } from "@/utils/dates";
import { Button, Popconfirm, Typography } from "antd";
import { formatNumber } from "@/utils/numbers";
import MyButton from "@/components/my-button";
import { BookOutlined, UndoOutlined } from "@ant-design/icons";
import toast from "@/utils/toast";
import NotFound from "@/app/not-found";
import Link from "next/link";
const { Title } = Typography;

export default function SavingTransactionsPage() {
  const { tenantId, id, transactionId, savingId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const router = useRouter();

  const {
    status: transactionStatus,
    data: transaction,
    error: transactionError,
  } = useGet<SavingsAccountTransaction>(
    `${tenantId}/savings-account-transactions/${transactionId}`,
    [`${tenantId}/savings-account-transactions/${transactionId}`]
  );

  const { mutate: undoTransaction } = useDeleteV2(
    `${tenantId}/savings-account-transactions`,
    [
      `${tenantId}/savings-accounts`,
      `${savingId}`,
      `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
    ]
  );

  if (transactionStatus === "success" && !transaction) {
    return (
      <Alert_
        type="error"
        message="Error"
        description={"Transaction Not found"}
      />
    );
  }

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
          `/${tenantId}/clients/${id}/savings-accounts/${savingId}/transactions`
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

  if (transactionStatus === "success" && transaction) {
    return (
      <>
        {transaction.isReversed ? (
          <Alert_
            message={"Error"}
            description={"This transaction has been reversed"}
            type={"error"}
          />
        ) : (
          <>
            <div className="flex justify-between">
              <Title level={4}>Transaction</Title>

              <div className="flex justify-end gap-2">
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

                <Link href={`${transactionId}/receipt`}>
                  <Button icon={<BookOutlined />}>Receipt</Button>
                </Link>
              </div>
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
                  <td>{transaction.savingsAccount.currencyCode}</td>
                </tr>
                <tr>
                  <th>Amount:</th>
                  <td>{formatNumber(transaction.amount, 2)}</td>
                </tr>

                {transaction.paymentDetail && (
                  <>
                    <tr>
                      <th>Payment Type:</th>
                      <td>{transaction.paymentDetail.paymentType.name}</td>
                    </tr>

                    {transaction.paymentDetail.accountNumber && (
                      <tr>
                        <th>Account Number:</th>
                        <td>{transaction.paymentDetail.accountNumber}</td>
                      </tr>
                    )}

                    {transaction.paymentDetail.checkNumber && (
                      <tr>
                        <th>Cheque Number:</th>
                        <td>{transaction.paymentDetail.checkNumber}</td>
                      </tr>
                    )}

                    {transaction.paymentDetail.bankNumber && (
                      <tr>
                        <th>Bank Number:</th>
                        <td>{transaction.paymentDetail.bankNumber}</td>
                      </tr>
                    )}

                    {transaction.paymentDetail.receiptNumber && (
                      <tr>
                        <th>Receipt Number:</th>
                        <td>{transaction.paymentDetail.receiptNumber}</td>
                      </tr>
                    )}

                    {transaction.paymentDetail.routingCode && (
                      <tr>
                        <th>Routing Number:</th>
                        <td>{transaction.paymentDetail.routingCode}</td>
                      </tr>
                    )}
                  </>
                )}
              </table>
            </div>
          </>
        )}
      </>
    );
  }

  return null;
}
