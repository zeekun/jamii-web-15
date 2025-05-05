"use client";
import { useGetById } from "@/api";
import StandingInstructionsDataTable from "./standing-instructions.data-table";
import { Client } from "@/types";
import { useParams } from "next/navigation";
import { Skeleton } from "antd";
import Alert_ from "@/components/alert";

export default function Page() {
  const { tenantId, id } = useParams();

  const {
    status: clientStatus,
    data: client,
    error: clientError,
  } = useGetById<Client>(`${tenantId}/clients`, Number(id));

  if (clientStatus === "pending") {
    return <Skeleton />;
  }

  if (clientStatus === "error") {
    return (
      <Alert_ message={"Error"} description={clientError} type={"error"} />
    );
  }

  if (clientStatus === "success") {
    return <StandingInstructionsDataTable client={client} />;
  }
}
