import { Steps, theme } from "antd";
import React, { useEffect, useState } from "react";
import AccountingForm from "./accounting.form";
import ChargesForm from "./charges.form";
import DetailsForm from "./details.form";
import MarketPriceForm from "./market-price.form";
import SettingsForm from "./settings.form";
import TermsForm from "./terms.form";
import { ShareProduct, ShareProductMarketPrice, SubmitType } from "@/types";
import { useGetById } from "@/api";
import { ENDPOINT } from "./constants";
import { useParams } from "next/navigation";
import CurrencyForm from "../components/currency.form";
import Loading from "@/components/loading";
import Alert_ from "@/components/alert";

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;

  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [formValues, setFormValues] = useState<Partial<ShareProduct>>({});
  const [marketPriceData, setMarketPriceData] = useState<
    ShareProductMarketPrice[]
  >([]);

  const {
    status: shareProductStatus,
    data: shareProduct,
    error: shareProductError,
  } = useGetById<ShareProduct>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (
      submitType === "update" &&
      shareProductStatus === "success" &&
      shareProduct
    ) {
      shareProduct.shareProductAccountings?.forEach((accounting) => {
        const camelCaseName =
          accounting.name
            .toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
              index === 0 ? match.toLowerCase() : match.toUpperCase()
            )
            .replace(/\s+/g, "") + "Id";

        (shareProduct as any)[camelCaseName] = accounting.glAccountId;
      });

      if (
        shareProduct.shareProductMarketPrices &&
        shareProduct.shareProductMarketPrices.length > 0
      ) {
        setMarketPriceData(shareProduct.shareProductMarketPrices);
      }
      setFormValues(shareProduct);
    }
  }, [submitType, shareProductStatus, shareProduct]);

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
          multiplesName={"currencyMultiplesOf"}
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
        />
      ),
    },
    {
      title: "Market Price",
      content: (
        <MarketPriceForm
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
          marketPriceData={marketPriceData}
          setMarketPriceData={setMarketPriceData}
        />
      ),
    },
    {
      title: "Charges",
      content: (
        <ChargesForm
          submitType={submitType}
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
        />
      ),
    },

    {
      title: "Accounting",
      content: (
        <AccountingForm
          submitType={submitType}
          id={id}
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
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
      {shareProductStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={shareProductError.message}
          type={"error"}
        />
      ) : shareProductStatus === "pending" ? (
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
