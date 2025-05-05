import { ReactNode } from "react";
import { User as NextAuthUser, Session } from "next-auth";
import { Big } from "big.js";

import { ColumnType, ColumnGroupType } from "antd/es/table";

// For regular columns
export type ExtendedColumnType<T> = ColumnType<T> & {
  exportValue?: (value: unknown, record: T) => unknown;
  exportStringify?: boolean;
  exportStringifyKeys?: string[];
};

// For column groups (without dataIndex)
type ExtendedColumnGroupType<T> = Omit<ColumnGroupType<T>, "dataIndex"> & {
  children: ExtendedTableColumn<T>[];
  exportValue?: never; // Column groups shouldn't have exportValue
};

export type ExtendedTableColumn<T> =
  | ExtendedColumnType<T>
  | ExtendedColumnGroupType<T>;

export type DeviceSize = "sm" | "md" | "lg" | "xl" | "2xl";
interface BaseUser {
  tenantId: number;
  accessToken?: string;
  refreshToken?: string;
}

export interface MyUser extends NextAuthUser, BaseUser {
  username?: string;
  userId?: number;
  roles?: [string];
}

export interface MySession extends Session {
  error: string;
  user: MyUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface User {
  key?: string | number;
  id?: number;
  email?: string;
  roles?: [
    {
      v1: string;
    }
  ];
  officeId?: number;
  offices?: Office[];
  staffId?: number;
  staff?: Employee[];
  username: string;
  lastLogin?: string;
  phoneNumber?: string;
  image?: File;
  person: {
    titlePrefixId?: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    gender?: string;
    avatar?: string;
    birthDate?: string;
    comments?: string;
    titlePrefix?: {
      id: number;
      title: string;
    };
    titleSuffixes?: [
      {
        id: number;
        title: string;
      }
    ];
  };
  createdAt: string;
}

export interface LoginActivity {
  date: string;
  logins: number;
  failedLogins: number;
}

export interface TenantActivity {
  name: string;
  activeUsers: number;
  logins: number;
}

export interface UserTenant {
  key?: string | number;
  id?: number;
  userId: number;
  tenantId: number;
  tenant: Tenant;
  username: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface StretchyReport {
  key?: string | number;
  id?: number;
  name: string;
  sql: string;
  category: string;
  type: string;
  description?: string;
  labelForCountField?: string;
  countField?: string;
  stretchyReportParameters: StretchyReportParameter[];
}

export interface StretchyReportParameter {
  id?: number;
  variableName: string;
  variableType: "string" | "number" | "date" | "boolean";
  variableLabel: string;
  variableInput: string | number;
}

export interface Permission {
  key?: string | number;
  id?: number;
  grouping: string;
  code: string;
  entityName: string;
  actionName: string;
}

export interface RolePermission {
  key?: string | number;

