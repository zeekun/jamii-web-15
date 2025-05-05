"use client";
import { useGetById } from "@/api";
import {
  deletePermissions,
  ENDPOINT,
  MODAL_WIDTH,
  PAGE_TITLE,
  readPermissions,
  updatePermissions,
} from "../constants";
import { ShareProduct } from "@/types";
import { Typography } from "antd";
import Alert_ from "@/components/alert";
import { formatNumber } from "@/utils/numbers";
import { EditOutlined } from "@ant-design/icons";
import Loading from "@/components/loading";
import CreateModal from "@/components/create.modal";
import CreateForm from "../create.form";
import { useParams } from "next/navigation";
import { useState } from "react";
const _ = require("lodash");
import "@/components/css/Table.css";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";

const { Title } = Typography;

export default function Page() {
  const { tenantId, id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canRead = hasPermission(permissions, readPermissions);
  const canDelete = hasPermission(permissions, deletePermissions);

  const {
    status: shareProductStatus,
    data: shareProduct,
    error: shareProductError,
  } = useGetById<ShareProduct>(`${tenantId}/${ENDPOINT}`, `${id}`);

  return (
    <>
      {shareProductStatus === "error" ? (
        <Alert_
          message={"Error"}
          description={shareProductError.message}
          type={"error"}
        />
      ) : (
        <>
          {shareProductStatus === "pending" ? (
            <Loading config={{ size: "large" }} />
          ) : (
            <>
              <div className="flex justify-between">
                <Title level={3} className="capitalize">
                  {shareProduct.name}
                </Title>

                {canUpdate && (
                  <CreateModal
                    submitType="update"
                    buttonTitle="Update Share Product"
                    isModalOpen={isModalOpen}
                    buttonType="green"
                    setIsModalOpen={setIsModalOpen}
                    CreateForm={
                      <CreateForm
                        submitType="update"
                        id={Number(id)}
                        setIsModalOpen={setIsModalOpen}
                      />
                    }
                    pageTitle={PAGE_TITLE}
                    width={MODAL_WIDTH}
                    icon={<EditOutlined />}
                  />
                )}
              </div>

              <div className="w-full" style={{ margin: "auto" }}>
                <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
                  <th className="pb-1 pt-2">
                    <td className="text-blue-500">Details</td>
                  </th>
                  <tr>
                    <td className="w-[40%]">Short Name:</td>
                    <td>{shareProduct.shortName}</td>
                  </tr>
                  {shareProduct?.description && (
                    <tr>
                      <td>Description:</td>
                      <td>{shareProduct.description}</td>
                    </tr>
                  )}
                </table>
                <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
                  <th className="pb-1 pt-2">
                    <td className="text-blue-500">Currency</td>
                  </th>

                  <tr>
                    <td className="w-[40%]">Currency:</td>
                    <td>{shareProduct.currencyCode}</td>
                  </tr>
                  <tr>
                    <td>Currency In Multiples Of:</td>
                    <td>{formatNumber(shareProduct.currencyMultiplesOf)}</td>
                  </tr>
                </table>
                <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
                  <th className="pb-1 pt-2">
                    <td className="text-blue-500">Terms</td>
                  </th>

                  <tr>
                    <td className="w-[40%]">Total Shares:</td>
                    <td>{shareProduct.totalShares}%</td>
                  </tr>
                  <tr>
                    <td>Unit Price:</td>
                    <td>{shareProduct.unitPrice}</td>
                  </tr>
                  <tr>
                    <td>Capital Amount:</td>
                    <td>{shareProduct.capitalAmount}</td>
                  </tr>
                </table>
                <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
                  {shareProduct.charges && (
                    <th className="pb-1 pt-2">
                      <td className="text-blue-500">Charges</td>
                    </th>
                  )}

                  {shareProduct.charges && (
                    <tr className="text-left">
                      <th className="w-[40%]">Name</th>
                      <th>Type</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  )}
                  {shareProduct.charges?.map((charge, i: number) => (
                    <tr key={i}>
                      <td>{charge.name}</td>
                      <td>{_.capitalize(charge.chargeCalculationTypeEnum)}</td>
                      <td className="text-right">
                        {formatNumber(charge.amount)} {charge.currencyId}
                      </td>
                    </tr>
                  ))}
                </table>
                <table className="w-full table-auto capitalize border-solid border-[1px] mt-3 border-gray-200">
                  <th className="pb-1 pt-2">
                    <td className="text-blue-500">Accounting</td>
                  </th>

                  <tr>
                    <td className="w-[40%]">Type:</td>
                    <td>{_.capitalize(shareProduct.accountingTypeEnum)}</td>
                  </tr>

                  {shareProduct.shareProductAccountings?.map((account) => (
                    <tr key={account.id}>
                      <td>{account.name}</td>{" "}
                      <td>{_.capitalize(account.glAccount.name)}</td>
                    </tr>
                  ))}
                </table>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
