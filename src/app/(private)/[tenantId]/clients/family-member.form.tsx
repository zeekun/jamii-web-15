"use client";
import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import { Form } from "antd";
import { SetStateAction, useEffect, useState } from "react";
import CreateFamilyMemberModal from "./create-family-member.modal";
import { Client, FamilyMember, SubmitType } from "@/types";
import { useCreate, usePatch } from "@/api";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import toast from "@/utils/toast";
import FamilyMembersDataTable from "./family-members.data-table";
import { removeKeysFromObject } from "@/utils/arrays";
import { useParams, useRouter } from "next/navigation";

export default function FamilyMemberForm(props: {
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<Client>;
  setFormValues: React.Dispatch<SetStateAction<Partial<Client>>>;
  submitType: SubmitType;
  id?: number;
  groupId?: number;
  isLastStep?: boolean;
  officeId?: number;
  setIsModalOpen: React.Dispatch<SetStateAction<boolean>>;
  legalForm?: "PERSON" | "ENTITY"; // Add legalForm prop
}) {
  const { tenantId } = useParams();
  const router = useRouter();
  const {
    current,
    setCurrent,
    formValues,
    setFormValues,
    submitType,
    officeId,
    id,
    groupId,
    setIsModalOpen,
    isLastStep,
    legalForm = "PERSON", // Default to PERSON
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [familyMembersData, setFamilyMembersData] = useState<FamilyMember[]>(
    []
  );

  const { mutate: insertClient } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);
  const { mutate: updateClient } = usePatch(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  useEffect(() => {
    form.setFieldsValue(formValues);

    if (submitType === "update" && formValues.familyMembers) {
      setFamilyMembersData([...formValues.familyMembers]);
    }
  }, [form, formValues, submitType]);

  const onReset = () => {
    form.resetFields();
  };

  const prepareSubmitData = () => {
    let statusEnum;

    if (formValues.isActive === false) {
      statusEnum = "PENDING";
    } else if (formValues.isActive === true) {
      statusEnum = "ACTIVE";
    }

    let updatedValues: any = {
      client: { ...formValues, statusEnum },
    };

    let phoneNumbers: any[] = [];
    let emails: any[] = [];
    if (formValues.mobileNo) {
      phoneNumbers.push({ number: formValues.mobileNo });
    }
    if (formValues.mobileNo2) {
      phoneNumbers.push({ number: formValues.mobileNo2 });
    }
    if (formValues.email) {
      emails.push({ email: formValues.email });
    }
    updatedValues["phoneNumbers"] = phoneNumbers;
    updatedValues["emails"] = emails;

    // Only include family members if legal form is PERSON
    if (legalForm === "PERSON") {
      updatedValues["familyMembers"] = familyMembersData;
    }

    delete updatedValues["client"]["image"];
    delete updatedValues["client"]["emails"];
    delete updatedValues["client"]["phoneNumbers"];
    delete updatedValues["client"]["email"];
    delete updatedValues["client"]["mobileNo"];
    delete updatedValues["client"]["mobileNo2"];
    delete updatedValues["client"]["familyMembers"];

    if (updatedValues.familyMembers?.length > 0) {
      updatedValues.familyMembers.map((familyMember: any) => {
        if (familyMember.id) delete familyMember.id;
      });
    }

    if (formValues.legalFormEnum === "ENTITY") {
      delete updatedValues["client"]["firstName"];
      delete updatedValues["client"]["lastName"];
      delete updatedValues["client"]["middleName"];
      delete updatedValues["client"]["dateOfBirth"];
    }

    let clientValues = removeKeysFromObject(updatedValues.client, ["office"]);
    clientValues = removeKeysFromObject(clientValues, ["staff"]);

    return {
      ...updatedValues,
      client: { ...clientValues },
      ...(groupId ? { groupId, officeId } : {}),
    };
  };

  const handleSubmitSuccess = (submitTypeMessage: string, data?: any) => {
    toast({
      type: "success",
      response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
    });

    if (submitType === "create") {
      router.push(`/${tenantId}/clients/${data.id}`);
    }

    setIsModalOpen(false);
    setCurrent(0);
    form.resetFields();
  };

  const handleSubmitError = (error: any) => {
    toast({ type: "error", response: error });
    setSubmitLoader(false);
  };

  const submitForm = () => {
    setSubmitLoader(true);
    const submitTypeMessage = submitType === "create" ? "created" : "updated";
    const clientValues = prepareSubmitData();

    if (submitType === "create") {
      insertClient(clientValues, {
        onSuccess: (data) => {
          handleSubmitSuccess(submitTypeMessage, data);
        },
        onError: handleSubmitError,
        onSettled: () => {
          setSubmitLoader(false);
        },
      });
    } else {
      updateClient(clientValues, {
        onSuccess: () => {
          handleSubmitSuccess(submitTypeMessage);
        },
        onError: handleSubmitError,
        onSettled: () => {
          setSubmitLoader(false);
        },
      });
    }
  };

  const onFinish = (values: any) => {
    setFormValues({ ...formValues, ...values });

    // If ENTITY, submit immediately without waiting for family members
    if (legalForm === "ENTITY") {
      submitForm();
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name={"accountingForm"}
      onFinish={onFinish}
      className="grid grid-cols-6 gap-2 text-left"
    >
      {legalForm === "PERSON" && (
        <>
          <CreateFamilyMemberModal
            submitType={submitType}
            formValues={formValues}
            setFormValues={setFormValues}
            familyMembersData={familyMembersData}
            setFamilyMembersData={setFamilyMembersData}
          />

          {familyMembersData.length > 0 && (
            <div className="col-span-6">
              <FamilyMembersDataTable
                data={familyMembersData}
                setFamilyMembersData={setFamilyMembersData}
              />
            </div>
          )}
        </>
      )}

      <div className="col-span-6">
        <FormSubmitButtonsStep
          cancelText="Previous"
          submitLoader={submitLoader}
          onReset={onReset}
          setIsModalOpen={setIsModalOpen}
          handleCancel={() => {
            setCurrent(current - 1);
          }}
          submitText={legalForm === "ENTITY" ? "Submit" : "Next"} // Change button text based on legal form
        />
      </div>
    </Form>
  );
}
