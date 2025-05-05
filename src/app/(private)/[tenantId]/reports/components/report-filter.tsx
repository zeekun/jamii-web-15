"use client";

import { Office } from "@/types";
import { filterOption } from "@/utils/strings";
import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Select } from "antd";

const { RangePicker } = DatePicker;

export default function ReportFilter(props: {
  dateRange: any;
  setDateRange: any;
  selectedOffice: number | null;
  setSelectedOffice: any;
  searchText: string;
  setSearchText: any;
  handleClearFilters: any;
  officesData?: Office[];
}) {
  const {
    dateRange,
    setDateRange,
    selectedOffice,
    setSelectedOffice,
    searchText,
    setSearchText,
    handleClearFilters,
    officesData,
  } = props;

  return (
    <>
      <RangePicker
        value={dateRange}
        onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
        className="w-full md:w-64"
      />
      <Select
        placeholder="Select Office"
        allowClear
        className="w-full md:w-48"
        value={selectedOffice}
        onChange={setSelectedOffice}
        showSearch
        filterOption={(input, option) => filterOption(input, option as any)}
        options={
          officesData?.map((office) => ({
            label: office.name,
            value: office.id,
          })) ?? []
        }
      />

      <Input
        placeholder="Search accounts"
        prefix={<SearchOutlined />}
        className="w-full md:w-64"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Button
        icon={<ClearOutlined />}
        onClick={handleClearFilters}
        className="w-full md:w-auto"
      >
        Clear Filters
      </Button>
    </>
  );
}
