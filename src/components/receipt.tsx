"use client";
import React from "react";
import DownloadAsPDF from "./DownloadAsPDF";
import _ from "lodash";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";

const Receipt = ({ companyName, transactionData }: any) => {
  const {
    entity,
    depositor,
    type,
    accountNumber,
    receiptId,
    date,
    amount,
    details,
    currency,
  } = transactionData;

  return (
    <DownloadAsPDF filename="example.pdf">
      <div className="border-2 border-solid p-3 mb-3 capitalize">
        <div className="flex justify-between ">
          <div>
            <h2 style={styles.companyName} className="capitalize">
              {companyName}
            </h2>
          </div>
          <div>
            <table className="text-right">
              <tr>
                <th>Date:</th>
                <td>{formattedDate(date)}</td>
              </tr>
              <tr>
                <th>Receipt ID:</th>
                <td>{receiptId}</td>
              </tr>
            </table>
          </div>
        </div>

        <h3 style={styles.receiptTitle}>{_.toLower(type)} Receipt</h3>

        <div className="h-3 bg-green-600 my-5"></div>

        <div className="my-2">
          <b>Received From</b>
          <p>{depositor}</p>
        </div>

        <div className="my-2">
          <b>Account Number</b>
          <p>
            {entity} # {accountNumber}
          </p>
        </div>

        <div className="my-2 text-lg">
          <b> {_.toLower(type)} Details</b>
        </div>

        {renderReceiptContent(currency, details)}

        <div className="flex justify-end">
          <div className="flex text-lg font-bold justify-between bg-green-600 my-3 p-3 text-right text-white w-[20rem]">
            <div>Total Amount</div>{" "}
            <div>
              {currency} {formatNumber(amount)}
            </div>
          </div>
        </div>
      </div>
    </DownloadAsPDF>
  );
};

// Function to render receipt content
const renderReceiptContent = (currency: string, details: any) => {
  return (
    <>
      <div className="w-full font-bold flex justify-between bg-slate-300">
        <div className="w-full text-left p-2">Description</div>
        <div className="w-full text-left py-2">Payment Method</div>
        <div className="w-full text-right p-2">Amount</div>
      </div>
      {details.map((detail: any, index: number) => (
        <div key={index} className="flex justify-between w-full capitalize">
          <div className="w-full pl-2 py-1 mt-2 bg-gray-200">
            {_.toLower(detail.property)}
          </div>
          <div className="w-full mt-2 py-1 bg-gray-200">
            {detail.paymentType ?? ""}
          </div>
          <div className="w-full mt-2 py-1 bg-gray-200 text-right pr-2">
            {currency} {formatNumber(detail.amount)}
          </div>
        </div>
      ))}
    </>
  );
};

// Styles
const styles = {
  receiptContainer: {
    border: "1px solid #e0e0e0",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "400px",
    margin: "20px auto",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  companyName: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center" as const, // Fix: Explicitly set as 'center'
    marginBottom: "10px",
  },
  headerLine: {
    borderBottom: "1px solid #e0e0e0",
    marginBottom: "15px",
  },
  receiptTitle: {
    fontSize: "18px",
    font: "Monaco",
    fontWeight: "bold",
    color: "#555",
    textAlign: "center" as const, // Fix: Explicitly set as 'center'
    marginBottom: "20px",
  },
  detail: {
    fontSize: "14px",
    color: "#666",
    margin: "10px 0",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
};

export default Receipt;
