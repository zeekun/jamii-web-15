"use client";
import { useParams } from "next/navigation";
import ReportGenerator from "../../components/ReportGenerator";
import { useGetById } from "@/api";
import { StretchyReport } from "@/types";
import Alert_ from "@/components/alert";
import Loading from "@/components/loading";

export default function Page() {
  const { tenantId, reportId } = useParams();
  const {
    status: reportStatus,
    data: report,
    error,
  } = useGetById<StretchyReport>(
    `${tenantId}/stretchy-reports`,
    Number(reportId)
  );

  if (reportStatus === "success") {
    console.log(report);
  }

  if (reportStatus === "pending") {
    return <Loading />;
  }

  if (reportStatus === "error") {
    return (
      <Alert_
        message="Error"
        description={
          error || "An unknown error occurred while fetching the report."
        }
        type="error"
      />
    );
  }

  if (!report) {
    return (
      <Alert_
        message="No Data"
        description="The requested report could not be found or contains no data."
        type="info"
      />
    );
  }

  return <ReportGenerator submitType="view" report={report} />;
}
