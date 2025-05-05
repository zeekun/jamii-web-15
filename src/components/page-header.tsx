"use client";
import { Typography } from "antd";
import { ReactNode } from "react";
const { Title } = Typography;

export default function PageHeader(props: {
  pageTitle: string | ReactNode | null | undefined;
  extra?: ReactNode;
  createModal?: ReactNode;
}) {
  const { pageTitle, createModal, extra } = props;
  return (
    <div className="grid grid-cols-2 items-center mb-3">
      <div className="flex items-center justify-start capitalize">
        <Title level={5}>{pageTitle}</Title>
      </div>
      <div className="flex items-center gap-2 justify-end">
        {extra} {createModal}
      </div>
    </div>
  );
}
