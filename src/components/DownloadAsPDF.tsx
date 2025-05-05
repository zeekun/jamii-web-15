import React, { useRef, ReactNode } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

interface DownloadAsPDFProps {
  filename?: string;
  children: ReactNode; // Explicitly define children prop
}

const DownloadAsPDF: React.FC<DownloadAsPDFProps> = ({
  filename = "download.pdf",
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4"); // 'l' for landscape

    // Margins
    const topMargin = 10;
    const leftMargin = 10;
    const rightMargin = 10;

    // A4 landscape dimensions
    const pageWidth = 297; // A4 width in landscape (mm)
    //const pageHeight = 210; // A4 height in landscape (mm)

    // Adjusted image width and height
    const imgWidth = pageWidth - leftMargin - rightMargin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    pdf.addImage(imgData, "PNG", leftMargin, topMargin, imgWidth, imgHeight);
    pdf.save(filename);
  };

  return (
    <div>
      <div ref={contentRef}>{children}</div>
      <Button
        icon={<DownloadOutlined />}
        type="primary"
        onClick={handleDownload}
        className="mt-4"
      >
        Download PDF
      </Button>
    </div>
  );
};

export default DownloadAsPDF;
