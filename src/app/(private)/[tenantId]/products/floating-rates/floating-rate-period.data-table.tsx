import TableRowCheck from "@/components/table-row-check";
import { FloatingRatePeriod } from "@/types";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";

export default function FloatingRatePeriodDataTable(props: {
  data?: FloatingRatePeriod[];
  setFloatingRatePeriodsData: React.Dispatch<
    React.SetStateAction<FloatingRatePeriod[]>
  >;
}) {
  const { data, setFloatingRatePeriodsData } = props;

  const removeObjectById = (arr: FloatingRatePeriod[], id: number) => {
    return arr.filter((obj) => obj.id !== id);
  };

  const onDelete = (id: number) => {
    if (data) {
      const updatedData = removeObjectById(data, id);
      setFloatingRatePeriodsData(updatedData);
    }
  };

  const columns: TableProps<FloatingRatePeriod>["columns"] = [
    {
      title: "Interest Rate",
      dataIndex: "interestRate",
      key: "interestRate",
      render: (value) => value,
    },
    {
      title: "From Date",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (date) => {
        return date ? formattedDate(date) : "";
      },
    },
    {
      title: "Is Differential To Base Lending Rate",
      dataIndex: "isDifferentialToBaseLendingRate",
      key: "isDifferentialToBaseLendingRate",
      render: (_, record) => {
        return (
          <TableRowCheck
            check={
              record.isDifferentialToBaseLendingRate
                ? record.isDifferentialToBaseLendingRate
                : false
            }
          />
        );
      },
      sorter: (a, b) => {
        let ac = a.isActive ? "true" : "false";
        let bc = b.isActive ? "true" : "false";
        return ac.length - bc.length;
      },
    },
    {
      title: <span className="flex justify-end"></span>,
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <DeleteFilled
          className="flex justify-end text-red-500"
          onClick={() => onDelete(_)}
        />
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
}
