"use client";
import React, { useEffect, useState } from "react";
import { useDelete, useDeleteV2, useGet, usePatchV2 } from "@/api";
import {
  SavingsAccount,
  SavingsAccountCharge,
  SavingsAccountTransaction,
} from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { formattedDate } from "@/utils/dates";
import { Popconfirm, Typography } from "antd";
import { formatNumber } from "@/utils/numbers";
import MyButton from "@/components/my-button";
import { CheckOutlined, FlagFilled, UndoOutlined } from "@ant-design/icons";
import toast from "@/utils/toast";
import NotFound from "@/app/not-found";
import _ from "lodash";
import CreateModal from "@/components/create.modal";
import PayChargeForm from "./pay-charge.form";
import dayjs from "dayjs";
const { Title } = Typography;

export default function Page() {
  const { tenantId, id, chargeId, savingId } = useParams();
  const [isPayChargeModalOpen, setIsPayChargeModalOpen] = useState(false);
  const [isWaiveChargeModalOpen, setIsWaiveChargeModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const router = useRouter();
  const [saving, setSaving] = useState<SavingsAccount>();

  const {
    status: chargeStatus,
    data: charge,
    error: chargeError,
  } = useGet<SavingsAccountCharge>(
    `${tenantId}/savings-account-charges/${chargeId}`,
    [`${tenantId}/savings-account-charges/${chargeId}`]
  );

  useEffect(() => {
    if (chargeStatus === "success") {
      setSaving(charge.savingsAccount);
      charge.chargeTimeEnum;
    }
  }, [chargeStatus]);

  const { mutate: waiveCharge } = usePatchV2(
    `${tenantId}/savings-account-charges`,
    Number(savingId),
    [
      `${tenantId}/savings-accounts`,
      `${savingId}`,
      `${tenantId}/savings-account-charges?filter={"where":{"savingsAccountId":${savingId}},"order":["id DESC"]}`,
      `${tenantId}/savings-account-charges/${chargeId}`,
    ]
  );

  if (isNaN(Number(chargeId))) {
    return <NotFound />;
  }

  if (chargeStatus === "error") {
    return (
      <Alert_ message={"Error"} description={chargeError} type={"error"} />
    );
  }

  if (chargeStatus === "pending") {
    return <Loading />;
  }

  const handleUndoOk = () => {
    setConfirmLoading(true);

    let updatedValues = {
      savingsAccount: {
        clientId: id,
      },
      transaction: {
        amount: charge.amountOutstandingDerived,
        transactionTypeEnum: "WAIVE CHARGE",
        transactionDate: dayjs(),
        isReversed: false,
        officeId: id,
        chargeId,
      },
    };

    waiveCharge(
      { id: savingId, ...updatedValues },
      {
        onSuccess: () => {
          setIsWaiveChargeModalOpen(false);
          setConfirmLoading(false);
          toast({
            type: "success",
            response: `Transaction reversed successfully.`,
          });
          router.push(
            `/${tenantId}/clients/${id}/savings-accounts/${savingId}/charges`
          );
        },
        onError(error, variables, context) {
          setConfirmLoading(false);
          toast({
            type: "error",
            response: error,
          });
        },
      }
    );
  };

  if (chargeStatus === "success" && charge) {
    return (
      <>
        <div className="flex justify-between">
          <Title level={4}>Charge</Title>

          <span className="flex justify-between gap-3">
            {charge.chargeTimeEnum !== "WITHDRAWAL FEE" &&
              charge.chargeTimeEnum !== "SAVINGS ACTIVATION" && (
                <>
                  <CreateModal
                    pageTitle={"Pay Charge"}
                    buttonTitle={"Pay Charge"}
                    isModalOpen={isPayChargeModalOpen}
                    setIsModalOpen={setIsPayChargeModalOpen}
                    icon={<CheckOutlined />}
                    submitType="create"
                    CreateForm={
                      <PayChargeForm
                        saving={saving as SavingsAccount}
                        setIsModalOpen={setIsPayChargeModalOpen}
                        charge={charge}
                      />
                    }
                  />

                  <Popconfirm
                    title={`This charge will be waived.`}
                    placement="bottomLeft"
                    open={isWaiveChargeModalOpen}
                    onConfirm={handleUndoOk}
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={() => {
                      setIsWaiveChargeModalOpen(false);
                    }}
                  >
                    <MyButton
                      type={"danger"}
                      onClick={() => {
                        setIsWaiveChargeModalOpen(true);
                      }}
                      icon={<FlagFilled />}
                    >
                      Waive Charge
                    </MyButton>
                  </Popconfirm>
                </>
              )}
          </span>
        </div>

        <div className=" w-full">
          <table className="text-md text-left w-full border-solid border-[1px] mt-3 border-gray-200 capitalize">
            <tr className="text-lg">
              <th className="w-[10rem]">Name:</th>
              <td>{charge.charge.name}</td>
            </tr>
            <tr>
              <th>Charge Type:</th>
              <td>{charge.charge.isPenalty ? "Penalty" : "Fees"}</td>
            </tr>
            <tr>
              <th>Currency:</th>
              <td>{charge.charge.currencyId}</td>
            </tr>

            <tr>
              <th>Payment Due At:</th>
              <td>{_.toLower(charge.chargeTimeEnum)}</td>
            </tr>

            <tr>
              <th>Payment Due as Of:</th>
              <td>
                {charge.chargeDueDate
                  ? formattedDate(charge.chargeDueDate)
                  : "Not Available"}
              </td>
            </tr>
            <tr>
              <th>Calculation Type:</th>
              <td>{_.toLower(charge.chargeCalculationEnum)}</td>
            </tr>
            <tr>
              <th>Due:</th>
              <td>
                {charge.charge.currencyId} {formatNumber(charge.amount, 2)}
              </td>
            </tr>
            <tr>
              <th>Paid:</th>
              <td>
                {charge.charge.currencyId}{" "}
                {formatNumber(charge.amountPaidDerived, 2)}
              </td>
            </tr>
            <tr>
              <th>Waived:</th>
              <td>
                {charge.charge.currencyId}{" "}
                {formatNumber(charge.amountWaivedDerived, 2)}
              </td>
            </tr>
            <tr>
              <th>Outstanding:</th>
              <td>
                {charge.charge.currencyId}{" "}
                {formatNumber(charge.amountOutstandingDerived, 2)}
              </td>
            </tr>
          </table>
        </div>
      </>
    );
  }

  return null;
}
