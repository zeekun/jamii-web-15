import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import { useParams } from "next/navigation";
import DataTable from "./charges.data-table";

export default function Charges(props: { savingId: string }) {
  const { tenantId } = useParams();
  const { savingId } = props;

  const {
    status,
    data: savingsCharges,
    error,
  } = useGet(
    `${tenantId}/savings-account-charges?filter={"where":{"savingsAccountId":${savingId}},"order":["id DESC"]}`,
    [
      `${tenantId}/savings-account-charges?filter={"where":{"savingsAccountId":${savingId}},"order":["id DESC"]}`,
    ]
  );

  return (
    <>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={savingsCharges}
          loading={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
