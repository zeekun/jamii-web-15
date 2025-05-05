import { Steps } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import DetailsForm from "./details.form";
import TermsForm from "./terms.form";
import {
  DepositAccount,
  DepositProductTermAndPreClosure,
  SubmitType,
} from "@/types";
import Review from "./review";
import { get } from "@/api";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import SettingsForm from "./settings.form";
import InterestRateChartForm from "./interest-rate-chart.form";
import ChargesForm from "../components/savings/charges.form";

export default function CreateFixedDepositAccountForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  submitType?: SubmitType;
  fixedDepositAccountId?: number;
}) {
  const { tenantId } = useParams();
  const {
    submitType = "create",
    setIsModalOpen,
    fixedDepositAccountId,
  } = props;
  const [current, setCurrent] = useState(0);
  const { id } = useParams();
  const [formValues, setFormValues] = useState<Partial<DepositAccount>>({});
  const [selectedDepositProduct, setSelectedDepositProduct] = useState<
    Partial<DepositProductTermAndPreClosure>
  >({});
  const [selectedSavingsAccount, setSelectedSavingsAccount] =
    useState<React.ReactNode>();
  const [showFixedDepositProduct, setShowFixedDepositProduct] = useState(false);
  const [productName, setProductName] = useState<string>();

  useEffect(() => {
    if (submitType === "update" && fixedDepositAccountId) {
      //get savingsProductId which should be 46

      get(`${tenantId}/savings-accounts/${fixedDepositAccountId}`).then(
        (res) => {
          const fixedDepositAccount: DepositAccount = res.data;

          console.log("fixedDepositAccount", fixedDepositAccount);

          setProductName(fixedDepositAccount.savingsProduct.name);

          setFormValues({
            ...formValues,
            ...fixedDepositAccount,
            submittedOnDate:
              fixedDepositAccount.submittedOnDate &&
              (dayjs(fixedDepositAccount.submittedOnDate) as unknown as string),
            currencyCode: fixedDepositAccount.savingsProduct.currencyCode,
            interestPostingPeriodTypeEnum:
              fixedDepositAccount.interestPostingPeriodEnum,
            interestCompoundingPeriodEnum:
              fixedDepositAccount.interestCompoundingPeriodEnum,
            depositAmount:
              fixedDepositAccount.depositAccountTermAndPreClosure.depositAmount,
            depositPeriod:
              fixedDepositAccount.depositAccountTermAndPreClosure.depositPeriod,
            depositPeriodFrequencyEnum:
              fixedDepositAccount.depositAccountTermAndPreClosure
                .depositPeriodFrequencyEnum,
            transferInterestToLinkedAccount:
              fixedDepositAccount.depositAccountTermAndPreClosure
                .transferInterestToLinkedAccount,
            savingsAccountCharges: fixedDepositAccount.savingsAccountCharges,
            savingsAccountInterestRateCharts:
              fixedDepositAccount.savingsAccountInterestRateCharts,
          });
        }
      );
    }
  }, [submitType, fixedDepositAccountId]);

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
            id={fixedDepositAccountId}
            selectedDepositProduct={selectedDepositProduct}
            setSelectedDepositProduct={setSelectedDepositProduct}
            showFixedDepositProduct={showFixedDepositProduct}
            setShowFixedDepositProduct={setShowFixedDepositProduct}
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
            id={fixedDepositAccountId}
            selectedDepositProduct={selectedDepositProduct}
          />
        ),
      },
      {
        title: "Settings",
        content: (
          <SettingsForm
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            submitType={submitType}
            fixedDepositAccountId={fixedDepositAccountId}
            selectedDepositProduct={selectedDepositProduct}
          />
        ),
      },
      {
        title: "Interest Rate Chart",
        content: (
          <InterestRateChartForm
            current={current}
            setCurrent={setCurrent}
            formValues={formValues}
            setFormValues={setFormValues}
            submitType={submitType}
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
            selectedSavingsProduct={selectedDepositProduct}
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
            id={fixedDepositAccountId}
            productName={productName}
            selectedSavingsProduct={selectedDepositProduct}
          />
        ),
      },
    ],
    [
      current,
      formValues,
      selectedDepositProduct,
      showFixedDepositProduct,
      submitType,
      fixedDepositAccountId,
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
