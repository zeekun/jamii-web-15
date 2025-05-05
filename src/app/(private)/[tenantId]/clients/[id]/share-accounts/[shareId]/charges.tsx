import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import { useParams } from "next/navigation";
import DataTable from "./charges/charges.data-table";

export default function Charges(props: { shareId: string }) {
  const { tenantId } = useParams();
  const { shareId } = props;

  const { status, data, error } = useGet(
    `${tenantId}/share-account-charges?filter={"where":{"shareAccountId":${shareId}},"order":["id DESC"]}`,
    [
      `${tenantId}/share-account-charges?filter={"where":{"shareAccountId":${shareId}},"order":["id DESC"]}`,
    ]
  );

  return (
    <>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable data={data} loading={status === "pending" ? true : false} />
      )}
    </>
  );
}
