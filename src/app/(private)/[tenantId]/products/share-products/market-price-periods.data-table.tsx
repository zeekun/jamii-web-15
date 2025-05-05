import { ShareProductMarketPrice } from "@/types";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import { DeleteFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Table } from "antd";

export default function MarketPricePeriodDataTable(props: {
  data?: ShareProductMarketPrice[];
  setMarketPriceData: React.Dispatch<
    React.SetStateAction<ShareProductMarketPrice[]>
  >;
  formValues: any;
  setFormValues: any;
}) {
  const { data, setMarketPriceData, formValues, setFormValues } = props;

  const removeObjectById = (arr: ShareProductMarketPrice[], id: number) => {
    return arr.filter((obj) => obj.id !== id);
  };

  const onDelete = (id: number) => {
    if (data) {
      const updatedData = removeObjectById(data, id);
      setMarketPriceData(updatedData);
      setFormValues({ ...formValues, shareProductMarketPrices: updatedData });
    }
  };

  const columns: TableProps<ShareProductMarketPrice>["columns"] = [
    {
      title: <span className="flex justify-end">Nominal/Unit Price</span>,
      dataIndex: "shareValue",
      key: "shareValue",
      render: (value) => (
        <span className="flex justify-end">{formatNumber(value)}</span>
      ),
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
