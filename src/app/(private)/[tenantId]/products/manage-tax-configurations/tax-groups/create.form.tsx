"use client";
import { useCreate, useGet, useGetById, usePatch } from "@/api";
import CreateModal from "@/components/create.modal";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { SubmitType, TaxGroup, TaxGroupTaxComponent } from "@/types";
import { Form, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import AddTaxComponentForm from "./add-tax-component.form";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import TaxComponentDataTable from "./tax-component.data-table";
import { useParams } from "next/navigation";
import toast from "@/utils/toast";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isTaxComponentModalOpen, setIsTaxComponentModalOpen] = useState(false);
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [filteredTaxComponentsOptions, setFilteredTaxComponentsOptions] =
    useState<any>([]);
  const [taxComponentData, setTaxComponentData] = useState<any>([]);

  const { mutate: insertTaxGroup } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateTaxGroup } = usePatch(`${tenantId}/tax-groups`, id, [
    `${tenantId}/tax-groups`,
  ]);

  const onReset = () => {
    form.resetFields();
  };

  //alert(id);

  const {
    status: taxGroupStatus,
    data: taxGroup,
    error: taxGroupError,
  } = useGetById<TaxGroup>(`${tenantId}/${ENDPOINT}`, id);

  const {
    status: taxGroupTaxComponentStatus,
    data: taxGroupTaxComponent,
    error: taxGroupTaxComponentError,
  } = useGet<TaxGroupTaxComponent[]>(
    `${tenantId}/tax-groups/${id}/tax-components`,
    [`${tenantId}/tax-groups/${id}/tax-components`]
  );

  useEffect(() => {
    if (submitType === "update" && taxGroupStatus === "success" && taxGroup) {
      form.setFieldsValue({
        name: taxGroup.name,
      });
    }
  }, [submitType, taxGroupStatus, taxGroup, form]);

  useEffect(() => {
    if (
      submitType === "update" &&
      taxGroupTaxComponentStatus === "success" &&
      taxGroupTaxComponent
    ) {
      setTaxComponentData(taxGroupTaxComponent);

      setFilteredTaxComponentsOptions((prevOptions: any[]) => {
        const updatedOptions = prevOptions.filter(
          (option) =>
            !taxGroupTaxComponent.some(
              (component: any) => component.id === option.value
            )
        );
        return updatedOptions;
      });
    }
  }, [submitType, taxGroupTaxComponentStatus, taxGroupTaxComponent]);

  function onFinish(values: any) {
    setSubmitLoader(true);

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    const taxGroup = values;
    const taxComponents = taxComponentData;
    const updatedValues = { taxGroup, taxComponents };

    if (submitType === "create") {
      insertTaxGroup(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          setTaxComponentData([]);
          form.resetFields();
        },
        onError(error, variables, context) {
          toast({ type: "error", response: error });

          setSubmitLoader(false);
        },
      });
    } else {
      updateTaxGroup(
        { id, ...updatedValues },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
          },
          onError(error, variables, context) {
            toast({ type: "error", response: error });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={`${PAGE_TITLE}${id}`}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      <>
        <Form.Item
          className="col-span-2"
          name="name"
          label="Name"
          rules={[{ required: true, message: "Name is required!" }]}
        >
          <Input />
        </Form.Item>

        <div className="flex justify-between col-span-2">
          <Title level={5}>Tax Components</Title>
          <CreateModal
            pageTitle="Tax Component"
            submitType="create"
            isModalOpen={isTaxComponentModalOpen}
            setIsModalOpen={setIsTaxComponentModalOpen}
            CreateForm={
              <AddTaxComponentForm
                submitType="create"
                taxComponentData={taxComponentData}
                setTaxComponentData={setTaxComponentData}
                setFilteredTaxComponentsOptions={
                  setFilteredTaxComponentsOptions
                }
                filteredTaxComponentsOptions={filteredTaxComponentsOptions}
              />
            }
            width={500}
            buttonTitle="add"
          />
        </div>

        <div className="col-span-2">
          <TaxComponentDataTable
            data={taxComponentData}
            setTaxComponentData={setTaxComponentData}
            loading={false}
            setFilteredTaxComponentsOptions={setFilteredTaxComponentsOptions}
            filteredTaxComponentsOptions={filteredTaxComponentsOptions}
          />
        </div>

        <div className="col-span-2 ">
          <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
        </div>
      </>
    </Form>
  );
}
