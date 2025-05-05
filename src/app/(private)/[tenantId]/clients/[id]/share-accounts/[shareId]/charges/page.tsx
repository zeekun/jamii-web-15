"use client";
import React from "react";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import { Typography } from "antd";
import Charges from "../charges";

export default function Page() {
  const { shareId } = useParams();
  return (
    <>
      <Charges shareId={String(shareId)} />
    </>
  );
}
