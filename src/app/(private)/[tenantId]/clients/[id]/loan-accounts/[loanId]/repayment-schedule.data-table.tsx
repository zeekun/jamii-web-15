"use client";
import type { TableProps } from "antd";
import { Table } from "antd";
import { Loan, LoanRepaymentSchedule } from "@/types";
import dayjs from "dayjs";
import { formatNumber } from "@/utils/numbers";
import { daysBetweenDates, formattedDate } from "@/utils/dates";
import Decimal from "decimal.js";
import { useMemo } from "react";

export default function DataTable(props: {
  data: any;
  loan?: Loan;
  balancesOfLoan: number[];
  setBalancesOfLoan: any;
}) {
  let { data, loan } = props;

  // Provide default values if any of these are undefined
  const validInterestRate = loan?.nominalInterestRatePerPeriod ?? 0;
  const validTotalRepayments = loan?.numberOfRepayments ?? 1; // Avoid division by zero
  const validLoanAmount =
    loan?.principalDisbursedDerived || (loan?.approvedPrincipal as number);

  let monthlyInterestRate = new Decimal(validInterestRate).div(100).div(12);

  // Calculate EMI
  const EMI = useMemo(() => {
    const numerator = monthlyInterestRate
      .mul(new Decimal(1).plus(monthlyInterestRate).pow(validTotalRepayments))
      .mul(validLoanAmount);
    const denominator = new Decimal(1)
      .plus(monthlyInterestRate)
      .pow(validTotalRepayments)
      .minus(1);
    return numerator.div(denominator);
  }, [monthlyInterestRate, validTotalRepayments, validLoanAmount]);

  // Calculate balance after each installment
  let currentBalance = new Decimal(validLoanAmount);

  const repaymentFrequencyTypeEnum = loan?.repaymentFrequencyTypeEnum as
    | "days"
    | "weeks"
    | "month"
    | "year";

  const columns: TableProps<LoanRepaymentSchedule>["columns"] = [
    {
      title: "#",
      dataIndex: "installment",
      key: "installment",
      render: (text) => (text !== 0 ? text : ""),
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
      render: (_, record, index) => {
        if (index === 0) return "";
        const previousDate =
          index === 1
            ? dayjs(
                loan?.loanStatusEnum === "APPROVED"
                  ? dayjs(data[1].dueDate).subtract(
                      1,
                      repaymentFrequencyTypeEnum
                    )
                  : loan?.disbursedOnDate
              ).format(`YYYY-MM-DD`)
            : dayjs(data[index - 1].dueDate).format(`YYYY-MM-DD`);

        const currentDate = dayjs(record.dueDate).format(`YYYY-MM-DD`);

        return daysBetweenDates(previousDate, currentDate);
      },
    },
    {
      title: "Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (_, record, index) => {
        if (index === 0) {
          return loan?.loanStatusEnum === "APPROVED"
            ? formattedDate(loan.expectedDisbursedOnDate)
            : formattedDate(loan?.disbursedOnDate as string);
        } else {
          return loan?.loanStatusEnum === "APPROVED"
            ? formattedDate(
                dayjs(loan.expectedDisbursedOnDate)
                  .add(index, repaymentFrequencyTypeEnum)
                  .format()
              )
            : formattedDate(_);
        }
      },
    },
    {
      title: "Paid Date",
      dataIndex: "obligationsMetOnDate",
      key: "obligationsMetOnDate",
      render: (text) => (text ? formattedDate(text) : ""),
    },
    {
      title: <span className="flex justify-end">Balance Of Loan</span>,
      dataIndex: "balanceOfLoan",
      key: "balanceOfLoan",
      render: (_, record, index) => {
        // Update current balance after the first installment
        if (index > 0) {
          const interestAmount = currentBalance.mul(monthlyInterestRate);
          const principalAmount = EMI.minus(interestAmount);
          currentBalance = currentBalance.minus(principalAmount);
          //setBalancesOfLoan(balancesOfLoan.push(Number(currentBalance)));
        }

        return (
          <span className="flex justify-end">
            {formatNumber(Math.abs(Number(currentBalance)))}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Principal Due</span>,
      dataIndex: "principalAmount",
      key: "principalAmount",
      render: (_, record, i) => (
        <span className="flex justify-end">
          {i > 0 ? formatNumber(_, 2) : ""}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Interest</span>,
      dataIndex: "interestAmount",
      key: "interestAmount",
      render: (_, record, i) => (
        <span className="flex justify-end">
          {i > 0 ? formatNumber(_, 2) : ""}
        </span>
      ),
    },
    {
      title: <span className="flex justify-end">Fees</span>,
      dataIndex: "feeChargesAmount",
      key: "feeChargesAmount",
      render: (text) => (
        <span className="flex justify-end">{formatNumber(text)}</span>
      ),
    },
    {
      title: <span className="flex justify-end">Penalties</span>,
      dataIndex: "penaltyChargesAmount",
      key: "penaltyChargesAmount",
      render: (text) => (
        <span className="flex justify-end">{formatNumber(text)}</span>
      ),
    },
    {
      title: <span className="flex justify-end">Due</span>,
      dataIndex: "due",
      key: "due",
      render: (_, record, i) => {
        if (i === 0) {
          return "";
        }

        return (
          <span className="flex justify-end">
            {i > 0
              ? formatNumber(
                  record.principalAmount +
                    record.interestAmount +
                    (record.penaltyChargesAmount || 0) +
                    (record.feeChargesAmount || 0),
                  2
                )
              : 0}
          </span>
        );
      },
    },
    {
      title: <span className="flex justify-end">Paid</span>,
      dataIndex: "totalPaidInAdvanceDerived",
      key: "totalPaidInAdvanceDerived",
      render: (text, record, i) => {
        const totalPaidInAdvanceDerived = record.totalPaidInAdvanceDerived || 0;
        const totalPaidLateDerived = record.totalPaidLateDerived || 0;
        const paid = totalPaidInAdvanceDerived + totalPaidLateDerived;
        if (i === 0) {
          return "";
        }
        return (
          <span className="flex justify-end">{formatNumber(paid, 2)}</span>
        );
      },
    },
    {
      title: <span className="flex justify-end">In Advance</span>,
      dataIndex: "totalPaidInAdvanceDerived",
      key: "totalPaidInAdvanceDerived",
      render: (text) => (
        <span className="flex justify-end">{formatNumber(text, 2)}</span>
      ),
    },
    {
      title: <span className="flex justify-end">Late</span>,
      dataIndex: "totalPaidLateDerived",
      key: "totalPaidLateDerived",
      render: (text) => (
        <span className="flex justify-end">{formatNumber(text, 2)}</span>
      ),
    },
    {
      title: <span className="flex justify-end">Outstanding</span>,
      dataIndex: "outstanding",
      key: "outstanding",
      render: (_, record, i) => {
        if (i === 0) {
          return (
            <span className="flex justify-end">
              {formatNumber(Math.abs(Number(currentBalance)))}
            </span>
          );
        }
        let outstanding =
          record.principalAmount +
          record.interestAmount +
          (record.penaltyChargesAmount || 0) +
          (record.feeChargesAmount || 0);

        const totalPaidInAdvanceDerived = record.totalPaidInAdvanceDerived || 0;
        const totalPaidLateDerived = record.totalPaidLateDerived || 0;

        outstanding =
          outstanding - (totalPaidInAdvanceDerived + totalPaidLateDerived);

        return (
          <span className="flex justify-end">
            {outstanding < 0 || formatNumber(outstanding, 2) === "0.00"
              ? "0"
              : formatNumber(outstanding, 2)}
          </span>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="repaymentNumber"
      pagination={false}
      summary={(pageData) => {
        let totalPrincipal = 0;
        let totalInterest = 0;
        let totalFees = 0;
        let totalPenalties = 0;
        let totalDue = 0;
        let totalPaid = 0;
        let totalInAdvance = 0;
        let totalLate = 0;
        let totalOutstanding = 0;
        let totalDays = 0;

        pageData.forEach((record, i) => {
          if (i > 0) {
            totalPrincipal += record.principalAmount || 0;

            totalDue +=
              (record.principalAmount || 0) +
              (record.interestAmount || 0) +
              (record.penaltyChargesAmount || 0) +
              (record.feeChargesAmount || 0);

            totalOutstanding +=
              (record.principalAmount || 0) +
              (record.interestAmount || 0) +
              (record.penaltyChargesAmount || 0) +
              (record.feeChargesAmount || 0) -
              ((record.totalPaidInAdvanceDerived || 0) +
                (record.totalPaidLateDerived || 0));

            // Calculate days and sum up
            const previousDate =
              i === 1
                ? dayjs(
                    loan?.loanStatusEnum === "APPROVED"
                      ? dayjs(pageData[1].dueDate).subtract(
                          1,
                          repaymentFrequencyTypeEnum
                        )
                      : loan?.disbursedOnDate
                  ).format(`YYYY-MM-DD`)
                : dayjs(pageData[i - 1].dueDate).format(`YYYY-MM-DD`);

            const currentDate = dayjs(record.dueDate).format(`YYYY-MM-DD`);
            totalDays += daysBetweenDates(previousDate, currentDate);
          }

          totalInterest += record.interestAmount || 0;
          totalFees += record.feeChargesAmount || 0;
          totalPenalties += record.penaltyChargesAmount || 0;

          totalPaid +=
            (record.totalPaidInAdvanceDerived || 0) +
            (record.totalPaidLateDerived || 0);
          totalInAdvance += record.totalPaidInAdvanceDerived || 0;
          totalLate += record.totalPaidLateDerived || 0;
        });

        return (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <b>Total</b>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} colSpan={4}>
              <b>{totalDays}</b>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4}>
              <span className="flex justify-end">
                <b>{formatNumber(totalPrincipal)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} colSpan={1}>
              <span className="flex justify-end">
                <b> {formatNumber(totalInterest)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6}>
              <span className="flex justify-end">
                <b>{formatNumber(totalFees)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7}>
              <span className="flex justify-end">
                <b> {formatNumber(totalPenalties)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={8}>
              <span className="flex justify-end">
                <b> {formatNumber(totalDue)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={9}>
              <span className="flex justify-end">
                <b>{formatNumber(totalPaid)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={10}>
              <span className="flex justify-end">
                <b>{formatNumber(totalInAdvance)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={11}>
              <span className="flex justify-end">
                <b> {formatNumber(totalLate)}</b>
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={12}>
              <span className="flex justify-end">
                <b>{formatNumber(totalOutstanding)}</b>
              </span>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        );
      }}
    />
  );
}
