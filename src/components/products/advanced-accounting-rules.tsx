import FeeIncomeAccountsDataTable from "@/components/products/fee-income-accounts.data-table";
import FeeIncomeAccountsModal from "@/components/products/fee-income-accounts.modal";
import FundSourcesDataTable from "@/components/products/fund-sources.data-table";
import FundSourceModal from "@/components/products/fund-sources.modal";
import PenaltyIncomeAccountsDataTable from "@/components/products/penalty-income-accounts.data-table";
import PenaltyIncomeAccountsModal from "@/components/products/penalty-income-accounts.modal";
import { FeeIncomeAccount, FundSource, PenaltyIncomeAccount } from "@/types";
import { Checkbox, Form, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { SetStateAction } from "react";

const { Title } = Typography;

export default function AdvancedAccountingRules(props: {
  advancedAccountingRulesChecked: boolean;
  onChangeAdvancedAccountingRules: (e: CheckboxChangeEvent) => void;
  showAdvancedAccountingRulesInputs: boolean;
  fundSourcesData: FundSource[];
  setFundSourcesData: React.Dispatch<SetStateAction<FundSource[]>>;
  feeIncomeAccountsData: FeeIncomeAccount[];
  setFeeIncomeAccountsData: React.Dispatch<SetStateAction<FeeIncomeAccount[]>>;
  penaltyIncomeAccountsData: PenaltyIncomeAccount[];
  setPenaltyIncomeAccountsData: React.Dispatch<
    SetStateAction<PenaltyIncomeAccount[]>
  >;
}) {
  const {
    advancedAccountingRulesChecked,
    onChangeAdvancedAccountingRules,
    showAdvancedAccountingRulesInputs,
    fundSourcesData,
    setFundSourcesData,
    feeIncomeAccountsData,
    setFeeIncomeAccountsData,
    penaltyIncomeAccountsData,
    setPenaltyIncomeAccountsData,
  } = props;
  return (
    <>
      <Form.Item
        className="col-span-6 flex justify-start items-baseline"
        name="advancedAccountingRules"
        valuePropName="checked"
      >
        <div className="grid grid-cols-2">
          <Checkbox
            className="col-span-2"
            checked={advancedAccountingRulesChecked}
            onChange={onChangeAdvancedAccountingRules}
          >
            Advanced Accounting Rules
          </Checkbox>
        </div>
      </Form.Item>

      {showAdvancedAccountingRulesInputs && (
        <>
          <div className="col-span-6 flex justify-between items-center gap-5 mt-3">
            <Title level={5}>Configure Fund Sources for Payment Channels</Title>
            <FundSourceModal
              fundSourcesData={fundSourcesData}
              setFundSourcesData={setFundSourcesData}
            />
          </div>
          {fundSourcesData.length > 0 && (
            <div className="col-span-6">
              <FundSourcesDataTable
                data={fundSourcesData}
                setFundSourcesData={setFundSourcesData}
              />
            </div>
          )}

          <div className="col-span-6 flex justify-between items-center gap-5 mt-3">
            <Title level={5}>Map Fees to Specific Income Accounts</Title>
            <FeeIncomeAccountsModal
              feeIncomeAccountsData={feeIncomeAccountsData}
              setFeeIncomeAccountsData={setFeeIncomeAccountsData}
            />
          </div>

          {feeIncomeAccountsData.length > 0 && (
            <div className="col-span-6">
              <FeeIncomeAccountsDataTable
                data={feeIncomeAccountsData}
                setFeeIncomeAccountsData={setFeeIncomeAccountsData}
              />
            </div>
          )}

          <div className="col-span-6 flex justify-between items-center gap-5 mt-3">
            <Title level={5}>Map Penalties to Specific Income Accounts</Title>
            <PenaltyIncomeAccountsModal
              penaltyIncomeAccountsData={penaltyIncomeAccountsData}
              setPenaltyIncomeAccountsData={setPenaltyIncomeAccountsData}
            />
          </div>
          {penaltyIncomeAccountsData.length > 0 && (
            <div className="col-span-6">
              <PenaltyIncomeAccountsDataTable
                data={penaltyIncomeAccountsData}
                setPenaltyIncomeAccountsData={setPenaltyIncomeAccountsData}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
