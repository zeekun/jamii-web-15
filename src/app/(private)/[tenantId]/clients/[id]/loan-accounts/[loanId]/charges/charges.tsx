import { useGet } from "@/api";
import Alert_ from "@/components/alert";
import DataTable from "./charges.data-table";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Modal } from "antd";
import { Loan, LoanCharge } from "@/types";
import AddLoanChargesForm from "./add-loan-charge";
import { PlusOutlined } from "@ant-design/icons";

export default function Charges(props: { loan: Loan | undefined }) {
  const { loan } = props;
  const { tenantId, loanId } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LoanCharge | null>(null);

  const {
    status,
    data: charges,
    error,
  } = useGet<LoanCharge[]>(`${tenantId}/loans/${loanId}/loan-charges`, [
    `${tenantId}/loans/${loanId}/loan-charges`,
  ]);

  const showModal = (record?: LoanCharge) => {
    setSelectedRecord(record || null);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  return (
    <>
      <div className="flex justify-end mb-5">
        {loan && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Charge
          </Button>
        )}
      </div>
      {status === "error" ? (
        <Alert_ message="Error" description={error?.message} type="error" />
      ) : (
        <DataTable
          data={charges}
          status={status === "pending" ? true : false}
        />
      )}
      {isModalVisible && (
        <Modal
          title={selectedRecord ? "Update Charge" : "Add Charge"}
          open={isModalVisible}
          onCancel={closeModal}
          footer={null}
        >
          <AddLoanChargesForm
            loan={loan}
            submitType={selectedRecord ? "update" : "create"}
            id={selectedRecord?.id}
            setIsModalOpen={setIsModalVisible}
          />
        </Modal>
      )}
    </>
  );
}
