import FormSubmitButtonsStep from "@/components/form-submit-buttons-step";
import {
  Charge,
  Client,
  Group,
  ShareAccount,
  ShareAccountCharge,
  ShareProduct,
  SubmitType,
} from "@/types";
import toast from "@/utils/toast";
import { Form, Typography } from "antd";
import _ from "lodash";
import { useState } from "react";
import { ENDPOINT, PAGE_TITLE, QUERY_KEY } from "./constants";
import { useCreate, usePatch, usePatchV2 } from "@/api";
import { useParams } from "next/navigation";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";
import "@/components/css/Table.css";

const { Title } = Typography;

export default function Review(props: {
  client?: Client | Group;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  current: number;
  setCurrent: (value: React.SetStateAction<number>) => void;
  formValues: Partial<ShareAccount>;
  submitType: SubmitType;
  selectedShareProduct: Partial<ShareProduct>;
  productName?: string;
  id?: number;
}) {
  const { tenantId, shareId, client } = useParams();
  const {
    setIsModalOpen,
    current,
    setCurrent,
    formValues,
    selectedShareProduct,
    submitType,
    id,
    productName,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  const { mutate: insertShareAccount } = useCreate(
    `${tenantId}/share-accounts`,
    [
      `${tenantId}/clients/${formValues.clientId}/share-accounts?filter={"where":{"statusEnum":{"neq":"CLOSED"}},"order":["accountNo DESC"]}`,
    ]
  );

  const { mutate: updateShareAccount } = usePatchV2(
    `${tenantId}/${ENDPOINT}`,
    id,
    [
      `${tenantId}/share-accounts`,
      `${shareId}`,
      `${tenantId}/share-account-charges?filter={"where":{"shareAccountId":${shareId}},"order":["id DESC"]}`,
    ]
  );

  function onFinish(values: any) {
    setSubmitLoader(true);

    const updatedValues = {
      shareAccount: {
        ...("groupId" in formValues
          ? { groupId: formValues.groupId }
          : { clientId: formValues.clientId }),
        currencyCode: formValues.currencyCode,
        shareProductId: formValues.shareProductId,
        externalId: formValues.externalId,
        statusEnum: "SUBMITTED AND AWAITING APPROVAL",
        submittedDate: formValues.submittedDate,
        savingsAccountId: formValues.savingsAccountId,
        minimumActivePeriodFrequency: formValues.minimumActivePeriodFrequency,
        minimumActivePeriodFrequencyEnum:
          formValues.minimumActivePeriodFrequencyEnum,
        allowDividendsInactiveClients: !formValues.allowDividendsInactiveClients
          ? false
          : formValues.allowDividendsInactiveClients,
        totalPendingShares: formValues.totalPendingShares,
        lockInPeriodFrequency: formValues.lockInPeriodFrequency,
        lockInPeriodFrequencyEnum: formValues.lockInPeriodFrequencyEnum,
      },
      charges: formValues.shareAccountCharges,
      shareProduct: {
        unitPrice: formValues.unitPrice,
      },
    };

    const submitTypeMessage = submitType === "create" ? "created" : "updated";

    if (submitType === "create") {
      insertShareAccount(updatedValues, {
        onSuccess: () => {
          setSubmitLoader(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          setIsModalOpen(false);
        },
        onError(error) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
      });
    } else {
      updateShareAccount(
        { id, ...updatedValues },
        {
          onSuccess: () => {
            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
            setSubmitLoader(false);
            setIsModalOpen(false);
            setCurrent(0);
          },
          onError(error) {
            toast({ type: "error", response: error });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  const onReset = () => {
    form.resetFields();
  };

  return (
    <>
      <div className="pl-2 pt-2 ">
        <Title level={5}>
          <span className="text-blue-700">Details</span>
        </Title>
      </div>
      <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
        <tr>
          <th className="w-1/2">Product</th>
          <td>
            {selectedShareProduct.name && selectedShareProduct.name}
            {productName && productName}
          </td>
        </tr>
        {formValues.submittedDate && (
          <tr>
            <th>Submitted On</th>
            <td>{formattedDate(formValues.submittedDate)}</td>
          </tr>
        )}

        {formValues.externalId && (
          <tr>
            <th>External Id</th>
            <td>{formValues.externalId}</td>
          </tr>
        )}
      </table>
      <div className="pl-2 pt-2 ">
        <Title level={5}>
          <span className="text-blue-700">Terms</span>
        </Title>
      </div>
      <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
        <tr>
          <th className="w-1/2">Currency</th>
          <td>
            {selectedShareProduct.currencyCode ??
              formValues.shareProduct?.currencyCode}
          </td>
        </tr>

        {selectedShareProduct.currencyMultiplesOf && (
          <tr>
            <th>Currency In Multiples Of</th>
            <td>{formatNumber(selectedShareProduct.currencyMultiplesOf)}</td>
          </tr>
        )}
        {formValues.totalPendingShares && (
          <tr>
            <th>Total Number Of Shares</th>
            <td>{formatNumber(formValues.totalPendingShares)}</td>
          </tr>
        )}
        {selectedShareProduct && (
          <tr>
            <th>{`Today's Price`}</th>
            <td>{formatNumber(formValues.unitPrice)}</td>
          </tr>
        )}

        {formValues.minimumActivePeriodFrequency && (
          <tr>
            <th>Minimum Active Period</th>
            <td>
              {formatNumber(formValues.minimumActivePeriodFrequency)}{" "}
              {_.capitalize(formValues.minimumActivePeriodFrequencyEnum)}
            </td>
          </tr>
        )}

        {formValues.lockInPeriodFrequency && (
          <tr>
            <th>Lock-In Period</th>
            <td>
              {formValues.lockInPeriodFrequency}{" "}
              {_.capitalize(formValues.lockInPeriodFrequencyEnum)}
            </td>
          </tr>
        )}

        <tr>
          <th>Allow dividends for inactive clients</th>
          <td>{formValues.allowDividendsInactiveClients ? "True" : "False"}</td>
        </tr>
      </table>
      <div className="pl-2 pt-2 ">
        <Title level={5}>
          <span className="text-blue-700">Charges</span>
        </Title>
      </div>
      <table className="table-auto w-full capitalize text-left border-[1px] mt-2 border-gray-200">
        <tr>
          {["Name", "Type", "Amount", "Collected On"].map((header, index) => (
            <th key={index} className="w-1/4">
              {header}
            </th>
          ))}
        </tr>
        {formValues.shareAccountCharges?.map((charge: ShareAccountCharge) => (
          <tr key={charge.charge.id}>
            <td>{charge.charge.name}</td>
            <td>{charge.charge.chargeCalculationTypeEnum}</td>
            <td>
              {charge.charge.chargeCalculationTypeEnum === "FLAT" &&
                `${charge.charge.currencyId} `}
              {formatNumber(charge.amount, 2)}
              {charge.charge.chargeCalculationTypeEnum !== "FLAT" && ` %`}
            </td>
            <td>{_.toLower(charge.charge.chargeTimeTypeEnum)}</td>
          </tr>
        ))}
      </table>
      <Form
        layout="vertical"
        form={form}
        name={"accountingForm"}
        onFinish={onFinish}
        className="grid grid-cols-2 gap-2 mt-4"
      >
        <div className="col-span-2">
          <FormSubmitButtonsStep
            cancelText="Previous"
            submitLoader={submitLoader}
            onReset={onReset}
            handleCancel={() => {
              setCurrent(current - 1);
            }}
          />
        </div>
      </Form>
    </>
  );
}
