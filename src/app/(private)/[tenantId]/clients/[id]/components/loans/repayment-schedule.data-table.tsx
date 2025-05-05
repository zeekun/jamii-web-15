import React, { useState } from "react";
import Big from "big.js";
import { Loan, ScheduleRow } from "@/types";
import { Button } from "antd";
import dayjs from "dayjs";
import "./css/index.css";
import { formattedDate } from "@/utils/dates";
import { get } from "@/api";
import { useParams } from "next/navigation";

export default function RepaymentScheduleDataTable(props: {
  formValues: Partial<Loan>;
}) {
  const { tenantId } = useParams();
  const { formValues } = props;
  const [loanAmount, setLoanAmount] = useState<string>(
    String(formValues.principalAmount)
  );
  const [annualRate, setAnnualRate] = useState<string>(
    String(formValues.nominalInterestRatePerPeriod)
  );
  const [termYears, setTermYears] = useState<string>(() => {
    let years: Big;

    switch (formValues.termPeriodFrequencyEnum) {
      case "DAYS":
        let days;
        if (formValues.daysInYearTypeEnum === "ACTUAL") {
          days = 365;
        } else if (formValues.daysInYearTypeEnum === "360 DAYS") {
          days = 360;
        } else if (formValues.daysInYearTypeEnum === "364 DAYS") {
          days = 364;
        } else if (formValues.daysInYearTypeEnum === "365 DAYS") {
          days = 365;
        }
        years = Big(Number(formValues.termFrequency)).div(Number(days)); // Approximate for yearly conversion
        break;
      case "WEEKS":
        years = Big(Number(formValues.termFrequency)).div(52); // Approximate for yearly conversion
        break;
      case "MONTHS":
        years = Big(Number(formValues.termFrequency)).div(12); // Convert months to years
        break;
      case "YEARS":
        years = Big(Number(formValues.termFrequency)); // Already in years
        break;
      default:
        throw new Error("Invalid termPeriodFrequencyEnum value");
    }

    return years.toString(); // Convert Big to string for use as state
  });

  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [totals, setTotals] = useState<{
    totalPayment: string | Big;
    totalPrincipal: string;
    totalInterest: string;
    totalDaysBetween: number;
  }>({
    totalPayment: "0",
    totalPrincipal: "0",
    totalInterest: "0",
    totalDaysBetween: 0,
  });

  const generateSchedule = async () => {
    const loan = Big(loanAmount);

    const getRate = (
      annualRate: string,
      interestRateFrequencyTypeEnum: string,
      termYears: string
    ): Big => {
      const rate = Big(annualRate).div(100); // Convert percentage to decimal

      switch (interestRateFrequencyTypeEnum) {
        case "PER MONTH":
          return rate; // Already provided as a monthly rate
        case "PER YEAR":
          return rate.div(12); // Convert annual rate to monthly rate
        case "WHOLE TERM":
          const totalMonths = Big(termYears).times(12);
          return rate.div(totalMonths); // Spread rate across the whole term
        default:
          throw new Error("Invalid interestRateFrequencyTypeEnum value");
      }
    };

    const workingDays = await get(`${tenantId}/working-days`);
    const freqString = workingDays.data[0].recurrence;
    const daysArray = freqString
      .split(";")
      .find((part: string) => part.startsWith("BYDAY="))
      .replace("BYDAY=", "")
      .split(",");

    const isWorkingDay = (date: dayjs.Dayjs): boolean => {
      const dayOfWeek = date.format("dd").toUpperCase();
      return daysArray.includes(dayOfWeek);
    };

    const adjustDateToWorkingDay = (
      date: dayjs.Dayjs,
      adjustmentType: string
    ): dayjs.Dayjs => {
      if (isWorkingDay(date)) return date;

      switch (adjustmentType) {
        case "SAME DAY":
          return date;
        case "MOVE TO NEXT WORKING DAY":
          while (!isWorkingDay(date)) {
            date = date.add(1, "day");
          }
          return date;
        case "MOVE TO NEXT REPAYMENT MEETING DAY":
          while (!isWorkingDay(date)) {
            date = date.add(1, "day");
          }
          return date;
        case "MOVE TO PREVIOUS DAY":
          while (!isWorkingDay(date)) {
            date = date.subtract(1, "day");
          }
          return date;
        default:
          throw new Error("Invalid adjustmentType value");
      }
    };

    const rate = getRate(
      annualRate,
      String(formValues.interestRateFrequencyTypeEnum),
      termYears
    );

    const totalPayments = Number(formValues.numberOfRepayments);
    const adjustmentType =
      workingDays.data[0].repaymentReschedulingEnum || "SAME DAY";

    const monthlyPayment =
      formValues.interestTypeEnum === "FLAT"
        ? loan
            .plus(loan.times(rate).times(totalPayments)) // Loan + total interest
            .div(totalPayments)
        : loan
            .times(rate)
            .times(Big(1).plus(rate).pow(totalPayments))
            .div(Big(1).plus(rate).pow(totalPayments).minus(1));

    let balance = loan;
    let totalInterest = Big(0);
    let totalPrincipal = Big(0);
    const newSchedule = [];
    let totalDaysBetween = 0;

    const expectedDisbursedOnDate = dayjs(formValues.expectedDisbursedOnDate);

    for (let i = 1; i <= totalPayments; i++) {
      let currentRepaymentDate = expectedDisbursedOnDate.add(i, "month");
      currentRepaymentDate = adjustDateToWorkingDay(
        currentRepaymentDate,
        adjustmentType
      );

      const daysBetween: number =
        i === 1
          ? currentRepaymentDate.diff(expectedDisbursedOnDate, "days")
          : currentRepaymentDate.diff(newSchedule[i - 2].date, "days");

      let interest: Big;
      let principal: Big;

      if (formValues.interestTypeEnum === "FLAT") {
        // Flat amortization: Interest is fixed
        interest = loan.times(rate);
        principal = Big(monthlyPayment).minus(interest);
      } else {
        // Declining balance: Interest decreases as balance reduces
        interest = balance.times(rate);
        principal = Big(monthlyPayment).minus(interest);
      }

      balance = balance.minus(principal);

      totalInterest = totalInterest.plus(interest);
      totalPrincipal = totalPrincipal.plus(principal);
      totalDaysBetween += daysBetween;

      newSchedule.push({
        month: i,
        date: currentRepaymentDate.format("YYYY-MM-DD"),
        daysBetween,
        payment: monthlyPayment,
        principal,
        interest,
        balance: balance.gt(0) ? balance : "0.00",
      });
    }

    setSchedule(newSchedule);

    setTotals({
      totalPayment: Big(monthlyPayment).times(totalPayments),
      totalPrincipal: totalPrincipal.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalDaysBetween,
    });
  };

  const formatNumber = (number: string) => {
    return parseFloat(number).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  console.log("form values", formValues);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <Button onClick={generateSchedule} type="primary">
        Generate Schedule
      </Button>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th className="tableHeader">#</th>
            <th className="tableHeader">Days</th>
            <th className="tableHeader" style={{ textAlign: "left" }}>
              Date
            </th>
            <th className="tableHeader">Payment</th>
            <th className="tableHeader">Principal</th>
            <th className="tableHeader">Interest</th>
            <th className="tableHeader">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="tableCell"></td>
            <td className="tableCell"></td>
            <td className="tableCell" style={{ textAlign: "left" }}>
              {formattedDate(
                dayjs(formValues.expectedDisbursedOnDate).format("YYYY-MM-DD")
              )}
            </td>
            <td className="tableCell"></td>
            <td className="tableCell"></td>
            <td className="tableCell"></td>
            <td className="tableCell">
              {formatNumber(String(formValues.principalAmount))}
            </td>
          </tr>
          {schedule.map((row, index) => (
            <tr key={row.month}>
              <td className="tableCell">{row.month}</td>
              <td className="tableCell">{row.daysBetween}</td>
              <td className="tableCell" style={{ textAlign: "left" }}>
                {formattedDate(row.date)}
              </td>
              <td className="tableCell">{formatNumber(String(row.payment))}</td>
              <td className="tableCell">
                {formatNumber(String(row.principal))}
              </td>
              <td className="tableCell">
                {formatNumber(String(row.interest))}
              </td>
              <td className="tableCell">{formatNumber(String(row.balance))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th className="tableCell">Total</th>
            <th className="tableCell">{totals.totalDaysBetween}</th>
            <th className="tableCell"></th>
            <th className="tableCell">
              {formatNumber(String(totals.totalPayment))}
            </th>
            <th className="tableCell">
              {formatNumber(String(totals.totalPrincipal))}
            </th>
            <th className="tableCell">
              {formatNumber(String(totals.totalInterest))}
            </th>
            <th className="tableCell"></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
