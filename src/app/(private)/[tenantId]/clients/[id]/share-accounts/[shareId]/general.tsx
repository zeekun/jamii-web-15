import { Typography } from "antd";
import { ShareAccount } from "@/types";
import { formattedDate } from "@/utils/dates";
import { formatNumber } from "@/utils/numbers";

const { Title } = Typography;
export default function General(props: { share: ShareAccount | undefined }) {
  const { share } = props;

  return (
    <>
      <Title level={5}>Details</Title>
      <div className="border-solid border-2 border-gray-400 p-3 mb-3">
        <table className="w-full">
          <tr>
            <td className="w-1/4">Activated On:</td>
            <td>
              {share?.activatedDate
                ? formattedDate(share.activatedDate)
                : "Not Activated"}
            </td>
          </tr>
          <tr>
            <td>Currency:</td>
            <td>{share?.currencyCode}</td>
          </tr>

          <tr>
            <td>External Id:</td>
            <td>{share?.externalId ? share?.externalId : "Not Available"}</td>
          </tr>
          <tr>
            <td>Linked Savings Account(Dividend Posting):</td>
            <td>#{share?.savingsAccount.accountNo}</td>
          </tr>
        </table>
      </div>

      <Title level={5}>Terms</Title>
      <div className="border-solid border-2 border-gray-400 p-3 mb-3">
        <table className="w-full border-solid border-1">
          <tr>
            <td className="w-1/4">Approved Shares:</td>
            <td>{formatNumber(share?.totalApprovedShares) || 0}</td>
          </tr>
          <tr>
            <td>Pending for Approval Shares:</td>
            <td>{formatNumber(share?.totalPendingShares) || 0}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