  permissionId: number;
  roleId: number;
}

export interface Tenant {
  name: string;
}

export interface WorkingDay {
  id: number;
  recurrence: string;
  repaymentReschedulingEnum?:
    | "SAME DAY"
    | "MOVE TO NEXT WORKING DAY"
    | "MOVE TO NEXT REPAYMENT MEETING DAY"
    | "MOVE TO PREVIOUS DAY";
  extendTermDailyRepayments?: boolean;
}

export type Breadcrumb = { title: string; path: string }[];

export type PageLinkType = {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
  key?: number;
};

export type SubmitType = "create" | "update";

export type FinancialActivityTypeEnum =
  | "ASSET TRANSFER"
  | "CASH AT MAIN VAULT"
  | "CASH AT TELLER"
  | "ASSET FUND SOURCE"
  | "LIABILITY TRANSFER"
  | "PAYABLE DIVIDENDS"
  | "OPENING BALANCES TRANSFERS CONTRA";

export type Currency = {
  code: string;
  name: string;
};

export interface Tenant {
  id?: number;
  name: string;
}

export interface Office {
  id?: number;
  key?: string | number;
  name: string;
  openingDate: string;
  parentId?: number;
  parent?: Office;
  email?: string;
  phoneNumber?: string;
  offices?: Office[];
  tenantId: number;
  externalId?: string;
  hierarchy?: string;
}

export interface ProvisioningCriteria {
  id?: number;
  key?: string | number;
  name: string;
  loanProducts: LoanProduct[];
  provisioningCriteriaDefinitions: ProvisioningCriteriaDefinition[];
}

export interface LoanProductProvisioningMapping {
  loanProductId?: number;
  provisioningCriteriaId?: number;
}

export interface ProvisionCategory {
  name: "STANDARD" | "SUB-STANDARD" | "DOUBTFUL" | "LOSS";
  description?: string;
}

export interface ProvisioningCriteriaDefinition {
  id?: number;
  minAge: number;
  maxAge: number;
  provisionPercentage?: number;
  criteriaId: number;
  categoryId: number;
  category: ProvisionCategory;
  liabilityAccountId: number;
  liabilityAccount: GLAccount;
  expenseAccountId: number;
  expenseAccount: GLAccount;
}
export interface ProductMix {
  id?: number;
  name: string;
  restrictedProducts: LoanProduct[];
}

export interface Client {
  id: number;
  key?: string | number;
  statusEnum:
    | "INVALID"
    | "CLOSED"
    | "PENDING"
    | "ACTIVE"
    | "REJECTED"
    | "WITHDRAWN";
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  dateOfBirth?: string;
  incorporationDate?: string;
  incorporationValidityTillDate?: string;
  incorporationNumber?: string;
  mainBusinessLineId?: number;
  constitutionId?: number;
  remarks?: string;
  officeId: number;
  office: Office;
  activationDate?: string;
  legalFormEnum: "PERSON" | "ENTITY";
  clientTypeId?: number;
  clientClassificationId?: number;
  isOpenSavingsAccount?: boolean;
  staffId?: number;
  isStaff?: boolean;
  staff?: Employee;
  submittedOnDate?: string;
  submittedOnUserId?: number;
  genderEnum?: "MALE" | "FEMALE";
  email?: string;
  mobileNo?: string;
  mobileNo2?: string;
  savingsProductId?: number;
  phoneNumbers?: PhoneNumber[];
  emails?: Email[];
  externalId?: string;
  accountNo?: string;
  isActive: boolean;
  familyMembers?: FamilyMember[];
  image?: File;
}

export interface Group {
  id?: number;
  accountNo: string;
  name: string;
  statusEnum?:
    | "INVALID"
    | "PENDING"
    | "ACTIVE"
    | "CLOSED"
    | "REJECTED"
    | "WITHDRAWN";
  activationDate?: string;
  isActive?: boolean;
  externalId?: string;
  submittedOnDate?: string;
  submittedOnUserId?: number;
  clients: Client[];
  officeId: number;
  office: Office;
  staffId?: number;
  staff?: Employee;
  centerId: number;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  type: string;
  entity: string;
  content: string;
  isActive: boolean;
  transactionPoint: string;
}

export interface Center {
  id?: number;
  key?: string | number;
  accountNo: string;
  name: string;
  officeId: number;
  office: Office;
  groups?: Group[];
  staffId?: number;
  staff?: Employee;
  externalId?: string;
  isActive?: boolean;
  submittedOnDate: string;
}

export interface FamilyMember {
  id?: number;
  key?: string | number;
  firstName: string;
  lastName: string;
  middleName?: number;
}

export interface ClientIdentifier {
  id?: number;
  documentKey: string;
  status: string;
  active?: boolean;
  description?: string;
  clientId?: number;
  documentTypeId: number;
  documentType: CodeValue;
}

export interface GroupRole {
  id: number;
  clientId: number;
  client: Client;
  roleCodeValueId: number;
  roleCodeValue: CodeValue;
}

export interface GroupClient {
  id: number;
  clientId: number;
  client: Client;
  groupId: number;
  group: Group;
}

export interface Holiday {
  id: number;
  key?: string | number;
  name: string;
  fromDate: string;
  toDate: string;
  repaymentScheduledTo: string;
  repaymentScheduleTypeId: number;
  repaymentScheduleType?: { id: number; name: string };
  recurrenceType: "ANNUAL" | "ONE-TIME";
}

export interface SelectOption {
  value: string | number;
  label: string | undefined;
}
export interface PhoneNumber {
  id?: number;
  number: string;
}

export interface Email {
  id?: number;
  email: string;
}

export interface Task {
  count?: number;
  description: string;
  priority: string;
  type: string;
  id?: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  url: string;
}
export interface Employee {
  id: number;
  key?: string | number;
  firstName: string;
  lastName: string;
  middleName?: string;
  joiningDate: string;
  phoneNumbers?: PhoneNumber[];
  emails?: Email[];
  isLoanOfficer: boolean;
  isStaff?: boolean;
  isActive?: boolean;
  officeId: number;
  tenantId: number;
  office: Office;
  createdAt: string;
  image?: File;
  signatureImage?: File;
}

export interface Fund {
  id: number;
  key?: string | number;
  name: string;
}
export interface AuditLog {
  id: number;
  action: string;
  entityId?: string;
  modelName: string;
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: string;
  userId: string;
  user?: AuditUser;
}

export interface SupportTicket {
  count?: number;
  id: number;
  type: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  createdById: number;
  createdBy: AuditUser;
  assignedTo?: Employee;
  attachments?: unknown[];
}

export interface SupportTicketReply {
  id: number;
  reply: string;
  createdAt?: string;
  createdBy: AuditUser;
}
export interface Country {
  code: string; // Country flag code (ISO 3166-1 alpha-2)
  dialCode: string; // Dialing code
  name: string; // Country name
}

export interface Teller {
  id: number;
  key?: string | number;
  name: string;
  officeId: number;
  office: Office;
  description?: string;
  validFrom: string;
  validTo?: string;
  status: boolean;
}

export interface Cashier {
  id?: number;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  fullDay?: boolean;
  staff: Employee;
  teller: Teller;
}

export interface CashierTransaction {
  id?: number;
  typeEnum: "ALLOCATE CASH" | "SETTLE CASH";
  amount: number;
  date: string;
  entityType?: string;
  entityId?: number;
  note?: string;
  currencyCode?: string;
  cashierId?: number;
}

export interface Centre {
  id: number;
  key?: string | number;
  name: string;
}

export interface RepaymentScheduleType {
  id: number;
  key?: string | number;
  name: string;
}

export interface LoanTransactionProcessingStrategy {
  id: number;
  key?: string | number;
  name: string;
}

export type GLAccountType =
  | "ASSET"
  | "INCOME"
  | "EXPENSE"
  | "LIABILITY"
  | "EQUITY";
export interface GLAccount {
  id: number;
  key?: string | number;
  name: string;
  glCode: string;
  type: CodeValue;
  usage: CodeValue;
  tagId?: number;
  isActive: boolean;
  manualEntriesAllowed: boolean;
  parentId?: number;
  parent: GLAccount;
  description?: string;
}

export interface GLFinancialActivityAccount {
  id?: number;
  financialActivityTypeEnum: FinancialActivityTypeEnum;
  glAccount: GLAccount;
}

export interface ProcessedGLAccount {
  glCode: string;
  name: string;
  totalAmount?: number;
}

export interface AuditUser {
  id: number;
  person: {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
}
export interface GlJournalEntry {
  id?: number;
  key?: string | number;
  officeId: number;
  currencyId: string;
  manualEntry: boolean;
  reversalId?: number;
  transactionId: string;
  reversed: boolean;
  refNum?: string;
  entryDate: string;
  typeEnum?: "CREDIT" | "DEBIT";
  amount: number;
  entityTypeEnum?: string;
  entityId?: number;
  isRunningBalanceCalculated: boolean;
  officeRunningBalance?: number;
  organizationRunningBalance: number;
  glAccountId: 1;
  glAccount: GLAccount;
  paymentTypeId: null;
  office: Office;
  currency: Currency;
  description?: string;
  createdByUser: AuditUser;
  createdAt: string;
  credits?: DebitCreditEntry[];
  debits?: DebitCreditEntry[];
}

export interface DebitCreditEntry {
  id?: number;
  glAccountId: number;
  glAccount?: GLAccount;
  amount: number;
}

export interface TrialBalanceSummary {
  accountCode: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
}

export interface AutoSavedFormData {
  id?: number;
  key?: string | number;
  data: object;
  form: string;
}

export interface GLClosure {
  id: number;
  key?: string | number;
  closingDate: string;
  officeId: number;
  office: Office;
  comments?: string;
}

export interface Code {
  id: number;
  key?: string | number;
  name: string;
  systemDefined: boolean;
  codeValues: [CodeValue];
}

export interface CodeValue {
  id: number;
  key?: string | number;
  codeValue: string;
  codeDescription?: string;
  orderPosition: number;
  isActive: boolean;
  isMandatory: boolean;
  tenantId: number;
}
export interface AccountingRule {
  id: number;
  key?: string | number;
  name: string;
  office: Office;
  accountingRuleTags?: [
    {
      tag?: {
        id: number;
        codeValue: string;
        code: Code;
      };
    }
  ];
  description?: string;
  allowMultipleDebits?: boolean;
  allowMultipleCredits?: boolean;
  debitAccount?: GLAccount;
  creditAccount?: GLAccount;
}

export interface TaxComponent {
  id: number;
  key?: string | number;
  name: string;
  percentage: number;
  startDate: string;
  debitAccount?: GLAccount;
  creditAccount?: GLAccount;
}

export interface TaxGroup {
  id: number;
  key?: string | number;
  name: string;
  taxComponents: [TaxComponent];
}

export interface PaymentType {
  id: number;
  key?: string | number;
  name: string;
  description?: string;
  isCashPayment: boolean;
  position?: number;
}

export interface TaxGroupTaxComponent {
  id: number;
  key?: string | number;
  name: string;
  percentage: number;
  startDate: string;
  debitAccountId?: number;
  creditAccountId?: number;
}

export type chargeTimeTypeEnum = "SPECIFIED DUE DATE";

export type chargeTimeTypeEnumLoan =
  | chargeTimeTypeEnum
  | "DISBURSEMENT"
  | "INSTALLMENT FEE"
  | "OVERDUE FEE"
  | "TRANCHE DISBURSEMENT";

export type chargeTimeTypeEnumSaving =
  | chargeTimeTypeEnum
  | "SAVINGS ACTIVATION"
  | "WITHDRAWAL FEE"
  | "ANNUAL FEE"
  | "MONTHLY FEE"
  | "WEEKLY FEE"
  | "OVERDRAFT FEE"
  | "SAVINGS NO ACTIVITY FEE";

export type chargeTimeTypeEnumClient = chargeTimeTypeEnum;

export type chargeTimeTypeEnumShare =
  | "SHARE ACCOUNT ACTIVATE"
  | "SHARE PURCHASE"
  | "SHARE REDEEM";

export type chargeCalculationTypeEnum =
  | "FLAT"
  | "% APPROVED AMOUNT"
  | "% LOAN AMOUNT + INTEREST"
  | "% INTEREST";
export interface Charge {
  id: number;
  key?: string | number;
  name: string;
  amount: number;
  currencyId: number;
  chargeAppliesToEnum: "LOANS" | "SAVINGS AND DEPOSITS" | "CLIENTS" | "SHARES";
  chargeTimeTypeEnum:
    | chargeTimeTypeEnumLoan
    | chargeTimeTypeEnumSaving
    | chargeTimeTypeEnumClient
    | chargeTimeTypeEnumShare;

