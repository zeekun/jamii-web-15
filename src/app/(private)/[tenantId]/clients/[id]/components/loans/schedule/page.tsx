"use client";
import LoanRepaymentScheduleTable from "./table";

export default function Page() {
  return (
    <LoanRepaymentScheduleTable
      principalAmount={500000000}
      amortizationTypeEnum="EQUAL INSTALLMENTS"
      interestTypeEnum="FLAT"
      interestRateFrequencyTypeEnum="PER YEAR"
      interestRate={25}
      disbursedDate="2024-01-01"
      numberOfPayments={36}
      repaymentFrequencyTypeEnum="MONTHS"
      isEqualAmortization={false}
    />
  );
}
