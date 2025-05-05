import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import { ExtendedColumnType, ExtendedTableColumn, MySession } from "@/types";
import _ from "lodash";
import pluralize from "pluralize";
import autoTable from "jspdf-autotable";

// Export types
export type ExportType = "excel" | "print" | "pdf" | "word";

// Common interface for export options
interface ExportOptions<T> {
  type: ExportType;
  data: T[];
  columns: ExtendedTableColumn<T>[];
  tableHeader?: {
    exportFileName?: string;
    [key: string]: unknown;
  };
  activeSession?: MySession | null;
}

// Common function to extract data from the table
function extractTableData<T>(data: T[], columns: ExtendedTableColumn<T>[]) {
  const exportColumns = columns.filter(
    (col): col is ExtendedColumnType<T> =>
      "title" in col && ("dataIndex" in col || "key" in col)
  );

  const extractedData = data.map((item) => {
    const row: Record<string, unknown> = {};
    exportColumns.forEach((col) => {
      if (col.exportValue) {
        row[col.title as string] = col.exportValue(
          col.dataIndex ? item[col.dataIndex as keyof T] : null,
          item
        );
      } else {
        const dataPath = col.dataIndex || col.key;
        if (!dataPath) {
          row[col.title as string] = "";
          return;
        }

        const pathParts = dataPath.toString().split(".");
        let value: unknown = item;

        for (const part of pathParts) {
          if (value && typeof value === "object" && part in value) {
            if (value && typeof value === "object" && part in value) {
              value = (value as Record<string, unknown>)[part];
            } else {
              value = undefined;
              break;
            }
          } else {
            value = undefined;
            break;
          }
        }

        row[col.title as string] = value;
      }
    });
    return row;
  });

  return { extractedData, exportColumns };
}
// Generate a filename based on tableHeader or current date
function generateFilename(
  fileType: string,
  tableHeader?: { exportFileName?: string }
) {
  return tableHeader?.exportFileName
    ? `${tableHeader.exportFileName}.${fileType}`
    : `Data_${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}.${fileType}`;
}

