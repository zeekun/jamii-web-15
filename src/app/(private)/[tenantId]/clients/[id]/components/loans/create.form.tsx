import { Form, Steps } from "antd";
import React, { useEffect, useState } from "react";
import ChargesForm from "./charges.form";

import DetailsForm from "./details.form";
import TermsForm from "./terms.form";
import { Client, Group, Loan, LoanProduct, SubmitType } from "@/types";
import { get, useGetById } from "@/api";
import Alert_ from "@/components/alert";
import Loading from "@/components/loading";
import RepaymentSchedule from "./repayment-schedule";
import Review from "./review";
import { useParams } from "next/navigation";
import { ENDPOINT } from "./constants";
import dayjs from "dayjs";

export default function CreateForm(props: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  client?: Client | Group;
  submitType?: SubmitType;
  loanId?: number;
  jlg?: boolean;
  groupId?: number;
}) {
  const [createForm] = Form.useForm();
  const { tenantId } = useParams();
  const {
    client,
    submitType = "create",
    loanId,
    setIsModalOpen,
    jlg,
    groupId,
  } = props;

  const [current, setCurrent] = useState(0);
  const [formValues, setFormValues] = useState<Partial<Loan>>({
    ...(client
      ? jlg
        ? { clientId: client.id, groupId }
        : "legalFormEnum" in client
        ? { clientId: client.id }
        : { groupId }
      : {}),
    loanTypeEnum: jlg
      ? "GROUP LOAN"
      : client && "legalFormEnum" in client && client.legalFormEnum === "PERSON"
      ? "INDIVIDUAL LOAN"
      : "GROUP LOAN",
  });

  const [selectLabels, setSelectLabels] = useState<Partial<Loan>>({});
  const [isSelectedLoanProduct, setIsSelectedLoanProduct] = useState(false);
  const [selectedLoanProduct, setSelectedLoanProduct] = useState<
    Partial<LoanProduct>
  >({});
  const [showLoanProduct, setShowLoanProduct] = useState(false);
  const [overdueChargesOptionsData, setOverdueChargesOptionsData] = useState<
    number[]
  >([]);
  const [productName, setProductName] = useState<string>();

  const onStepChange = (value: number) => {
    // Get the current form values
    const values = createForm.getFieldsValue();
    setFormValues({ ...selectedLoanProduct, ...formValues, ...values });
    setCurrent(value);
  };

  const {
    status: loanStatus,
    data: loan,
    error: loanError,
  } = useGetById<Partial<Loan>>(`${tenantId}/${ENDPOINT}`, loanId, undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  // useEffect(() => {
  //   if (submitType === "update" && loanStatus === "success" && loan) {
  //     let chargesOptions: any = [];
  //     let overdueChargesOptions: any = [];
  //     loan.charges?.forEach((charge) => {
  //       if (charge.chargeTimeTypeEnum !== "OVERDUE FEE") {
  //         chargesOptions.push(charge.id);
  //       }
  //       if (charge.chargeTimeTypeEnum === "OVERDUE FEE") {
  //         overdueChargesOptions.push(charge.id);
  //       }
  //     });

  //     setProductName(loan.loanProduct?.name);

  //     setOverdueChargesOptionsData(overdueChargesOptions);

  //     setFormValues({
  //       ...loan,
  //       submittedOnDate:
  //         loan.submittedOnDate &&
  //         (dayjs(loan.submittedOnDate) as unknown as string),
  //       disbursementOn:
  //         loan.disbursementOn &&
  //         (dayjs(loan.disbursementOn) as unknown as string),
  //     });
  //   }
  // }, [submitType, loanStatus, loan, id]);

  useEffect(() => {
    if (submitType === "update" && loanId) {
      get(`${tenantId}/loans/${loanId}`).then((res) => {
        const loan: Loan = res.data;

        setProductName(loan.loanProduct.name);

        setFormValues({
          ...formValues,
          ...loan,
          submittedOnDate:
            loan.submittedOnDate &&
            (dayjs(loan.submittedOnDate) as unknown as string),
          expectedDisbursedOnDate:
            loan.expectedDisbursedOnDate &&
            (dayjs(loan.expectedDisbursedOnDate) as unknown as string),
        });
      });
    }
  }, [submitType, loanId]);

  const steps = [
    {
      title: "Details",
      content: (
        <DetailsForm
          form={createForm}
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
          submitType={submitType}
          id={loanId}
          selectedLoanProduct={selectedLoanProduct}
          setSelectedLoanProduct={setSelectedLoanProduct}
          showLoanProduct={showLoanProduct}
          setShowLoanProduct={setShowLoanProduct}
        />
      ),
    },
    {
      title: "Terms",
      content: (
        <TermsForm
          form={createForm}
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
          selectedLoanProduct={selectedLoanProduct}
          submitType={submitType}
          id={loanId}
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
          id={loanId}
          selectedLoanProduct={selectedLoanProduct}
        />
      ),
    },
    {
      title: "Repayment Schedule",
      content: (
        <RepaymentSchedule
          current={current}
          setCurrent={setCurrent}
          formValues={formValues}
          setFormValues={setFormValues}
          submitType={submitType}
          id={loanId}
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
          id={loanId}
          productName={productName}
          selectedLoanProduct={selectedLoanProduct}
        />
      ),
    },
  ];

  if (!formValues.expectedDisbursedOnDate) {
    steps.splice(3, 1);
  }

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <>
      {loanStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={loanError.message}
          type={"error"}
        />
      ) : loanStatus === "pending" ? (
        <Loading />
      ) : (
        <>
          <Steps current={current} items={items} />
          <div className="mt-5">{steps[current].content}</div>
        </>
      )}
    </>
  );
}
