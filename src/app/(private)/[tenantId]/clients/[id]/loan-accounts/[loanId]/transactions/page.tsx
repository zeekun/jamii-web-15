"use client";
import React from "react";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { Typography } from "antd";
import Transactions from "../transactions";
const { Title } = Typography;

export default function Page() {
  const { loanId } = useParams();
  return (
    <>
      <Title level={4}>Loan Transactions</Title>
      <Transactions loanId={String(loanId)} />
    </>
  );
}
