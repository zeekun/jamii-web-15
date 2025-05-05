"use client";
import React from "react";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { Typography } from "antd";
import Charges from "../charges";
const { Title } = Typography;

export default function Page() {
  const { savingId } = useParams();
  return (
    <>
      <Charges savingId={String(savingId)} />
    </>
  );
}
