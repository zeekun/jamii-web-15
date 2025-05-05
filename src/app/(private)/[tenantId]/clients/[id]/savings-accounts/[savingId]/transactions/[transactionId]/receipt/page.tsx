"use client";
import { useGet, useGetById } from "@/api";
import Alert_ from "@/components/alert";
import Receipt from "@/components/receipt";
import { SavingsAccountTransaction, Tenant } from "@/types";
import { Skeleton } from "antd";
import { useParams } from "next/navigation";
import React from "react";

export default function ReceiptPage() {
  const { tenantId, transactionId } = useParams();

  const {
    status: tenantStatus,
    data: tenant,
    error: tenantError,
  } = useGetById<Tenant>(`${tenantId}/tenants`, `${tenantId}`);

  const {
    status: transactionStatus,
    data: transaction,
    error: transactionError,
  } = useGet<SavingsAccountTransaction>(
    `${tenantId}/savings-account-transactions/${transactionId}`,
    [`${tenantId}/savings-account-transactions/${transactionId}`]
  );

  if (transactionStatus === "success") {
    console.log(transaction);
  }

  if (tenantStatus === "error" || transactionStatus === "error") {
    return (
      <Alert_
        type="error"
        message="Error"
        description={tenantError || transactionError}
      />
    );
  }

  if (tenantStatus === "pending" || transactionStatus === "pending") {
    return <Skeleton />;
  }

  if (transactionStatus === "success" && !transaction) {
    return (
      <Alert_
        type="error"
        message="Error"
        description={"Transaction Not found"}
      />
    );
  }

  if (
    tenantStatus === "success" &&
    tenant &&
    transactionStatus === "success" &&
    transaction
  ) {
    console.log(transaction);

    let savingsData = {
      entity: "Savings",
      depositor: transaction.savingsAccount.client
        ? transaction.savingsAccount.client.firstName
          ? `${transaction.savingsAccount.client.firstName} ${
              transaction.savingsAccount.client.middleName || ""
            } ${transaction.savingsAccount.client.lastName}`
          : transaction.savingsAccount.client.fullName
        : transaction.savingsAccount.group?.name,
      type: transaction.transactionTypeEnum,
      date: transaction.transactionDate,
      receiptId: `S${transaction.id}`,
      amount: transaction.amount,
      accountNumber: transaction.savingsAccount.accountNo,
      details: [{}],
      currency: transaction.savingsAccount.currencyCode,
    };

    if (transaction.transactionTypeEnum === "DEPOSIT") {
      savingsData.details = [
        {
          property: transaction.transactionTypeEnum,
          amount: transaction.amount,
          paymentType: transaction.paymentDetail?.paymentType.name,
        },
      ];
    } else if (transaction.transactionTypeEnum === "WITHDRAW") {
      savingsData.details = [
        {
          property: transaction.transactionTypeEnum,
          amount: transaction.amount,
          paymentType: transaction.paymentDetail?.paymentType.name,
        },
      ];
    }

    return (
      <div>
        <Receipt companyName={tenant.name} transactionData={savingsData} />
      </div>
    );
  }
}
