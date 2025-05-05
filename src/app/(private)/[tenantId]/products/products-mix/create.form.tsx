"use client";
import { get, useCreate, useGet, useGetById } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { LoanProduct, ProductMix, SubmitType } from "@/types";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { filterOption } from "@/utils/strings";
import { useParams } from "next/navigation";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [selectedRestrictedProducts, setSelectedRestrictedProducts] = useState<
    string[]
  >([]);

  const { mutate: insertProductMix } = useCreate<Partial<ProductMix>>(
    `${tenantId}/${ENDPOINT}`,
    [`${tenantId}/${QUERY_KEY}`]
  );

  const onReset = () => {
    form.resetFields();
  };

  const {
    status: productMixStatus,
    data: productMix,
    error: productMixError,
  } = useGet<ProductMix[]>(`${tenantId}/loan-products/${id}/loan-products`);

  useEffect(() => {
    if (
      submitType === "update" &&
      productMixStatus === "success" &&
      productMix
    ) {
      const productMixes = get(
        `${tenantId}/loan-products/${productMix[0].productId}/product-mixes`
      );

      let restrictedProducts: string[] = [];
      productMixes.then((res) => {
        res.data.forEach((data: any) => {
          restrictedProducts.push(data.restrictedProduct.name);
        });

        form.setFieldsValue({ ...productMix, restrictedProducts });
      });
    }
  }, [submitType, productMixStatus, productMix, form]);

  const {
    status: loanProductsStatus,
    data: loanProducts,
    error: loanProductsError,
  } = useGet<LoanProduct[]>(`${tenantId}/loan-products`, [
    `${tenantId}/loan-products`,
  ]);

  let productOptions: any[] = [];
  let restrictedProductOptions: any[] = [];

  if (loanProductsStatus === "success") {
    productOptions = loanProducts.map((loanProduct: LoanProduct) => {
      return {
        value: loanProduct.id,
        label: loanProduct.name,
      };
    });

    restrictedProductOptions = loanProducts
      .filter(
        (loanProduct: LoanProduct) =>
          !selectedRestrictedProducts.includes(loanProduct.name)
      )
      .map((loanProduct: LoanProduct) => {
        return {
          value: loanProduct.name,
          label: loanProduct.name,
        };
      });
  }

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";
    let updatedValues = {
      productId: values.productId,
      restrictedProducts: values.restrictedProducts,
    };

    if (submitType === "create") {
      insertProductMix(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast.success(`${PAGE_TITLE} ${submitTypeMessage} successfully.`, {
            theme: "colored",
          });
          form.resetFields();
        },
        onError(error, variables, context) {
          toast.error(error.message, {
            theme: "colored",
          });

          setSubmitLoader(false);
        },
      });
    } else {
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={id ? `${PAGE_TITLE}${id}` : PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <Form.Item
        className="col-span-2"
        name="productId"
        label="Product"
        rules={[{ required: true, message: "Product is required!" }]}
      >
        <Select
          filterOption={filterOption}
          allowClear
          showSearch
          options={productOptions}
          disabled={submitType === "update" ? true : false}
        />
      </Form.Item>

      <Form.Item
        className="col-span-2"
        name="restrictedProducts"
        label="Restricted Product(s)"
        rules={[
          { required: true, message: "Restricted Product(s) is required!" },
        ]}
      >
        <Select
          filterOption={filterOption}
          allowClear
          showSearch
          options={restrictedProductOptions}
          onChange={setSelectedRestrictedProducts}
          mode="multiple"
        />
      </Form.Item>

      <div className="col-span-2 ">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
