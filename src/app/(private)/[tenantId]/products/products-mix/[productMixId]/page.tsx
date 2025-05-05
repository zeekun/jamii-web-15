"use client";
import React, { useState } from "react";
import { useGet } from "@/api";
import { ProductMix } from "@/types";
import Alert_ from "@/components/alert";
import "@/components/css/Table.css";
import { useParams } from "next/navigation";
import CreateForm from "../create.form";
import AccessDenied from "@/components/access-denied";
import { Skeleton, Typography } from "antd";
import { useRoles } from "@/providers/RolesProvider";
import { hasPermission } from "@/utils/permissions";
import RecordActions from "@/components/record-actions";
import {
  deletePermissions,
  readPermissions,
  updatePermissions,
} from "../constants";
const { Title } = Typography;

export default function Page() {
  const { tenantId, productMixId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    permissions,
    error: permissionsError,
    isPermissionsLoading,
  } = useRoles();

  const canUpdate = hasPermission(permissions, updatePermissions);
  const canDelete = hasPermission(permissions, deletePermissions);
  const canRead = hasPermission(permissions, readPermissions);

  const {
    status: productMixStatus,
    data: productMix,
    error: productMixError,
  } = useGet<ProductMix[]>(
    `${tenantId}/loan-products/${productMixId}/loan-products`
  );

  if (productMixStatus === "error") {
    return (
      <Alert_
        message={"Error"}
        description={productMixError.message}
        type={"error"}
      />
    );
  }

  if (productMixStatus === "success" && productMix) {
    console.log("productMix", productMix);
  }

  if (productMixStatus === "pending" || isPermissionsLoading) {
    return <Skeleton />;
  }

  if (permissionsError)
    return (
      <Alert_ message="Error" description={permissionsError} type="error" />
    );

  if (productMixStatus === "success" && productMix) {
    return (
      <>
        {canRead ? (
          <>
            <div className="flex justify-between">
              <Title level={4}>Product Mix</Title>
              <RecordActions
                actionTitle="productMix"
                isModalOpen={isModalOpen}
                redirectUrl={`/${tenantId}/products/product-mix`}
                setIsModalOpen={setIsModalOpen}
                canUpdate={canUpdate}
                canDelete={canDelete}
                id={Number(productMixId)}
                deleteUrl={`${tenantId}/product-mixes`}
                // updateForm={
                //   <CreateForm
                //     id={Number(productMixId)}
                //     submitType="update"
                //     setIsModalOpen={setIsModalOpen}
                //   />
                // }
              />
            </div>

            <div className=" w-full">
              <table className="text-md text-left w-full">
                <tr className="text-lg">
                  <th className="w-[10rem]">Name:</th>
                  <td>{productMix[0].name}</td>
                </tr>
                <tr className="text-md">
                  <th>Restricted Products:</th>
                  <td>
                    {productMix[0].restrictedProducts.map(
                      (restrictedProduct, i) => (
                        <ul key={i}>{restrictedProduct.name}</ul>
                      )
                    )}
                  </td>
                </tr>
              </table>
            </div>
          </>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  }

  return null;
}