// Excel Export
function exportToExcel<T>(
  data: T[],
  columns: ExtendedTableColumn<T>[],

  tableHeader?: { exportFileName?: string }
) {
  const { extractedData, exportColumns } = extractTableData(data, columns);

  // Create worksheet with bold headers
  const worksheet = XLSX.utils.json_to_sheet(extractedData, {
    header: exportColumns.map((col) =>
      typeof col.title === "string" ? col.title : ""
    ),
  });

  // Add bold styling to headers
  if (worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    // Style the header row (row 0)
    for (let col = range.s.c; col <= range.e.c; ++col) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      if (cell) {
        // Apply bold style
        cell.s = {
          font: {
            bold: true,
          },
          // Optional: add background color
          fill: {
            fgColor: { rgb: "D3D3D3" }, // Light gray background
          },
        };
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, generateFilename("xlsx", tableHeader));
}

// Print Function
export function printData<T>(options: {
  data: T[];
  columns: ExtendedTableColumn<T>[];
  activeSession?: MySession | null;
  tableHeader?: { exportFileName?: string };
}) {
  const { data, tableHeader, columns, activeSession } = options;
  const { extractedData, exportColumns } = extractTableData(data, columns);

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to print the data");
    return;
  }

  // Generate a title for the print page
  const printTitle =
    _.startCase(
      tableHeader?.exportFileName &&
        pluralize(tableHeader?.exportFileName as string)
    ) || "Data Export";

  // Start building HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${printTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        h1 { text-align: center; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${printTitle}</h1>
      <button onclick="window.print();return false;" style="padding: 10px; margin: 10px 0;">Print</button>
      <table>
        <thead>
          <tr>
  `;

  // Add table headers
  exportColumns.forEach((col: ExtendedColumnType<T>) => {
    htmlContent += `<th>${col.title}</th>`;
  });

  htmlContent += `
          </tr>
        </thead>
        <tbody>
  `;

  // Add table data rows
  extractedData.forEach((item) => {
    htmlContent += "<tr>";
    exportColumns.forEach((col) => {
      const title = typeof col.title === "string" ? col.title : "";

      const value = item[title];
      // Convert value to string safely
      const displayValue =
        value !== null && value !== undefined ? String(value) : "";
      htmlContent += `<td>${displayValue}</td>`;
    });
    htmlContent += "</tr>";
  });

  // Complete the HTML document
  htmlContent += `
        </tbody>
      </table>
      <div style="text-align: right; margin-top: 20px; font-size: 12px;">
        Generated By User # ${
          activeSession?.user.userId
        } on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `;

  // Write to the new window and trigger print dialog
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// PDF Export
// PDF Export
function exportToPdf<T>(
  data: T[],
  columns: ExtendedTableColumn<T>[],
  activeSession?: MySession | null,
  tableHeader?: { exportFileName?: string }
) {
  const { extractedData, exportColumns } = extractTableData(data, columns);

  // Create a new PDF document
  const doc = new jsPDF();

  // Add title
  const title = tableHeader?.exportFileName || "Data Export";
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Define table structure
  const headers = exportColumns.map((col) => col.title);
  const rows = extractedData.map((item) =>
    exportColumns.map((col) =>
      item[String(col.title)] !== null && item[String(col.title)] !== undefined
        ? String(item[col.title as string])
        : ""
    )
  );

  // Use the properly typed approach for jsPDF-autotable
  try {
    // Apply autoTable through the imported function
    autoTable(doc, {
      head: [
        headers.filter(
          (header): header is string | number | boolean =>
            typeof header === "string" ||
            typeof header === "number" ||
            typeof header === "boolean"
        ),
      ],
      body: rows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });
  } catch (error) {
    console.error("Error generating PDF table:", error);

    // Fallback to basic table if autoTable fails
    let yPos = 30;
    const cellWidth = 180 / headers.length;

    // Draw headers
    doc.setFillColor(220, 220, 220);
    doc.setDrawColor(0);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    headers.forEach((header, i) => {
      doc.rect(10 + i * cellWidth, yPos, cellWidth, 10, "FD");
      doc.text(String(header), 12 + i * cellWidth, yPos + 6);
    });
    yPos += 10;

    // Draw rows
    doc.setFont("helvetica", "normal");
    rows.forEach((row) => {
      if (yPos > 270) {
        // Add a new page if we're near the bottom
        doc.addPage();
        yPos = 20;
      }

      row.forEach((cell, i) => {
        doc.rect(10 + i * cellWidth, yPos, cellWidth, 10);
        doc.text(String(cell).substring(0, 15), 12 + i * cellWidth, yPos + 6);
      });
      yPos += 10;
    });
  }

  // Add footer with date
  const footerText = `Generated By User # ${
    activeSession?.user.userId
  } on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      footerText,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );
  }

  // Save the PDF
  doc.save(generateFilename("pdf", tableHeader));
}
// Word Export (Using HTML to create a Word-like document)
function exportToWord<T>(
  data: T[],
  columns: ExtendedTableColumn<T>[],

  tableHeader?: { exportFileName?: string }
) {
  const { extractedData, exportColumns } = extractTableData(data, columns);

  // Generate a title for the document
  const docTitle = tableHeader?.exportFileName || "Data Export";

  // Create HTML content for Word
  let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${docTitle}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        /* Word Document Styles */
        @page { size: 21cm 29.7cm; margin: 2cm; }
        body { font-family: 'Calibri', sans-serif; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 12pt; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
        th, td { border: 1pt solid #ddd; padding: 4pt; }
        h1 { text-align: center; font-size: 14pt; }
      </style>
    </head>
    <body>
      <h1>${docTitle}</h1>
      <table>
        <thead>
          <tr>
  `;

  // Add table headers
  exportColumns.forEach((col: ExtendedColumnType<T>) => {
    htmlContent += `<th>${col.title}</th>`;
  });

  htmlContent += `
          </tr>
        </thead>
        <tbody>
  `;

  // Add table data rows
  extractedData.forEach((item) => {
    htmlContent += "<tr>";
    exportColumns.forEach((col) => {
      const title = typeof col.title === "string" ? col.title : "";

      const value = item[title];
      // Convert value to string safely
      const displayValue =
        value !== null && value !== undefined ? String(value) : "";
      htmlContent += `<td>${displayValue}</td>`;
    });
    htmlContent += "</tr>";
  });

  // Complete the HTML document
  htmlContent += `
        </tbody>
      </table>
      <div style="text-align: right; margin-top: 12pt; font-size: 8pt;">
        Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `;

  // Convert HTML to Blob and save as .doc file
  const blob = new Blob([htmlContent], { type: "application/msword" });
  saveAs(blob, generateFilename("doc", tableHeader));
}

// Main export function that handles all export types
export function exportData<T>(options: ExportOptions<T>) {
  const { type, data, columns, tableHeader, activeSession } = options;

  switch (type) {
    case "excel":
      exportToExcel(data, columns, tableHeader);
      break;
    case "print":
      printData({ data, columns, activeSession, tableHeader });
      break;
    case "pdf":
      exportToPdf(data, columns, activeSession, tableHeader);
      break;
    case "word":
      exportToWord(data, columns, tableHeader);
      break;
    default:
      console.error("Unsupported export type:", type);
  }
}
