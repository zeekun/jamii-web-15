import { Steps } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import ChargesForm from "./charges.form";
import DetailsForm from "./details.form";
import TermsForm from "./terms.form";
import {
  Client,
  Group,
  SavingsAccount,
  SavingsProduct,
  SubmitType,
} from "@/types";
import Review from "./review";
import { get } from "@/api";
import dayjs from "dayjs";
import { useParams } from "next/navigation";

export default function CreateSavingsForm(props: {
  client?: Client | Group;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitType?: SubmitType;
  savingsAccountId?: number;
}) {
  const { tenantId } = useParams();
  const {
    submitType = "create",
    savingsAccountId,
    setIsModalOpen,
    client,
  } = props;
  const [current, setCurrent] = useState(0);

  const [formValues, setFormValues] = useState<Partial<SavingsAccount>>({
    ...(client && "legalFormEnum" in client
      ? { clientId: client.id } // If client has legalFormEnum, it's a Client
      : { groupId: client?.id }), // Otherwise, it's a Group
  });

  const [selectedSavingsProduct, setSelectedSavingsProduct] = useState<
    Partial<SavingsProduct>
  >({});
  const [showSavingsProduct, setShowSavingsProduct] = useState(false);
  const [productName, setProductName] = useState<string>();

  useEffect(() => {
    if (submitType === "update" && savingsAccountId) {
      get(`${tenantId}/savings-accounts/${savingsAccountId}`).then((res) => {
        const savingsAccount: SavingsAccount = res.data;

        setProductName(savingsAccount.savingsProduct.name);

        setFormValues({
          ...formValues,
          ...savingsAccount,
          submittedOnDate:
            savingsAccount.submittedOnDate &&
            (dayjs(savingsAccount.submittedOnDate) as unknown as string),
        });
      });
    }
  }, [submitType, savingsAccountId]);

  const steps = useMemo(
    () => [
      {
        title: "Details",
        content: (
          <DetailsForm
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            submitType={submitType}
            id={savingsAccountId}
            selectedSavingsProduct={selectedSavingsProduct}
            setSelectedSavingsProduct={setSelectedSavingsProduct}
            showSavingsProduct={showSavingsProduct}
            setShowSavingsProduct={setShowSavingsProduct}
          />
        ),
      },
      {
        title: "Terms",
        content: (
          <TermsForm
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            submitType={submitType}
            id={savingsAccountId}
            selectedSavingsProduct={selectedSavingsProduct}
          />
        ),
      },
      {
        title: "Charges",
        content: (
          <ChargesForm
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            submitType={submitType}
            id={savingsAccountId}
            selectedSavingsProduct={selectedSavingsProduct}
          />
        ),
      },
      {
        title: "Review",
        content: (
          <Review
            setIsModalOpen={setIsModalOpen}
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            submitType={submitType}
            id={savingsAccountId}
            productName={productName}
            selectedSavingsProduct={selectedSavingsProduct}
          />
        ),
      },
    ],
    [
      current,
      formValues,
      selectedSavingsProduct,
      showSavingsProduct,
      submitType,
      savingsAccountId,
    ] // Memoize based on relevant variables
  );

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <>
      <Steps current={current} items={items} />
      <div className="mt-3">{steps[current].content}</div>
    </>
  );
}
