import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import DataTable from "./transactions.data-table";
import { useParams } from "next/navigation";

export default function Transactions(props: { savingId: string }) {
  const { tenantId } = useParams();
  const { savingId } = props;

  const {
    status,
    data: savingsTransactions,
    error,
  } = useGet(
    `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
    [
      `${tenantId}/savings-account-transactions?filter={"where":{"savingsAccountId":${savingId},"isReversed":false},"order":["id DESC"]}`,
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
