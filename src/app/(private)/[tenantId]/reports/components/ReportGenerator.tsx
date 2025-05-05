"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Tabs,
  Table,
  Spin,
  Select,
  Space,
  message,
} from "antd";
import { useCreate, useGetById, usePatch } from "@/api";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";
import PageHeader from "@/components/page-header";
import { StretchyReport, StretchyReportParameter, SubmitType } from "@/types";
import {
  EditOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { ValueType } from "rc-input/lib/interface";
import MyButton from "@/components/my-button";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement);

const ReportGenerator = ({
  submitType = "create",
  report,
}: {
  submitType?: SubmitType | "view";
  report?: StretchyReport;
}) => {
  const { tenantId } = useParams();
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("table");
  const [loading, setLoading] = useState(false);
  const [saveReportLoading, setSaveReportLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [canSaveReportDisabled, setCanSaveReportDisabled] = useState(true);
  const [pageTitle, setPageTitle] = useState("Create Report");
  const [showForm, setShowForm] = useState(false);
  const [variables, setVariables] = useState<StretchyReportParameter[]>([]);
  const [sql, setSql] = useState("");
  const [showCountFields, setShowCountFields] = useState(false);
  const [variableErrorMessage, setVariableErrorMessage] = useState("");

  const { mutate: runReport } = useCreate(
    `${tenantId}/stretchy-reports/run-sql`,
    [`${tenantId}/stretchy-reports/run-sql`]
  );

  const { mutate: saveReport } = useCreate(`${tenantId}/stretchy-reports`, [
    `${tenantId}/stretchy-reports`,
  ]);

  const { mutate: updateReport } = usePatch(
    `${tenantId}/stretchy-reports`,
    report?.id,
    [`${tenantId}/stretchy-reports/${report?.id}`]
  );

  useEffect(() => {
    if (submitType !== "create" && report?.sql) {
      if (submitType === "view") setShowForm(false);
      form.setFieldsValue(report);
      if (report.sql.toLocaleLowerCase().includes(`count(`))
        setShowCountFields(true);

      setVariables(report.stretchyReportParameters);
      setPageTitle(report.name);

      /********these are used by the pie chart and bar chart*/
      report.stretchyReportParameters &&
        report.stretchyReportParameters.forEach((parameter) => {
          parameter.variableName === "Label Field" &&
            form.setFieldValue("labelForCountField", parameter.variableName);
          parameter.variableInput === "Count Field" &&
            form.setFieldValue("countField", parameter.variableInput);
        });

      /********************************************/
      generateReport(
        {
          name: report.name,
          category: report.category,
          type: report.type,
          sql: report.sql,
        },
        report.stretchyReportParameters
      );
    }
  }, [report, submitType]);

  useEffect(() => {
    if (submitType === "create") {
      setShowForm(true);
    }
  }, [submitType]);

  const generateReport = (values: any, variables?: any) => {
    if (variables) {
      if (!validateVariables()) {
        return;
      }
    }

    if (!values.sql.trim()) {
      toast({ type: "error", response: "Please enter a valid SQL query." });
      return;
    }

    const updatedBody = variables
      ? { stretchyReport: values, variables }
      : { stretchyReport: values };

    setLoading(true);
    runReport(updatedBody, {
      onSuccess: (data: any) => {
        handleReportSuccess(data, values.labelForCountField, values.countField);
      },

      onError: (error: any) => handleError(error, "Failed to run query."),
    });
  };

  const handleReportSuccess = (
    data: any,
    labelForCountField?: string,
    countField?: string
  ) => {
    setLoading(false);

    if (data.success) {
      const records = data.data || [];
      if (records.length > 0) {
        setDisplayData(records, labelForCountField, countField);
        toast({ type: "success", response: "Success in running the report." });
        setCanSaveReportDisabled(false);
      } else {
        resetData("No data available in the response.");
      }
    } else {
      toast({ type: "error", response: "Failed to generate report." });
    }
  };

  const handleError = (error: any, defaultMessage: string) => {
    setLoading(false);
    toast({ type: "error", response: error || defaultMessage });
  };

  const setDisplayData = (
    records: any[],
    labelForCountField?: string,
    countField?: string
  ) => {
    if (records.length === 0) {
      setColumns([]);
      setTableData([]);
      setChartData(null);
      return;
    }

    const inferredColumns = Object.keys(records[0]).map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: key,
      key,
    }));
    setColumns(inferredColumns);
    setTableData(records);
    setActiveTab("table");

    if (
      submitType !== "create" &&
      report?.labelForCountField &&
      report?.countField
    ) {
      labelForCountField = report.labelForCountField;
      countField = report.countField;
    }

    if (labelForCountField && countField) {
      const labels = records.map((record) => record[labelForCountField]);
      const values = records.map((record) => record[countField]);

      setChartData({
        bar: {
          labels,
          datasets: [
            {
              label: "Dataset",
              data: values,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        pie: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
            },
          ],
        },
      });
    }
  };

  const resetData = (message: string) => {
    toast({ type: "success", response: message });
    setTableData([]);
    setColumns([]);
    setChartData(null);
  };

  const handleSaveReport = () => {
    setSaveReportLoading(true);
    setCanSaveReportDisabled(true);
    if (submitType === "create") {
      saveReport(formValues, {
        onSuccess: () => {
          setSaveReportLoading(false);
          toast({ type: "success", response: "Report saved successfully." });
          setCanSaveReportDisabled(true);
        },
        onError: (error: any) => handleError(error, "Failed to save report."),
        onSettled: () => {
          setSaveReportLoading(false);
        },
      });
    } else {
      updateReport(
        { ...formValues },
        {
          onSuccess: () => {
            setSaveReportLoading(false);
            toast({
              type: "success",
              response: `Report updated successfully.`,
            });
          },
          onError(error, variables, context) {
            toast({ type: "error", response: error });

            setSaveReportLoading(false);
          },
        }
      );
    }
  };

  const onClickEdit = () => {
    if (report?.sql.toLocaleLowerCase().includes(`count(`))
      setShowCountFields(true);
    setCanSaveReportDisabled(true);
    setShowForm(!showForm);
  };

  const handleAddVariable = () => {
    if (!validateVariables()) {
      return;
    }
    setCanSaveReportDisabled(true);
    setVariables([
      ...variables,
      {
        variableName: "",
        variableType: "string",
        variableLabel: "",
        variableInput: "",
      },
    ]);
  };

  const handleRemoveVariable = (index: number) => {
    setCanSaveReportDisabled(true);
    setVariableErrorMessage("");
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: "variableName" | "variableType" | "variableLabel" | "variableInput",
    value: string
  ) => {
    setVariables(
      variables.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable
      )
    );
  };

  useEffect(() => {
    setShowCountFields(sql.toLowerCase().includes("count("));
  }, [sql]);

  const handleSqlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSql(event.target.value);
  };

  const validateVariables = () => {
    for (const variable of variables) {
      if (
        !variable.variableName.trim() ||
        !variable.variableType.trim() ||
        !variable.variableLabel.trim()
      ) {
        setVariableErrorMessage("All fields are required for each variable.");
        return false;
      }
    }
    setVariableErrorMessage("");
    return true;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <PageHeader pageTitle={pageTitle} />
        {submitType !== "create" && (
          <Button type="primary" icon={<EditOutlined />} onClick={onClickEdit}>
            Edit
          </Button>
        )}
      </div>

      {showForm && (
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            setFormValues({ stretchyReport: values, variables });
            generateReport(values, variables);
          }}
          className="grid grid-cols-12 gap-4"
        >
          <Form.Item
            className="col-span-4"
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            className="col-span-4"
            name="category"
            label="Category"
            rules={[{ required: true, message: "Category is required!" }]}
          >
            <Select allowClear showSearch>
              <Select.Option value="clients">Clients</Select.Option>
              <Select.Option value="loans">Loans</Select.Option>
              <Select.Option value="savings">Savings</Select.Option>
              <Select.Option value="accounting">Accounting</Select.Option>
              <Select.Option value="organisation">Organisation</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-4"
            name="type"
            label="Default Type"
            rules={[{ required: true, message: "Type is required!" }]}
          >
            <Select allowClear>
              <Select.Option value="table">Table</Select.Option>
              <Select.Option value="bar">Bar Chart</Select.Option>
              <Select.Option value="pie">Pie Chart</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            className="col-span-12"
            name="sql"
            label="SQL Query"
            rules={[{ required: true, message: "SQL query is required!" }]}
          >
            <Input.TextArea
              onChange={handleSqlChange}
              rows={4}
              placeholder="Enter your SQL query here"
            />
          </Form.Item>

          <div className="col-span-12  pt-7 px-3 rounded-md bg-gray-100">
            {showCountFields && (
              <>
                <label>
                  These fields are available for a query that has <b>Count</b>.
                  They are used for some Charts like Bar and Pie Chart
                </label>
                <div className="grid grid-cols-12 gap-3">
                  <Form.Item name={"labelForCountField"} className="col-span-6">
                    <Input placeholder="Enter the field for labels" />
                  </Form.Item>
                  <Form.Item name={"countField"} className="col-span-6">
                    <Input placeholder="Enter the field for counts" />
                  </Form.Item>
                </div>
              </>
            )}

            <div className="col-span-12 mb-5">
              <div>These are variables to be used by the query.</div>
              {variables &&
                variables.length > 0 &&
                variables.map((variable, index) => {
                  return (
                    <div key={index} className="flex gap-3 mb-3">
                      <Input
                        placeholder="Variable Name"
                        value={variable.variableName}
                        onChange={(e) =>
                          handleChange(index, "variableName", e.target.value)
                        }
                      />
                      <Select
                        value={variable.variableType}
                        onChange={(value) =>
                          handleChange(index, "variableType", value)
                        }
                        className="w-full"
                        placeholder="Type"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                      </Select>
                      <Input
                        placeholder="Label"
                        value={variable.variableLabel}
                        onChange={(e) =>
                          handleChange(index, "variableLabel", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Input"
                        value={variable.variableInput}
                        onChange={(e) =>
                          handleChange(index, "variableInput", e.target.value)
                        }
                      />

                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => handleRemoveVariable(index)}
                      />
                    </div>
                  );
                })}
              <div className="text-red-500">{variableErrorMessage}</div>
              <Button onClick={() => handleAddVariable()}>Add Variable</Button>
            </div>
          </div>

          <Form.Item className="col-span-12">
            <div className="flex justify-start gap-3">
              <MyButton
                type="gray"
                icon={<SettingOutlined spin={loading} />}
                htmlType="submit"
                loading={loading}
              >
                Run Report
              </MyButton>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={handleSaveReport}
                loading={saveReportLoading}
                disabled={canSaveReportDisabled}
              >
                {submitType === "create" ? "Save" : "Update"} Report
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}

      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              label: "Table",
              key: "table",
              children:
                tableData.length > 0 ? (
                  <Table
                    dataSource={tableData}
                    columns={columns}
                    rowKey={(record) => record.id || record.key}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: "max-content" }}
                  />
                ) : (
                  <p>No table data available.</p>
                ),
            },
            {
              label: "Bar Chart",
              key: "bar-chart",
              children: chartData ? (
                <div className="w-[70rem]">
                  <Bar
                    data={chartData.bar}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: true, position: "top" } },
                    }}
                  />
                </div>
              ) : (
                <p>No chart data available.</p>
              ),
            },
            {
              label: "Pie Chart",
              key: "pie-chart",
              children: chartData ? (
                <div className="w-1/3">
                  <Pie
                    data={chartData.pie}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: true, position: "top" } },
                    }}
                  />
                </div>
              ) : (
                <p>No chart data available.</p>
              ),
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default ReportGenerator;
