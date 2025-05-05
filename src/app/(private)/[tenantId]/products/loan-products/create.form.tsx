import { Steps, theme } from "antd";
import React, { useEffect, useState } from "react";
import AccountingForm from "./accounting.form";
import ChargesForm from "./charges.form";
import DetailsForm from "./details.form";
import SettingsForm from "./settings.form";
import TermsForm from "./terms.form";
import { LoanProduct, SubmitType } from "@/types";
import { useGetById } from "@/api";
import { ENDPOINT } from "./constants";
import Alert_ from "@/components/alert";
import Loading from "@/components/loading";
import { useParams } from "next/navigation";
import CurrencyForm from "../components/currency.form";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;

  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [formValues, setFormValues] = useState<Partial<LoanProduct>>({});
  const [overdueChargesOptionsData, setOverdueChargesOptionsData] = useState<
    number[]
  >([]);

  const {
    status: loanProductStatus,
    data: loanProduct,
    error: loanProductError,
  } = useGetById<Partial<LoanProduct>>(
    `${tenantId}/${ENDPOINT}`,
    id,
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  useEffect(() => {
    if (
      submitType === "update" &&
      loanProductStatus === "success" &&
      loanProduct
    ) {
      let chargesOptions: any = [];
      let overdueChargesOptions: any = [];
      loanProduct.charges?.forEach((charge) => {
        if (charge.chargeTimeTypeEnum !== "OVERDUE FEE") {
          chargesOptions.push(charge.id);
        }
        if (charge.chargeTimeTypeEnum === "OVERDUE FEE") {
          overdueChargesOptions.push(charge.id);
        }
      });

      setOverdueChargesOptionsData(overdueChargesOptions);

      loanProduct.loanProductAccountings?.forEach((accounting) => {
        const camelCaseName =
          accounting.name
            .toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
              index === 0 ? match.toLowerCase() : match.toUpperCase()
            )
            .replace(/\s+/g, "") + "Id";

        (loanProduct as any)[camelCaseName] = accounting.glAccountId;
      });

      setFormValues(loanProduct);
    }
  }, [submitType, loanProductStatus, loanProduct]);

  const steps = [
    {
      title: "Details",
      content: (
        <DetailsForm
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
      title: "Settings",
      content: (
        <SettingsForm
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
      title: "Terms",
      content: (
        <TermsForm
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
          setIsModalOpen={setIsModalOpen}
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
      {loanProductStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={loanProductError.message}
          type={"error"}
        />
      ) : loanProductStatus === "pending" ? (
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
