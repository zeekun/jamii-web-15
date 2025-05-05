import { Steps } from "antd";
import React, { useEffect, useState } from "react";
import ClientForm from "./client.form";
import FamilyMemberForm from "./family-member.form";
import { Client, SubmitType } from "@/types";
import { ENDPOINT } from "./constants";
import { useGetById } from "@/api";
import dayjs from "dayjs";
import CreateFormLoading from "@/components/create-form-loading";
import { useParams } from "next/navigation";

export default function CreateClientForm(props: {
  officeId?: number;
  groupId?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitType?: SubmitType;
  id?: number;
}) {
  const { tenantId } = useParams();
  const {
    submitType = "create",
    id,
    setIsModalOpen,
    officeId,
    groupId,
  } = props;

  const [current, setCurrent] = useState(0);
  const [formValues, setFormValues] = useState<Partial<Client>>({});
  const [legalForm, setLegalForm] = useState<"PERSON" | "ENTITY">("PERSON");
  const [showPersonInputs, setShowPersonInputs] = useState(true);
  const [showEntityInputs, setShowEntityInputs] = useState(false);

  const {
    status: clientStatus,
    data: client,
    error: clientError,
  } = useGetById<Partial<Client>>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "update" && clientStatus === "success" && client) {
      // Clean up unwanted fields
      const fieldsToDelete = [
        "office",
        "staff",
        "middleName",
        "dateOfBirth",
        "activationDate",
        "externalId",
        "savingsProductId",
        "genderEnum",
        "clientClassificationId",
        "submittedOnDate",
        "submittedOnUserId",
        "isOpenSavingsAccount",
        "staffId",
        "isStaff",
      ];

      fieldsToDelete.forEach((field) => {
        if (!client[field as keyof Client])
          delete client[field as keyof Client];
      });

      setFormValues({
        ...client,
        dateOfBirth:
          client.dateOfBirth &&
          (dayjs(client.dateOfBirth) as unknown as string),
        submittedOnDate:
          client.submittedOnDate &&
          (dayjs(client.submittedOnDate) as unknown as string),
      });
    }
  }, [submitType, clientStatus, client]);

  const onChangeLegalForm = (value: "PERSON" | "ENTITY") => {
    setLegalForm(value);
    setShowPersonInputs(value === "PERSON");
    setShowEntityInputs(value === "ENTITY");
    setCurrent(0); // Always reset to first step when changing legal form
  };

  // Generate steps based on current legal form
  const steps = React.useMemo(() => {
    const baseSteps = [
      {
        title: "Client",
        content: (
          <ClientForm
            submitType={submitType}
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            id={id}
            officeId={officeId}
            onChangeLegalForm={onChangeLegalForm}
            showPersonInputs={showPersonInputs}
            setShowPersonInputs={setShowPersonInputs}
            showEntityInputs={showEntityInputs}
            setShowEntityInputs={setShowEntityInputs}
            isLastStep={legalForm !== "PERSON"}
          />
        ),
      },
    ];

    if (legalForm === "PERSON") {
      baseSteps.push({
        title: "Family Members",
        content: (
          <FamilyMemberForm
            submitType={submitType}
            setIsModalOpen={setIsModalOpen}
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            groupId={groupId}
            officeId={officeId}
            id={id}
            isLastStep={true}
            legalForm={legalForm}
          />
        ),
      });
    }

    return baseSteps;
  }, [
    legalForm,
    current,
    formValues,
    submitType,
    id,
    officeId,
    groupId,
    showPersonInputs,
    showEntityInputs,
  ]);

  // Ensure current step is always valid
  useEffect(() => {
    if (current >= steps.length) {
      setCurrent(steps.length - 1);
    }
  }, [steps.length, current]);

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  return (
    <CreateFormLoading
      status={clientStatus}
      error={clientError}
      form={
        <>
          <Steps current={current} items={items} />
          {steps.length > 0 && (
            <div className="mt-5">{steps[current]?.content}</div>
          )}
        </>
      }
    />
  );
}
