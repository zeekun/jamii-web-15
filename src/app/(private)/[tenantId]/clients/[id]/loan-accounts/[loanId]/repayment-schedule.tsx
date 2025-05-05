import { Loan, LoanRepaymentSchedule } from "@/types";
import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import DataTable from "./repayment-schedule.data-table";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import RepaymentForm from "../../components/loans/repayment.form";
import { Button, Modal } from "antd";
import { roundToSixDecimalPlaces } from "@/utils/numbers";
import { PlusOutlined } from "@ant-design/icons";

export default function RepaymentSchedule(props: {
  loanId: string;
  loan: Loan | undefined;
  balancesOfLoan: number[];
  setBalancesOfLoan: any;
}) {
  const { tenantId } = useParams();
  const { loanId, loan, balancesOfLoan, setBalancesOfLoan } = props;

  const [paymentAmountId, setPaymentAmountId] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const {
    status,
    data: repaymentSchedules,
    error,
  } = useGet<LoanRepaymentSchedule[]>(
    `${tenantId}/loan-repayment-schedules?filter={"where":{"loanId":${loanId}},"order":["installment ASC"]}`,
    [`${tenantId}/loan-repayment-schedules-${loanId}`]
  );

  useEffect(() => {
    if (
      status === "success" &&
      repaymentSchedules &&
      repaymentSchedules.length > 0
    ) {
      // Find the first repayment schedule with an outstanding balance
      const repaymentScheduleWithOutstanding = repaymentSchedules.find(
        (repaymentSchedule) => {
          // Calculate the total outstanding amount
          let outstanding = roundToSixDecimalPlaces(
            repaymentSchedule.principalAmount +
              repaymentSchedule.interestAmount +
              (repaymentSchedule.feeChargesAmount || 0) +
              (repaymentSchedule.penaltyChargesAmount || 0)
          );

          // Subtract any payments made in advance or late
          if (repaymentSchedule.totalPaidInAdvanceDerived) {
            outstanding = roundToSixDecimalPlaces(
              outstanding - repaymentSchedule.totalPaidInAdvanceDerived
            );
          }

          if (repaymentSchedule.totalPaidLateDerived) {
            outstanding = roundToSixDecimalPlaces(
              outstanding - repaymentSchedule.totalPaidLateDerived
            );
          }

          // Check if the outstanding balance is greater than 0
          return outstanding > 0;
        }
      );

      if (repaymentScheduleWithOutstanding) {
        // Calculate the total outstanding amount again to ensure accuracy
        let outstanding = roundToSixDecimalPlaces(
          repaymentScheduleWithOutstanding.principalAmount +
            repaymentScheduleWithOutstanding.interestAmount +
            (repaymentScheduleWithOutstanding.feeChargesAmount || 0) +
            (repaymentScheduleWithOutstanding.penaltyChargesAmount || 0)
        );

        // Subtract any payments made in advance or late
        outstanding = roundToSixDecimalPlaces(
          outstanding -
            ((repaymentScheduleWithOutstanding.totalPaidInAdvanceDerived || 0) +
              (repaymentScheduleWithOutstanding.totalPaidLateDerived || 0))
        );

        // Set the payment amount and ID
        setPaymentAmount(outstanding);
        setPaymentAmountId(Number(repaymentScheduleWithOutstanding.id));
      } else {
        console.log("No outstanding balance found.");
        // If no outstanding balance, set paymentAmount to 0
        setPaymentAmount(0);
        setPaymentAmountId(0);
      }
    }
  }, [status, repaymentSchedules]);

  // Use useMemo to prevent unnecessary recomputation
  const modifiedRepaymentSchedules = useMemo(() => {
    if (!repaymentSchedules) return [];

    // Check if the first element is already the one you intend to unshift
    if (
      repaymentSchedules.length > 0 &&
      repaymentSchedules[0].installment === 0
    ) {
      return repaymentSchedules;
    }

    return [
      {
        installment: 0,
        interestAmount: 0,
        principalAmount: loan?.principalDisbursedDerived,
        disbursementOn: loan?.disbursementOn,
        loanId: loanId,
        dueDate: "",
        disburseDate:
          loan?.loanStatusEnum === "APPROVED"
            ? loan.expectedDisbursedOnDate
            : loan?.disbursedOnDate,
      },
      ...repaymentSchedules,
    ];
  }, [repaymentSchedules, loanId]);

  return (
    <>
      {status === "error" ? (
        <Alert_ message={"Error"} description={error?.message} type={"error"} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <b>Payment Strategy: </b>
              {loan?.loanTransactionProcessingStrategy?.name}
            </div>
            {(loan?.loanStatusEnum === "ACTIVE" ||
              loan?.loanStatusEnum === "OVERDUE" ||
              loan?.loanStatusEnum === "OVERDUE NPA") &&
              paymentAmount > 0 && (
                <>
                  <Button
                    type="primary"
                    className="text-r"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                  >
                    Make Payment
                  </Button>

                  <Modal
                    title=" Make Payment"
                    open={isModalOpen}
                    footer={false}
                    onOk={handleOk}
                    onCancel={handleCancel}
                  >
                    <RepaymentForm
                      loan={loan as Loan}
                      paymentAmount={paymentAmount}
                      repaymentScheduleId={paymentAmountId}
                    />
                  </Modal>
                </>
              )}
          </div>

          <DataTable
            data={modifiedRepaymentSchedules}
            loan={loan}
            balancesOfLoan={balancesOfLoan}
            setBalancesOfLoan={setBalancesOfLoan}
          />
        </>
      )}
    </>
  );
}
