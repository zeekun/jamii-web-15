"use client";
import { useCreate, usePatch } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { DatePicker, Form, InputNumber } from "antd";
import { SetStateAction, useState } from "react";
import { ENDPOINT, PAGE_TITLE } from "./constants";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/dates";
import { Loan } from "@/types";
import toast from "@/utils/toast";
import { useParams } from "next/navigation";

export default function ApproveForm(props: {
  id?: number;
  setIsModalOpen: React.Dispatch<SetStateAction<boolean>>;
  expectedDisbursedOnDate: string | undefined;
  clientId: number | undefined;
  loan: Loan | undefined;
  undoApproval?: boolean;
  page?: "CLIENT" | "LOAN ACCOUNT";
}) {
  const { tenantId } = useParams();
  const {
    setIsModalOpen,
    id,
    expectedDisbursedOnDate,
    clientId,
    loan,
    undoApproval = false,
    page,
  } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);

  let qk = [
    `${tenantId}/clients/${clientId}/loans?filter={"where":{"loanStatusEnum":{"neq":"REJECTED"}}}`,
  ];

  if (page === "LOAN ACCOUNT") {
    qk = [`${tenantId}/loans`, `${id}`];
  }

  const { mutate: approveLoan } = usePatch(`${tenantId}/${ENDPOINT}`, id, qk);
  const { mutate: createLoanRepaymentSchedule } = useCreate(
    `${tenantId}/loan-repayment-schedules`,
    qk
  );

  const onReset = () => {
    form.resetFields();
  };

  function onFinish(values: any) {
    setSubmitLoader(true);
    const commonFields = {
      approvedOnDate: `${dayjs(values.approvedOnDate).format("YYYY-MM-DD")}`,
      approvedPrincipal: values.approvedPrincipal,
      submittedOnDate: loan?.submittedOnDate,
      expectedDisbursedOnDate:
        `${dayjs(values.expectedDisbursedOnDate).format("YYYY-MM-DD")}` ||
        loan?.expectedDisbursedOnDate,
      expectedMaturedOnDate: loan?.expectedMaturedOnDate,
      maturedOnDate: loan?.maturedOnDate,
      currencyCode: loan?.currencyCode,
      loanProductId: loan?.loanProductId,
      loanTransactionProcessingStrategyId:
        loan?.loanTransactionProcessingStrategyId,
    };

    let updatedValues = {
      loan: {
        ...commonFields,
        loanStatusEnum: undoApproval
          ? "SUBMITTED AND AWAITING APPROVAL"
          : "APPROVED",
        ...(undoApproval && {
          approvedPrincipal: 0,
          approvedOnDate: null,
          expectedMaturedOnDate: null,
          maturedOnDate: null,
          principalDisbursedDerived: 0,
        }),
      },
    };

    approveLoan(
      { id, ...updatedValues },
      {
        onSuccess: () => {
          setSubmitLoader(false);
          if (undoApproval === false) {
            createLoanRepaymentSchedule(
              {
                nominalInterestRatePerPeriod:
                  loan?.nominalInterestRatePerPeriod,
                principalAmount: values.approvedPrincipal,
                loanId: loan?.id,
                termFrequency: loan?.termFrequency,
                expectedDisbursedOnDate: values.expectedDisbursedOnDate,
                amortizationTypeEnum: loan?.amortizationTypeEnum,
                interestTypeEnum: loan?.interestTypeEnum,
                numberOfRepayments: loan?.numberOfRepayments,
                transactionTypeEnum: "APPROVE_TRANSFER",
                interestPeriodFrequencyEnum:
                  loan?.interestRateFrequencyTypeEnum,
              },
              {
                onSuccess: () => {
                  setSubmitLoader(false);
                },
                onError(error, variables, context) {
                  setSubmitLoader(false);
                },
              }
            );
          }
          if (undoApproval === false) {
            toast({ type: "success", response: "Loan successfully approved" });
          } else {
            toast({
              type: "success",
              response: "Loan Approval successfully undone",
            });
          }
          setIsModalOpen(false);
        },
        onError(error, variables, context) {
          setSubmitLoader(false);
          toast({ type: "error", response: error });
        },
      }
    );
  }

  return (
    <Form
      layout="vertical"
      form={form}
      name={PAGE_TITLE}
      onFinish={onFinish}
      className="grid grid-cols-2 gap-2"
    >
      {!undoApproval && (
        <>
          {" "}
          <Form.Item
            className="col-span-2"
            name="approvedOnDate"
            label="Approved On Date"
            rules={[
              { required: true, message: "Approved On Date is required!" },
            ]}
          >
            <DatePicker
              className="w-full"
              maxDate={dayjs()}
              format={dateFormat}
            />
          </Form.Item>
          <Form.Item
            className="col-span-2"
            name="expectedDisbursedOnDate"
            label="Expected Disbursement On Date"
            initialValue={dayjs(expectedDisbursedOnDate)}
          >
            <DatePicker className="w-full" format={dateFormat} />
          </Form.Item>
          <Form.Item
            className="col-span-2"
            name="approvedPrincipal"
            label="Approved Amount"
            rules={[
              {
                required: true,
                message: "Approved Amount is required!",
              },
            ]}
            initialValue={loan?.principalAmount}
          >
            <InputNumber
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              max={loan?.maxPrincipalAmount}
              min={loan?.minPrincipalAmount}
            />
          </Form.Item>
        </>
      )}

      <div className="col-span-2">
        <FormSubmitButtons submitLoader={submitLoader} onReset={onReset} />
      </div>
    </Form>
  );
}
