import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import DataTable from "./transactions.data-table";
import { useParams } from "next/navigation";

export default function Transactions() {
  const { tenantId, shareId } = useParams();

  const {
    status,
    data: savingsTransactions,
    error,
  } = useGet(
    `${tenantId}/share-account-transactions?filter={"where":{"and":[{"shareAccountId":${shareId}},{"isActive":true}]}}`,
    [
      `${tenantId}/share-accounts`,
      `${shareId}`,
      `${tenantId}/share-account-transactions?filter={"where":{"and":[{"shareAccountId":${shareId}},{"isActive":true}]}}`,
    ]
  );

  return (
    <>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={savingsTransactions}
          loading={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
