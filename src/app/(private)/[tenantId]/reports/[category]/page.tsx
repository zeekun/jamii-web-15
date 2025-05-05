"use client";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import PageHeader from "@/components/page-header";
import { useParams } from "next/navigation";
import DataTable from "./data-table";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export default function Page() {
  const { tenantId, category } = useParams();

  const {
    status,
    data: reports,
    error,
  } = useGet(
    `${tenantId}/stretchy-reports?filter={"where":{"category":"${category}"},"order":["id DESC"]}`,
    [
      `${tenantId}/stretchy-reports?filter={"where":{"category":"${category}"},"order":["id DESC"]}`,
    ]
  );

  return (
    <>
      <div className="flex justify-between">
        <PageHeader pageTitle={`${category} Reports`} />
        <Button href="./create" type="primary" icon={<PlusOutlined />}>
          Create
        </Button>
      </div>

      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={reports}
          loading={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
