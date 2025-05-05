import { Steps, theme } from "antd";
import React, { useEffect, useState } from "react";
import AccountingForm from "./accounting.form";
import ChargesForm from "./charges.form";
import DetailsForm from "./details.form";
import SettingsForm from "./settings.form";
import TermsForm from "./terms.form";
import { SavingsProduct, SubmitType } from "@/types";
import { useGetById } from "@/api";
import { ENDPOINT } from "./constants";
import Alert_ from "@/components/alert";
import Loading from "@/components/loading";
import InterestRateChartForm from "./interest-rate-chart.form";
import { useParams } from "next/navigation";
import CurrencyForm from "../components/currency.form";

export default function FixedDepositCreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;

  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [formValues, setFormValues] = useState<Partial<any>>({});

  const {
    status: savingsProductStatus,
    data: savingsProduct,
    error: savingsProductError,
  } = useGetById<SavingsProduct>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "create") {
      setCurrent(0);
    }
  }, [submitType]);

  useEffect(() => {
    if (
      submitType === "update" &&
      savingsProductStatus === "success" &&
      savingsProduct
    ) {
      savingsProduct.interestCalculationTypeEnum.toLowerCase();

      savingsProduct.savingsProductAccountings?.forEach((accounting) => {
        const camelCaseName =
          accounting.name
            .toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
              index === 0 ? match.toLowerCase() : match.toUpperCase()
            )
            .replace(/\s+/g, "") + "Id";

        (savingsProduct as any)[camelCaseName] = accounting.glAccountId;
      });

      setFormValues(savingsProduct);
    }
  }, [submitType, savingsProductStatus, savingsProduct]);

  const steps = [
    {
      title: "Details",
      content: (
        <DetailsForm
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
        />
      ),
    },
    {
      title: "Currency",
      content: (
        <CurrencyForm
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
        />
      ),
    },
    {
      title: "Terms",
      content: (
        <TermsForm
          submitType={submitType}
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
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
        />
      ),
    },
    {
      title: (
        <>
          Interest Rate <br></br>Chart
        </>
      ),
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
          id={id}
        />
      ),
    },
    {
      title: "Accounting",
      content: (
        <AccountingForm
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
          submitType={submitType}
          id={id}
        />
      ),
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    borderRadius: token.borderRadiusLG,
    marginTop: 16,
  };

  return (
    <>
      {savingsProductStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={savingsProductError.message}
          type={"error"}
        />
      ) : savingsProductStatus === "pending" ? (
        <Loading />
      ) : (
        <>
          <Steps current={current} items={items} />
          <div style={contentStyle}>{steps[current].content}</div>
        </>
      )}
    </>
  );
}
