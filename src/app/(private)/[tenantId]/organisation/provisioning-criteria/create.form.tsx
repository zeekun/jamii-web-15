"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import {
  LoanProduct,
  ProvisionCategory,
  ProvisioningCriteria,
  ProvisioningCriteriaDefinition,
  SubmitType,
} from "@/types";
import toast from "@/utils/toast";
import { Form, Input, InputNumber, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useParams } from "next/navigation";
import { filterOption } from "@/utils/strings";
import { useGLAccounts } from "@/hooks/gl-accounts";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const {
    status: loanProductsStatus,
    data: loanProducts,
    error,
  } = useGet<LoanProduct[]>(`${tenantId}/loan-products`, [
    `${tenantId}/loan-products`,
  ]);

  let loanProductsOptions: any = [];

  if (loanProductsStatus === "success") {
    loanProductsOptions = loanProducts
      .filter((o) => o.id !== id)
      .map((loanProduct: LoanProduct) => {
        return { value: loanProduct.id, label: loanProduct.name };
      });
  }

  const { mutate: insertProvisioningCriteria } = useCreate(
    `${tenantId}/${ENDPOINT}`,
    [`${tenantId}/${QUERY_KEY}`]
  );
  const { mutate: updateProvisioningCriteria } = usePatch(
    `${tenantId}/${ENDPOINT}`,
    id,
    [`${tenantId}/${QUERY_KEY}`]
  );

  const {
    status: provisioningCriteriaStatus,
    data: provisioningCriteria,
    error: provisioningCriteriaError,
  } = useGetById<ProvisioningCriteria>(`${tenantId}/${ENDPOINT}`, id);

  const definitionsByCategory = useMemo(() => {
    const map = new Map<string, ProvisioningCriteriaDefinition>();
    provisioningCriteria?.provisioningCriteriaDefinitions?.forEach((def) => {
      map.set(def.category.name, def);
    });
    return map;
  }, [provisioningCriteria?.provisioningCriteriaDefinitions]);

  useEffect(() => {
    if (
      submitType === "update" &&
      provisioningCriteriaStatus === "success" &&
      provisioningCriteria
    ) {
      const initialValues = {
        ...provisioningCriteria,
        products: provisioningCriteria.loanProducts?.map(
          (product) => product.id
        ),
      };

      // List of all categories we need to handle
      const categories: string[] = [
        "STANDARD",
        "SUB-STANDARD",
        "DOUBTFUL",
        "LOSS",
      ];

      // Fields to extract from each definition
      const definitionFields = [
        "minAge",
        "maxAge",
        "provisionPercentage",
        "liabilityAccountId",
        "expenseAccountId",
      ] as const;

      // Process each category and field combination
      categories.forEach((category) => {
        const definition = definitionsByCategory.get(category);
        if (definition) {
          definitionFields.forEach((field) => {
            const fieldName = field.endsWith("Id")
              ? field.replace("Id", "")
              : field;
            (initialValues as Record<string, any>)[`${category}_${fieldName}`] =
              definition[field];
          });
        }
      });

      form.setFieldsValue(initialValues);
    }
  }, [
    submitType,
    provisioningCriteriaStatus,
    provisioningCriteria,
    form,
    definitionsByCategory,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    function transformData(values: any) {
      const transformed: any = {
        name: values.name,
        products: values.products,
      };

      const categoryKeys = Object.keys(values).filter((key) =>
        key.includes("_")
      );

      categoryKeys.forEach((key: any) => {
        const [category, property] = key.split("_");

        if (!transformed[category]) {
          transformed[category] = {};
        }

        transformed[category][property] = values[key];
      });

      return transformed;
    }

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      setSubmitLoader(false);
      insertProvisioningCriteria(transformData(values), {
        onSuccess: () => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            type: "success",
          });
          form.resetFields();
        },
        onError(error: any, variables, context) {
          toast({ response: error, type: "error" });
          setSubmitLoader(false);
        },
      });
    } else {
      const v = transformData(values);
      updateProvisioningCriteria(
        { id, ...v },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
              type: "success",
            });
            form.resetFields();
          },
          onError(error, variables, context) {
            toast({ response: error, type: "error" });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  const {
    options: glLiabilityAccountsOptions,
    status: glLiabilityAccountStatus,
    error: glLiabilityAccountsError,
  } = useGLAccounts("LIABILITY", `${tenantId}`, "DETAIL");

  const {
    options: glExpenseAccountsOptions,
    status: glExpenseAccountStatus,
    error: glExpenseAccountsError,
  } = useGLAccounts("EXPENSE", `${tenantId}`, "DETAIL");

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
    >
      <div className="grid grid-cols-2 gap-3">
        <Form.Item
          name="name"
          label="Provisioning Criteria"
          rules={[
            { required: true, message: "Provisioning Criteria is required!" },
          ]}
        >
          <Input className="w-full" />
        </Form.Item>

        <Form.Item
          name="products"
          label="Product(s)"
          rules={[{ required: true, message: "Product(s) is required!" }]}
        >
          <Select
            className="w-full"
            mode="multiple"
            options={loanProductsOptions}
            allowClear
            showSearch
            filterOption={filterOption}
          />
        </Form.Item>
      </div>

      <DefinitionsTable
        glExpenseAccountsOptions={glExpenseAccountsOptions}
        glLiabilityAccountsOptions={glLiabilityAccountsOptions}
      />

      <div className="mt-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}

const DefinitionsTableRow = ({ category, formNames, accountOptions }: any) => (
  <tr>
    <td className="flex justify-start items-center">{category}</td>
    {formNames.map(({ name, message }: any, index: any) => (
      <td key={index} className="w-[10%]">
        <Form.Item
          className="col-span-3"
          name={`${category}_${name}`}
          rules={[{ required: true, message }]}
          initialValue={index}
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Form.Item>
      </td>
    ))}
    {accountOptions.map(({ name, message, options }: any, index: any) => (
      <td key={index} className="w-[30%]">
        <Form.Item
          className="col-span-3"
          name={`${category}_${name}`}
          rules={[{ required: true, message }]}
        >
          <Select options={options} showSearch allowClear filterOption />
        </Form.Item>
      </td>
    ))}
  </tr>
);

const DefinitionsTable = (props: {
  glLiabilityAccountsOptions: any;
  glExpenseAccountsOptions: any;
}) => {
  const formNames = [
    { name: "minAge", message: "Min Age is required!" },
    { name: "maxAge", message: "Max Age is required!" },
    { name: "provisionPercentage", message: "Percentage is required!" },
  ];

  const accountOptions = [
    {
      name: "liabilityAccount",
      message: "Liability Account is required!",
      options: props.glLiabilityAccountsOptions,
    },
    {
      name: "expenseAccount",
      message: "Expense Account is required!",
      options: props.glExpenseAccountsOptions,
    },
  ];

  const categories = ["STANDARD", "SUB-STANDARD", "DOUBTFUL", "LOSS"];

  return (
    <table className="w-full">
      <thead className="bg-gray-300">
        <tr className="mb-4">
          <th>Category</th>
          <th>Min Age</th>
          <th>Max Age</th>
          <th>Percentage</th>
          <th>Liability Account</th>
          <th>Expense Account</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <DefinitionsTableRow
            key={category}
            category={category}
            formNames={formNames}
            accountOptions={accountOptions}
          />
        ))}
      </tbody>
    </table>
  );
};
