import { Steps } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import ChargesForm from "./charges.form";
import DetailsForm from "./details.form";
import TermsForm from "./terms.form";
import { Client, Group, ShareAccount, ShareProduct, SubmitType } from "@/types";
import Review from "./review";
import { get } from "@/api";
import dayjs from "dayjs";
import { useParams } from "next/navigation";

export default function CreateForm(props: {
  client?: Client | Group;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitType?: SubmitType;
  shareAccountId?: number;
}) {
  const { tenantId } = useParams();
  const {
    submitType = "create",
    shareAccountId,
    setIsModalOpen,
    client,
  } = props;
  const [current, setCurrent] = useState(0);
  const { id } = useParams();
  const [productName, setProductName] = useState<string>();
  const [formValues, setFormValues] = useState<Partial<ShareAccount>>({
    ...(client && "legalFormEnum" in client
      ? { clientId: client.id } // If client has legalFormEnum, it's a Client
      : { groupId: client?.id }), // Otherwise, it's a Group
  });
  const [selectedShareProduct, setSelectedShareProduct] = useState<
    Partial<ShareProduct>
  >({});
  const [selectedSavingsAccount, setSelectedSavingsAccount] =
    useState<React.ReactNode>();
  const [showShareProduct, setShowShareProduct] = useState(false);

  useEffect(() => {
    if (submitType === "update" && shareAccountId) {
      get(`${tenantId}/share-accounts/${shareAccountId}`).then((res) => {
        const shareAccount: ShareAccount = res.data;

        console.log("shareAccount", shareAccount);

        setProductName(shareAccount.shareProduct.name);
        setFormValues({
          ...formValues,
          ...shareAccount,
          submittedDate:
            shareAccount.submittedDate &&
            (dayjs(shareAccount.submittedDate) as unknown as string),
          unitPrice: shareAccount.shareProduct.unitPrice,
        });
      });
    }
  }, [submitType, shareAccountId]);

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
            id={shareAccountId}
            selectedShareProduct={selectedShareProduct}
            setSelectedShareProduct={setSelectedShareProduct}
            showShareProduct={showShareProduct}
            setShowShareProduct={setShowShareProduct}
          />
        ),
      },
      {
        title: "Terms",
        content: (
          <TermsForm
            client={client}
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            submitType={submitType}
            id={shareAccountId}
            selectedShareProduct={selectedShareProduct}
            setSelectedSavingsAccount={setSelectedSavingsAccount}
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
            id={shareAccountId}
            selectedShareProduct={selectedShareProduct}
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
            submitType={submitType}
            selectedShareProduct={selectedShareProduct}
            id={shareAccountId}
            productName={productName}
          />
        ),
      },
    ],
    [
      current,
      formValues,
      selectedShareProduct,
      showShareProduct,
      submitType,
      shareAccountId,
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
