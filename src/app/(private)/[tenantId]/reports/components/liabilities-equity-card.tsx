import { Card, Table } from "antd";
import { ColumnType } from "antd/es/table";

export default function LiabilitiesEquityCard({
  type,
  liabilityEquityColumns,
  data,
  liabilities,
}: {
  type: "Liabilities" | "Equity";
  liabilityEquityColumns: ColumnType<any & { isNetIncome?: boolean }>[];
  data: Record<string, { glCode: string; name: string; totalAmount: number }>;
  liabilities: number;
}) {
  const typeStyle =
    type === "Equity"
      ? {
          backgroundColor: "#52c41a10",
          borderBottom: "2px solid #52c41a",
          color: "#52c41a",
        }
      : {
          backgroundColor: "rgb(255, 255, 241)",
          borderBottom: "2px solid #FFDE21",
          color: "rgb(255, 217, 0",
        };

  return (
    <Card
      title={<span className="font-semibold text-lg">{type}</span>}
      className="shadow-lg"
      headStyle={{ ...typeStyle }}
    >
      <Table
        columns={liabilityEquityColumns}
        dataSource={Object.values(data)}
        pagination={false}
        size="middle"
        bordered
        rowKey="glCode"
        footer={() => (
          <div className="flex justify-between font-semibold">
            <span>Total {type}</span>
            <span>
              {liabilities.toLocaleString("en-US", {
                style: "currency",
                currency: "UGX",
              })}
            </span>
          </div>
        )}
      />
    </Card>
  );
}
