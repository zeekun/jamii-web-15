import { Table, TableProps, Typography } from "antd";
import { LoanTransaction } from "@/types";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import DataTable from "./transactions.data-table";
import { useParams } from "next/navigation";

const { Title } = Typography;
export default function Transactions(props: { loanId: string }) {
  const { tenantId } = useParams();
  const { loanId } = props;

  const {
    status,
    data: loanTransactions,
    error,
  } = useGet(
    `${tenantId}/loan-transactions?filter={"where":{"loanId":${loanId},"isReversed":"false"},"order": ["id DESC"]}`,
    [
      `${tenantId}/loan-transactions?filter={"where":{"loanId":${loanId},"isReversed":"false"},"order": ["id DESC"]}`,
    ]
  );

  const columns: TableProps<LoanTransaction>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record) => record.id,
    },
  ];

  return (
    <>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error} type={"error"} />
      ) : (
        <DataTable
          data={loanTransactions}
          loading={status === "pending" ? true : false}
        />
      )}
    </>
  );
}
