"use client";
import TableHeader from "@/components/table-header";
import type { TableProps } from "antd";
import { Table } from "antd";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MyDataTable from "@/components/data-table";
import { ProductMix } from "@/types";

interface ProductMixTableItem {
  id: number;
  productId: number;
  name: string;
}

export default function DataTable(props: {
  data: ProductMix[] | undefined;
  loading: boolean;
}) {
  const { data, loading } = props;
  const { tenantId } = useParams();

  const [searchedText, setSearchedText] = useState("");

  // Process data with proper typing
  const productMixData: ProductMixTableItem[] = data
    ? Object.values(
        data.reduce(
          (acc: Record<number, ProductMixTableItem>, item: ProductMix) => {
            if (!acc[item.productId]) {
              acc[item.productId] = {
                id: item.id as number,
                productId: item.productId,
                name: item.product?.name ?? "", // Handle possible undefined product name
              };
            }
            return acc;
          },
          {}
        )
      )
    : []; // Provide empty array as fallback

  const columns: TableProps<ProductMixTableItem>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        return (
          <Link href={`/${tenantId}/products/products-mix/${record.productId}`}>
            {record.name}
          </Link>
        );
      },
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.name)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      },
    },
  ];

  return (
    <>
      <MyDataTable<ProductMixTableItem>
        columns={columns}
        rowType="ProductMix"
        redirectUrl={`/${tenantId}/products/products-mix`}
        data={productMixData}
        loading={loading}
        tableHeader={{ setSearchedText }}
      />
    </>
  );
}
