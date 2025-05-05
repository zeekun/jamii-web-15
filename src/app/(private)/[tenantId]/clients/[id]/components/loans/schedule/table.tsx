"use client";

import React, { useMemo } from "react";
import { Table } from "antd";
import { TableProps } from "antd/es/table";
import dayjs from "dayjs";

interface LoanRepaymentScheduleProps {
  principalAmount: number;
  amortizationTypeEnum: "EQUAL INSTALLMENTS" | "EQUAL PRINCIPAL PAYMENTS";
  interestRate: number; // In percentage (e.g., 5 for 5%)
  interestTypeEnum: "FLAT" | "REDUCING BALANCE";
  interestRateFrequencyTypeEnum: "PER YEAR" | "PER MONTH" | "WHOLE TERM";
  disbursedDate: string; // The date when the loan is disbursed
  numberOfPayments: number; // Total number of repayments (12 months for example)
  repaymentFrequencyTypeEnum: "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
  isEqualAmortization: boolean;
  graceOnPrincipal?: boolean;
  graceOnInterest?: boolean;
  graceOnArrearsAgeing?: boolean;
  allowPartialInterestCalculation?: boolean;
}

interface Loan {
  repaymentNumber: number;
  days: number;
  date: string;
  balanceOfLoan: number;
  principalDue: number;
  interest: number;
  fees?: number;
  penalties?: number;
  due: number;
  paid?: number;
  inAdvance?: number;
  late?: number;
  outstanding: number;
}

const LoanRepaymentScheduleTable: React.FC<LoanRepaymentScheduleProps> = ({
  principalAmount,
  amortizationTypeEnum,
  interestRate,
  interestTypeEnum,
  interestRateFrequencyTypeEnum,
  disbursedDate,
  numberOfPayments,
  repaymentFrequencyTypeEnum,
  isEqualAmortization,
  graceOnPrincipal,
  graceOnInterest,
  graceOnArrearsAgeing,
  allowPartialInterestCalculation,
}) => {
  // Flat Interest Calculation
  const calculateFlatInterest = (principal: number, rate: number) => {
    return principal * (rate / 100); // Total interest for the whole term, flat interest
  };

  const calculateSchedule = (): Loan[] => {
    let currentBalance = principalAmount;
    const schedule: Loan[] = [];
    let previousDate = dayjs(disbursedDate);

    // Equal Principal Payments: Principal due for each payment is split evenly
    const principalDue = principalAmount / numberOfPayments;

    // Calculate flat interest for the entire loan period
    const interest =
      interestTypeEnum === "FLAT"
        ? calculateFlatInterest(principalAmount, interestRate)
        : 0;

    // For Grace Periods, if enabled, apply no principal or interest during grace
    const applyGracePeriod = (i: number) => {
      if (i === 1) {
        if (graceOnPrincipal || graceOnInterest) {
          return 0; // No principal or interest for the first grace period
        }
      }
      return 1; // No grace period beyond the first month, assuming grace is on the first repayment only.
    };

    // Calculate total payment per month for Equal Installments
    let equalInstallmentAmount = 0;
    if (amortizationTypeEnum === "EQUAL INSTALLMENTS") {
      const totalInterest = interestTypeEnum === "FLAT" ? interest : 0; // Reducing Balance doesn't need a total interest value here
      equalInstallmentAmount =
        (principalAmount + totalInterest) / numberOfPayments;
    }

    // Generate repayment schedule
    for (let i = 1; i <= numberOfPayments; i++) {
      const dueDate = previousDate
        .add(
          1,
          repaymentFrequencyTypeEnum.toLowerCase() as
            | "day"
            | "week"
            | "month"
            | "year"
        )
        .format("YYYY-MM-DD");

      const daysBetween = dayjs(dueDate).diff(previousDate, "days");

      // Apply Grace on Principal and Interest
      let principalDueForMonth = principalDue;
      let interestDueForMonth = interest;

      if (graceOnPrincipal && i === 1) {
        principalDueForMonth = 0; // No principal due during grace
      }

      if (graceOnInterest && i === 1) {
        interestDueForMonth = 0; // No interest due during grace
      }

      // Adjust principal and interest calculations based on amortization type
      if (amortizationTypeEnum === "EQUAL INSTALLMENTS") {
        // For Equal Installments, the total payment (principal + interest) is the same
        const totalDueForMonth = equalInstallmentAmount;
        interestDueForMonth = totalDueForMonth - principalDueForMonth;
        principalDueForMonth = totalDueForMonth - interestDueForMonth;
      }

      // Reducing Balance: Calculate interest based on the current balance
      if (amortizationTypeEnum === "EQUAL PRINCIPAL PAYMENTS") {
        if (interestTypeEnum === "REDUCING BALANCE") {
          interestDueForMonth = (currentBalance * (interestRate / 100)) / 12; // Interest for this month
        }
      }

      // Total Due is Principal Due + Interest
      const totalDue = principalDueForMonth + interestDueForMonth;

      // Reduce the balance by the principal due after the repayment
      currentBalance -= principalDueForMonth;

      // Creating the schedule for the current period
      schedule.push({
        repaymentNumber: i,
        days: daysBetween,
        date: dueDate,
        balanceOfLoan: parseFloat(currentBalance.toFixed(2)),
        principalDue: parseFloat(principalDueForMonth.toFixed(2)),
        interest: parseFloat(interestDueForMonth.toFixed(2)), // Interest for this installment
        fees: 0,
        penalties: 0,
        due: totalDue,
        paid: 0,
        inAdvance: 0,
        late: 0,
        outstanding: parseFloat(currentBalance.toFixed(2)),
      });

      // Move to the next repayment date
      previousDate = dayjs(dueDate);
    }

    return schedule;
  };

  const dataSource = useMemo(calculateSchedule, [
    principalAmount,
    amortizationTypeEnum,
    interestRate,
    interestTypeEnum,
    interestRateFrequencyTypeEnum,
    disbursedDate,
    numberOfPayments,
    repaymentFrequencyTypeEnum,
    isEqualAmortization,
    graceOnPrincipal,
    graceOnInterest,
    graceOnArrearsAgeing,
    allowPartialInterestCalculation,
  ]);

  const columns: TableProps<Loan>["columns"] = [
    { title: "#", dataIndex: "repaymentNumber", key: "repaymentNumber" },
    { title: "Days", dataIndex: "days", key: "days" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Principal Due",
      dataIndex: "principalDue",
      key: "principalDue",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Balance Of Loan",
      dataIndex: "balanceOfLoan",
      key: "balanceOfLoan",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Interest",
      dataIndex: "interest",
      key: "interest",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Due",
      dataIndex: "due",
      key: "due",
      render: (value) => value.toFixed(2),
    },
    {
      title: "Outstanding",
      dataIndex: "outstanding",
      key: "outstanding",
      render: (value) => value.toFixed(2),
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey="repaymentNumber"
      pagination={false}
      summary={(pageData) => {
        let totalPrincipal = 0;
        let totalInterest = 0;
        let totalDue = 0;

        pageData.forEach(({ principalDue, interest, due }) => {
          totalPrincipal += principalDue;
          totalInterest += interest;
          totalDue += due;
        });

        return (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
            <Table.Summary.Cell index={1} colSpan={4} />
            <Table.Summary.Cell index={2}>
              {totalPrincipal.toFixed(2)}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              {totalInterest.toFixed(2)}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4}>
              {totalDue.toFixed(2)}
            </Table.Summary.Cell>
          </Table.Summary.Row>
        );
      }}
    />
  );
};

export default LoanRepaymentScheduleTable;