  chargeCalculationTypeEnum: chargeCalculationTypeEnum;
  isPenalty: boolean;
  isActive: boolean;
  chargePaymentModeEnum?:
    | "REGULAR"
    | "ACCOUNT TRANSFER"
    | "INSTALLMENT FEE"
    | "OVERDUE FEE"
    | "TRANCHE DISBURSEMENT";
  taxGroupId?: number | null;
  feeInterval?: number;
}

export interface LoanCharge {
  id?: number;
  key?: string | number;
  chargeId: number;
  charge: Charge;
  loanId: number;
  loan?: Loan;
  amount: number;
  amountOutstandingDerived?: number;
  chargeTimeEnum:
    | chargeTimeTypeEnumLoan
    | chargeTimeTypeEnumSaving
    | chargeTimeTypeEnumClient
    | chargeTimeTypeEnumShare;

  chargeCalculationEnum: chargeCalculationTypeEnum;
  isPenalty: boolean;
  isActive: boolean;
  chargePaymentModeEnum?:
    | "REGULAR"
    | "ACCOUNT TRANSFER"
    | "INSTALLMENT FEE"
    | "OVERDUE FEE"
    | "TRANCHE DISBURSEMENT";
  taxGroupId?: number | null;
}

export interface FundSource {
  id?: number;
  key?: string | number;
  paymentType: PaymentType;
  glAccount: GLAccount;
}

export interface FeeIncomeAccount {
  id?: number;
  key?: string | number;
  charge: Charge;
  glAccount: GLAccount;
}

export interface PenaltyIncomeAccount {
  id?: number;
  key?: string | number;
  charge: Charge;
  glAccount: GLAccount;
}

export type TimeInterval = "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
export interface SavingsProduct {
  id: number;
  key?: string | number;
  name: string;
  shortName: string;
  currencyCode: string;
  inMultiplesOf?: number;
  description?: string;
  nominalAnnualInterestRate: number;
  depositTypeEnum?:
    | "INVALID"
    | "FIXED DEPOSIT"
    | "SAVING DEPOSIT"
    | "RECURRING DEPOSIT"
    | "CURRENT DEPOSIT";
  interestCompoundingPeriodTypeEnum:
    | "DAILY"
    | "MONTHLY"
    | "QUARTERLY"
    | "SEMI-ANNUAL"
    | "ANNUALLY";
  interestPostingPeriodTypeEnum:
    | "MONTHLY"
    | "QUARTERLY"
    | "BIANNUAL"
    | "ANNUALLY";
  interestCalculationTypeEnum: "DAILY BALANCE" | "AVERAGE DAILY BALANCE";
  interestCalculationDaysInYearTypeEnum: "360" | "365";
  minRequiredOpeningBalance?: number;
  lockInPeriodFrequency?: number;
  lockInPeriodFrequencyTypeEnum?: TimeInterval;
  withdrawalFeeForTransfers?: boolean;
  withDrawFeeAmount?: number;
  allowOverdraft?: boolean;
  overdraftLimit?: number;
  nominalAnnualInterestRateOverdraft?: number;
  minOverdraftForInterestCalculation?: number;
  minBalanceForInterestCalculation?: number;
  enforceMinRequiredBalance?: boolean;
  minRequiredBalance?: number;
  withHoldTax?: boolean;
  taxGroupId?: number;
  isDormancyTrackingActive?: boolean;
  daysToInactive?: number;
  daysToDormant?: number;
  daysToEscheat?: number;
  accountingRuleEnum: "NONE" | "CASH" | "ACCRUAL (PERIODIC)";
  advancedAccountingRules?: boolean;
  charges?: Charge[];
  savingsProductAccountings?: {
    id: number;
    name: string;
    savingsProductId: number;
    glAccountId: number;
    glAccount: GLAccount;
  }[];
  fundSources?: FundSource[];
  feeIncomeAccounts?: FeeIncomeAccount[];
  penaltyIncomeAccounts?: PenaltyIncomeAccount[];
  depositProductTermAndPreClosure?: DepositProductTermAndPreClosure;
  interestRateChart?: InterestRateChart;
  interestRateCharts?: InterestRateChart[];
}

export interface ShareProduct {
  id?: number;
  key?: string | number;
  name: string;
  shortName: string;
  externalId?: string;
  currencyCode: string;
  currencyMultiplesOf?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalShares: number;
  issuedShares?: number;
  totalSubscribedShares?: number;
  unitPrice: number;
  capitalAmount: number;
  minimumClientShares?: number;
  nominalClientShares: number;
  maximumClientShares?: number;
  minimumActivePeriodFrequency?: number;
  minimumActivePeriodFrequencyEnum?: string;
  lockInPeriodFrequency?: number;
  lockInPeriodFrequencyEnum?: TimeInterval;
  allowDividendsInactiveClients?: boolean;
  accountingTypeEnum?: "NONE" | "CASH";
  charges?: Charge[];
  shareProductAccountings?: {
    id: number;
    name: string;
    savingsProductId: number;
    glAccountId: number;
    glAccount: GLAccount;
  }[];
  shareProductMarketPrices?: ShareProductMarketPrice[];
}

export interface ShareProductMarketPrice {
  id?: number;
  productId?: number;
  fromDate?: string;
  shareValue: number;
}

export interface InterestRateChart {
  name?: string;
  description?: string;
  fromDate: string;
  endDate?: string;
  isPrimaryGroupingByAmount: boolean;
  interestRateSlabs?: InterestRateSlab[];
}

export interface InterestRateSlab {
  id?: number;
  description: string;
  periodTypeEnum?: TimeInterval;
  fromPeriod: number;
  toPeriod?: number;
  amountRangeFrom: number;
  amountRangeTo?: number;
  annualInterestRate?: number;
}

export interface DepositProductTermAndPreClosure {
  id?: number;
  savingsProductId: number;
  savingsProduct: SavingsProduct;
  minDepositTerm?: number;
  maxDepositTerm?: number;
  minDepositTermTypeEnum?: TimeInterval;
  maxDepositTermTypeEnum?: TimeInterval;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermTypeEnum?: TimeInterval;
  preClosurePenalApplicable?: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnEnum?: "WHOLE TERM" | "TILL PREMATURE WITHDRAWAL";
  minDepositAmount?: number;
  maxDepositAmount?: number;
  depositAmount?: number;
  lockInPeriodFrequencyTypeEnum?: TimeInterval;
  withHoldTax?: boolean;
  taxGroupId?: number;
}

export type LoanProductAccountingRule =
  | "NONE"
  | "CASH"
  | "ACCRUAL (PERIODIC)"
  | "ACCRUAL (UPFRONT)";

export type InterestType = "FLAT" | "DECLINING BALANCE";
export type amortizationType =
  | "EQUAL INSTALLMENTS"
  | "EQUAL PRINCIPAL PAYMENTS";

export type interestCalculationPeriodType =
  | "DAILY"
  | "SAME AS REPAYMENT PERIOD";
export interface LoanProduct {
  id: number;
  key?: string | number;
  name: string;
  shortName: string;
  description?: string;
  startDate?: string;
  closeDate?: string;
  inCustomerLoanCounter?: boolean;
  fundId?: number;
  fund?: Fund;
  currencyCode: string;
  inMultiplesOf?: number;
  principalAmount: number;
  allowPartialPeriodInterestCalculation: boolean;
  loanScheduleTypeEnum: "CUMULATIVE" | "PROGRESSIVE";
  loanTransactionProcessingStrategyId?: number;
  loanTransactionProcessingStrategy: LoanTransactionProcessingStrategy;
  allowMultipleDisbursements?: boolean;
  isEqualAmortization?: boolean;
  enableDownPayment?: boolean;
  maxPrincipalAmount?: number;
  minPrincipalAmount?: number;
  maximumTrancheCount?: number;
  maximumAllowedStandingBalance?: number;
  disallowExpectedMultipleDisbursements: boolean;
  numberOfRepayments: number;
  maxNumberOfRepayments?: number;
  minNumberOfRepayments?: number;
  repaymentEvery: number;
  repaymentFrequencyTypeEnum: TimeInterval;
  interestRatePerPeriod: number;
  interestRateFrequencyTypeEnum: "PER MONTH" | "PER YEAR" | "WHOLE TERM";
  amortizationTypeEnum: amortizationType;
  interestTypeEnum: InterestType;
  interestCalculationPeriodTypeEnum: interestCalculationPeriodType;
  transactionProcessingStrategyId: number;
  accountingRuleEnum: LoanProductAccountingRule;
  interestRecalculationEnabled: boolean;
  daysInYearTypeEnum: string;
  daysInMonthTypeEnum: string;
  inArrearsTolerance?: number;
  graceOnPrincipalPayment?: number;
  graceOnInterestPayment?: number;
  interestFreePeriod?: number;
  graceOnInterestCharged?: number;
  graceOnArrearsAgeing?: boolean;
  includeInBorrowerCycle?: boolean;
  useBorrowerCycle?: boolean;
  multiDisburseLoan?: boolean;
  outstandingLoanBalance?: number;
  isZeroInterestRate?: boolean;
  isLinkedToFloatingInterestRates?: boolean;
  overdueDaysForNPA?: number;
  holdGuaranteeFunds?: boolean;
  principalThresholdForLastInstalment?: number;
  accountMovesOutOfNPAOnlyOnArrearsCompletion?: boolean;
  daysOverdueBeforeMovingIntoArrears?: number;
  maxDaysOverdueBeforeBecomingAnNPA?: number;
  canDefineInstallmentAmount?: boolean;
  allowVariableInstallments?: boolean;
  minimumGap?: number;
  maximumGap?: number;
  canUseForTopUp?: boolean;
  approvalDisbursalAboveLoan?: boolean;
  useGlobalConfigValuesRepaymentEvent?: boolean;
  overAmountCalculationTypeEnum?: "PERCENTAGE" | "FIXED AMOUNT";
  overAmount?: number;
  installmentDayCalculationFromEnum?: "DISBURSEMENT DATE" | "SUBMITTED ON DATE";
  dueDaysForRepaymentEvent?: number;
  overDueDaysForRepaymentEvent?: number;
  termsVaryBasedOnLoanCycle?: boolean;
  minNominalInterestRatePerPeriod?: number;
  nominalInterestRatePerPeriod: number;
  maxNominalInterestRatePerPeriod?: number;
  preClosureInterestCalculationStrategyEnum?:
    | "TILL PRE-CLOSE DATE"
    | "TILL REST FREQUENCY DATE";
  rescheduleStrategyMethodEnum?:
    | "REDUCE EMI AMOUNT"
    | "REDUCE NUMBER OF INSTALLMENTS"
    | "RESCHEDULE NEXT REPAYMENTS";
  interestRecalculationCompoundingMethodEnum?:
    | "NONE"
    | "FEE"
    | "INTEREST"
    | "FEE AND INTEREST";
  recalculationCompoundingFrequencyTypeEnum?:
    | "SAME AS REPAYMENT PERIOD"
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY";
  installmentAmountInMultiplesOf?: number;
  mandatoryGuarantee?: number;
  minimumGuaranteeFromOwnFunds?: number;
  minimumGuaranteeFromGuarantor?: number;
  charges?: Charge[];
  loanProductAccountings?: {
    id: number;
    name: string;
    loanProductId: number;
    glAccountId: number;
    glAccount: GLAccount;
  }[];
  loanProductSettingsAndTerms?: LoanProductSettingsAndTerm;
  loanProductVariationsBorrowerCycles?: LoanCycle[];
  advancedAccountingRules?: boolean;
  fundSources?: FundSource[];
  feeIncomeAccounts?: FeeIncomeAccount[];
  penaltyIncomeAccounts?: PenaltyIncomeAccount[];
}

export interface ProductMix {
  id?: number;
  productId: number;
  restrictedProductId: number;
  product: LoanProduct;
  restrictedProduct: LoanProduct;
}

export interface FloatingRate {
  id?: number;
  name: string;
  isBaseLendingRate: boolean;
  isActive: boolean;
  floatingRatePeriods: FloatingRatePeriod[];
}

export interface FloatingRatePeriod {
  id?: number;
  fromDate: string;
  interestRate: number;
  isDifferentialToBaseLendingRate: boolean;
  isActive: boolean;
}

export interface LoanTransaction {
  id?: number;
  transactionDate: string;
  transactionTypeEnum:
    | "INVALID"
    | "DISBURSEMENT"
    | "REPAYMENT"
    | "CONTRA"
    | "WAIVE_INTEREST"
    | "REPAYMENT_AT_DISBURSEMENT"
    | "WRITEOFF"
    | "MARKED_FOR_RESCHEDULING"
    | "RECOVERY_REPAYMENT"
    | "WAIVE_CHARGES"
    | "ACCRUAL"
    | "INITIATE_TRANSFER"
    | "APPROVE_TRANSFER"
    | "WITHDRAW_TRANSFER"
    | "REJECT_TRANSFER"
    | "REFUND"
    | "CHARGE_PAYMENT"
    | "REFUND_FOR_ACTIVE_LOAN"
    | "INCOME_POSTING";
  amount: number;
  office: Office;
  outstandingLoanBalanceDerived?: number;
  feeChargesPortionDerived?: number;
  interestPortionDerived?: number;
  principalPortionDerived?: number;
  penaltyChargesPortionDerived?: number;
  isReversed?: boolean;
  manuallyAdjustedOrReversed?: boolean;
  loan: Loan;
}

export interface SavingsAccountTransaction {
  id?: number;
  transactionDate: string;
  transactionTypeEnum:
    | "DEPOSIT"
    | "WITHDRAW"
    | "INVALID"
    | "INTEREST POSTING"
    | "WITHDRAWAL FEE"
    | "ANNUAL FEE"
    | "WAIVE CHARGE"
    | "PAY CHARGE"
    | "DIVIDEND PAYOUT"
    | "INITIATE TRANSFER"
    | "APPROVE TRANSFER"
    | "WITHDRAW TRANSFER"
    | "REJECT TRANSFER"
    | "WRITTEN-OFF"
    | "OVERDRAFT INTEREST"
    | "WITHHOLD TAX";
  amount: number;
  cumulativeBalanceDerived: number;
  runningBalanceDerived: number;
  savingsAccount: SavingsAccount;
  isReversed: boolean;
  paymentDetail: PaymentDetail;
}

export interface PaymentDetail {
  id?: number;
  accountNumber?: string;
  checkNumber?: string;
  receiptNumber?: string;
  bankNumber?: string;
  routingCode?: string;
  paymentTypeId: number;
  paymentType: PaymentType;
}

export interface SavingsAccountCharge {
  id?: number;
  chargeId: number;
  charge: Charge;
  chargeDueDate?: string;
  amount: number;
  amountPaidDerived?: number;
  amountWaivedDerived?: number;
  amountOutstandingDerived?: number;
  chargeCalculationEnum: chargeCalculationTypeEnum;
  savingsAccountId: number;
  savingsAccount?: SavingsAccount;
  chargeTimeEnum?: chargeTimeTypeEnumSaving;
  feeOnMonth?: number;
  feeOnDay?: number;
  feeInterval?: number;
  calculationPercentage?: number;
  calculationOnAmount?: number;
  amountWrittenOffDerived?: number;
  isPaidDerived?: boolean;
  waived?: boolean;
  isActive?: boolean;
  inactivatedOnDate?: string;
}

export interface ShareAccountTransaction {
  id?: number;
  transactionDate: string;
  statusEnum: string;
  typeEnum: string;
  amountPaid: number;
  totalShares: number;
  unitPrice: number;
  amount: number;
  chargeAmount: number;
  shareAccount: ShareAccount;
}

export type DaysInMonthType = "ACTUAL" | "30 DAYS";
export type DaysInYearType = "ACTUAL" | "360 DAYS" | "364 DAYS" | "365 DAYS";

export interface Loan {
  id?: number;
  accountNo: string;
  name: string;
  clientId?: number;
  groupId?: number;
  group?: Group;
  currencyCode: string;
  currency: Currency;
  loanOfficerId?: number;
  loanOfficer: Employee;
  loanOfficerName?: string;
  loanPurposeName?: string;
  fundName?: string;
  principalAmount: number;
  maxPrincipalAmount?: number;
  minPrincipalAmount?: number;
  expectedMaturedOnDate: string;
  maturedOnDate: string;
  externalId?: string;
  submittedOnDate: string;
  disbursementOnDate: string;
  expectedFirstRepaymentOnDate?: string;
  expectedDisbursedOnDate: string;
  interestCalculatedFromDate?: string;
  interestTypeEnum: InterestType;
  loanTypeEnum: "INDIVIDUAL LOAN" | "GROUP LOAN";
  loanStatusEnum:
    | "SUBMITTED AND AWAITING APPROVAL"
    | "APPROVED"
    | "ACTIVE"
    | "WITHDRAWN BY CLIENT"
    | "REJECTED"
    | "CLOSED"
    | "WRITTEN OFF"
    | "OVERDUE"
    | "OVERDUE NPA"
    | "RESCHEDULED"
    | "OVERPAID";
  termFrequency?: number;
  termPeriodFrequencyEnum?: TimeInterval;
  disbursementOn?: string;
  numberOfRepayments: number;
  repaymentEvery: number;
  interestOutstandingDerived?: number;
  nominalInterestRatePerPeriod: number;
  isEqualAmortization: boolean;
  amortizationTypeEnum: amortizationType;
  interestCalculationPeriodTypeEnum: interestCalculationPeriodType;
  allowPartialPeriodInterestCalculation: boolean;
  inArrearsTolerance?: number;
  interestFreePeriod?: number;
  graceOnPrincipalPayment?: number;
  totalOutstandingDerived: number;
  graceOnInterestPayment?: number;
  graceOnArrearsAgeing?: boolean;
  interestRecalculationEnabled: boolean;
  daysInMonthTypeEnum: DaysInMonthType;
  daysInYearTypeEnum: DaysInYearType;
  repaymentFrequencyTypeEnum: TimeInterval;
  loanProduct: LoanProduct;
  client?: Client;
  loanPurpose?: CodeValue;
  approvedPrincipal?: number;
  loanProductId: number;
  approvedOnDate?: string;
  loanTransactionProcessingStrategyId: number;
  loanPurposeId: number;
  principalAmountProposed?: number;
  principalDisbursedDerived?: number;
  principalRepaidDerived?: number;
  interestRepaidDerived?: number;
  loanTransactionProcessingStrategy?: LoanTransactionProcessingStrategy;
  disbursedOnDate?: string;
  loanCharges?: LoanCharge[];
  savingsAccountId?: number;
  loanArrearsAging?: LoanArrearsAging;
  createStandingInstructionsAtDisbursement: boolean;
  interestRateFrequencyTypeEnum?: "PER MONTH" | "PER YEAR" | "WHOLE TERM";
}

export interface LoanArrearsAging {
  id?: number;
  principalOverdueDerived: number;
  interestOverdueDerived: number;
  feeChargesOverdueDerived: number;
  penaltyChargesOverdueDerived: number;
  totalOverdueDerived: number;
  overdueSinceDateDerived: string;
  loanId: number;
}

export interface Job {
  id?: number;
  name: string;
  displayName: string;
  cronExpression: string;
  createTime: string;
  taskPriority: number;
  groupName?: number;
  previousRunStartTime?: string;
  nextRunTime?: string;
  jobKey?: string;
  initializingErrorLog?: string;
  isActive: boolean;
  currentlyRunning: boolean;
  updatesAllowed: boolean;
  schedulerGroup: number;
  isMisfired: boolean;
}

export interface ScheduleRow {
  month: number;
  daysBetween: number;
  date: string;
  payment: string | Big;
  principal: string | Big;
  interest: string | Big;
  balance: string | Big;
}

export interface SavingsAccount {
  id?: number;
  accountNo: string;
  externalId?: string;
  statusEnum:
    | "SUBMITTED AND AWAITING APPROVAL"
    | "APPROVED"
    | "ACTIVE"
    | "WITHDRAWN BY CLIENT"
    | "REJECTED"
    | "CLOSED"
    | "WRITTEN-OFF"
    | "RESCHEDULED"
    | "OVERPAID";
  subStatusEnum:
    | "SUBMITTED AND AWAITING APPROVAL"
    | "APPROVED"
    | "ACTIVE"
    | "WITHDRAWN BY CLIENT"
    | "REJECTED"
    | "CLOSED"
    | "WRITTEN-OFF"
    | "RESCHEDULED"
    | "OVERPAID";
  accountTypeEnum: "INVALID" | "INDIVIDUAL" | "GROUP";
  depositTypeEnum:
    | "INVALID"
    | "FIXED DEPOSIT"
    | "SAVING DEPOSIT"
    | "RECURRING DEPOSIT"
    | "CURRENT DEPOSIT";
  submittedOnDate: string;
  submittedOnUserId?: string;
  approvedOnDate?: string;
  approvedOnUserId?: number;
  rejectedOnDate?: string;
  rejectedOnUserId?: number;
  withdrawnOnDate?: string;
  withdrawnOnUserId?: number;
  activatedOnDate?: string;
  activatedOnUserId?: number;
  closedOnDate?: string;
  closedOnUserId?: number;
  currencyMultiplesOf?: number;
  nominalAnnualInterestRate: number;
  interestCompoundingPeriodEnum?:
    | "DAILY"
    | "MONTHLY"
    | "QUARTERLY"
    | "SEMI-ANNUAL"
    | "ANNUALLY";
  interestPostingPeriodEnum:
    | "DAILY"
    | "MONTHLY"
    | "QUARTERLY"
    | "BIANNUAL"
    | "ANNUALLY";
  interestCalculationTypeEnum: "DAILY BALANCE" | "AVERAGE DAILY BALANCE";
  interestCalculationDaysInYearTypeEnum: "360" | "365";
  minRequiredOpeningBalance?: number;
  lockInPeriodFrequency?: number;
  lockInPeriodFrequencyEnum?: "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
  withdrawalFeeForTransfer?: boolean;
  allowOverdraft: boolean;
  overdraftLimit?: number;
  nominalAnnualInterestRateOverdraft?: number;
  minOverdraftForInterestCalculation?: number;
  lockedInUntilDateDerived?: string;
  totalDepositsDerived?: number;
  totalWithdrawalsDerived?: number;
  totalWithdrawalFeesDerived?: number;
  totalFeesChargeDerived?: number;
  totalPenaltyChargeDerived?: number;
  totalAnnualFeesDerived?: number;
  totalInterestEarnedDerived?: number;
  totalInterestPostedDerived?: number;
  totalOverdraftInterestDerived?: number;
  totalWithholdTaxDerived?: number;
  accountBalanceDerived: number;
  minRequiredBalance?: number;
  enforceMinRequiredBalance: boolean;
  minBalanceForInterestCalculation?: number;
  startInterestCalculationDate?: string;
  onHoldFundsDerived?: number;
  version: number;
  withHoldTax: boolean;
  lastInterestCalculationDate?: string;
  totalSavingsAmountOnHold?: string;
  clientId: number;
  groupId?: number;
  group?: Group;
  savingsProductId: number;
  taxGroupId: number;
  savingsAccountCharges?: SavingsAccountCharge[];
  savingsProduct: SavingsProduct;
  client: Client;
  fieldOfficerId?: number;
  fieldOfficer: Employee;
  currencyCode: string;
  currency: Currency;
  depositAccountTermAndPreClosure: DepositAccount;
  savingsOfficerAssignmentHistories: SavingsOfficerAssignmentHistory[];
}

export interface SavingsOfficerAssignmentHistory {
  id?: number;
  startDate: string;
  endDate?: string | null;
  savingsAccountId: number;
  staffId: number;
}

export interface ErrorResponse {
  data: {
    error: {
      message?: string;
      name?: string;
      statusCode?: number;
    };
  };
}
export interface ShareAccount {
  id?: number;
  accountNo?: string;
  externalId: string;
  statusEnum:
    | "SUBMITTED AND AWAITING APPROVAL"
    | "APPROVED"
    | "ACTIVE"
    | "WITHDRAWN BY CLIENT"
    | "REJECTED"
    | "CLOSED"
    | "WRITTEN OFF"
    | "RESCHEDULED"
    | "OVERPAID";
  totalApprovedShares: number;
  totalPendingShares: number;
  submittedDate: string;
  submittedUserId?: number;
  approvedDate?: string;
  approvedUserId?: number;
  rejectedDate?: string;
  rejectedUserId?: number;
  activatedDate?: string;
  activatedUserId?: number;
  closedDate?: string;
  closedUserId?: number;
  currencyMultiplesOf?: number;
  minimumActivePeriodFrequency?: number;
  minimumActivePeriodFrequencyEnum?: string;
  lockInPeriodFrequency?: number;
  lockInPeriodFrequencyEnum?: string;
  allowDividendsInactiveClients?: boolean;
  clientId: number;
  client: Client;
  groupId: number;
  group: Group;
  shareProductId: number;
  shareProduct: ShareProduct;
  savingsAccountId: number;
  savingsAccount: SavingsAccount;
  shareAccountCharges?: ShareAccountCharge[];
  currencyCode: string;
  currency: Currency;
  unitPrice?: number;
  transaction?: {
    amount: number;
    transactionDate: unknown;
    transactionType: string;
  };
}

export interface ShareAccountCharge {
  id?: number;
  chargeTimeEnum?: "SHARE ACCOUNT ACTIVATE" | "SHARE PURCHASE" | "SHARE REDEEM";
  chargeCalculationEnum?: "FLAT" | "% APPROVED AMOUNT";
  chargePaymentModeEnum?: string;
  calculationPercentage?: number;
  calculationOnAmount?: number;
  chargeAmountOrPercentage?: number;
  amount?: number;
  amountPaidDerived?: number;
  amountWaivedDerived?: number;
  amountWrittenOffDerived?: number;
  amountOutstandingDerived?: number;
  isPaidDerived?: boolean;
  waived?: boolean;
  minCap?: number;
  maxCap?: number;
  isActive?: boolean;
  chargeId: number;
  charge: Charge;
  shareAccountId: number;
}
export interface DepositAccount extends SavingsAccount {
  id?: number;
  minDepositTerm?: number;
  maxDepositTerm?: number;
  minDepositTermTypeEnum?: string;
  maxDepositTermTypeEnum?: string;
  inMultiplesOfDepositTerm?: number;
  inMultiplesOfDepositTermTypeEnum?: string;
  preClosurePenalApplicable?: boolean;
  preClosurePenalInterest?: number;
  preClosurePenalInterestOnEnum?: string;
  depositPeriod: number;
  depositPeriodFrequencyEnum: TimeInterval;
  depositAmount?: number;
  maturityAmount?: number;
  maturityDate?: string;
  onAccountClosureEnum?: boolean;
  expectedFirstDepositOnDate?: string;
  transferInterestToLinkedAccount?: boolean;
  savingsAccountId: number;
  savingsAccount: SavingsAccount;
  submittedDate: string;
  interestPostingPeriodTypeEnum?: string;
  savingsAccountInterestRateCharts?: SavingsAccountInterestRateChart[];
}

export interface SavingsAccountInterestRateChart extends InterestRateChart {
  savingsAccountId: number;
  savingsAccountInterestRateSlabs: SavingsAccountInterestRateSlab[];
}

export interface SavingsAccountInterestRateSlab extends InterestRateSlab {
  savingsAccountInterestRateChartId: number;
}

export interface Role {
  id?: number;
  name: string;
  description: string;
  isDisabled: boolean;
  permissions?: Permission[];
}

export interface LoanProductSettingsAndTerm {
  id?: number;
  termsAndSettings?: boolean;
  amortization?: boolean;
  repaymentStrategy?: boolean;
  arrearsTolerance?: boolean;
  moratorium?: boolean;
  interestMethod?: boolean;
  interestCalculationPeriod?: boolean;
  repaidEvery?: boolean;
  numDaysOverdueBeforeMovingIntoArrears?: boolean;
}

export type LoanCycleParamTypeEnum =
  | "PRINCIPAL"
  | "NUMBER OF REPAYMENTS"
  | "NOMINAL INTEREST RATE";
export interface LoanCycle {
  id?: number;
  valueConditionTypeEnum: "EQUALS" | "GREATER THAN";
  paramTypeEnum: LoanCycleParamTypeEnum;
  borrowerCycleNumber: number;
  minValue?: number;
  defaultValue: number;
  maxValue?: number;
}

export interface LoanRepaymentSchedule {
  id?: number;
  installment: number;
  loanId: number | string;
  principalAmount: number;
  interestAmount: number;
  dueDate: string;
  disburseDate?: string;
  disbursementOn: string;
  balanceOfLoan?: number;
  approvedPrincipal?: number;
  obligationsMetOnDate?: string;
  totalPaidInAdvanceDerived?: number;
  feeChargesCompletedDerived?: number;
  feeChargesAmount?: number;
  penaltyChargesAmount?: number;
  penaltyChargesCompletedDerived?: number;
  totalPaidLateDerived?: number;
  transactionTypeEnum?:
    | "INVALID"
    | "DISBURSEMENT"
    | "REPAYMENT"
    | "CONTRA"
    | "WAIVE_INTEREST"
    | "REPAYMENT_AT_DISBURSEMENT"
    | "WRITEOFF"
    | "MARKED_FOR_RESCHEDULING"
    | "RECOVERY_REPAYMENT"
    | "WAIVE_CHARGES"
    | "ACCRUAL"
    | "INITIATE_TRANSFER"
    | "APPROVE_TRANSFER"
    | "WITHDRAW_TRANSFER"
    | "REJECT_TRANSFER"
    | "REFUND"
    | "CHARGE_PAYMENT"
    | "REFUND_FOR_ACTIVE_LOAN"
    | "INCOME_POSTING";
}

export interface Document {
  id?: number;
  name: string;
  file: File;
  type: string;
  location: string;
}

export interface LoanCollateral {
  id?: number;
  name: string;
  type: CodeValue;
  value: number;
  description?: string;
}

export interface AccountTransferDetail {
  id?: number;
  transferType?: "LOAN REPAYMENT" | "ACCOUNT TRANSFER";
  fromOfficeId: number;
  fromOffice: Office;
  toOfficeId: number;
  toOffice: Office;
  fromClient?: Client;
  fromClientId?: number;
  toClientId?: number;
  toClient?: Client;
  fromSavingsAccountId?: number;
  fromSavingsAccount?: SavingsAccount;
  toSavingsAccountId?: number;
  toSavingsAccount?: SavingsAccount;
  fromLoanAccount?: Loan;
  fromLoanAccountId?: number;
  toLoanAccountId?: number;
  toLoanAccount?: Loan;
  accountTransferStandingInstruction?: AccountTransferStandingInstruction;
}

export interface AccountTransferStandingInstruction {
  name: string;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  status: boolean;
  instructionType: "FIXED" | "DUES";
  amount?: number;
  validFrom: string;
  validTill?: string;
  recurrenceType: "PERIOD RECURRENCE" | "AS PER DUES RECURRENCE";
  recurrenceFrequency?: TimeInterval;
  recurrenceInterval?: string;
  recurrenceOnDay?: string;
  recurrenceOnMonth?: string;
  lastRunDate?: string;
  accountTransferDetailId: number;
  accountTransferDetail: AccountTransferDetail;
}

export interface Guarantor {
  id: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  relationship?: CodeValue;
  typeEnum: "CUSTOMER" | "EXTERNAL";
  dob?: string;
  client?: Client;
  isActive: boolean;
}

export interface Note {
  id?: number;
  note: string;
  createdBy: User;
  createdAt: string;
}
export interface File {
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
}
export interface BranchPerformance {
  name: string;
  loans: number;
  savings: number;
  risk: string;
}
