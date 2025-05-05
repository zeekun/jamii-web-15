"use client";
import { Collapse, Input, Spin, Tag, List, Button } from "antd";
import { useState, useMemo } from "react";
import { GLAccount } from "@/types";
import { EyeOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

const { Search } = Input;
const { Panel } = Collapse;

export default function GLAccountByTypeCollapseView(props: {
  data: GLAccount[];
  loading: boolean;
  onViewAccount?: (account: GLAccount) => void;
}) {
  const { data = [], loading, onViewAccount } = props;
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const { tenantId } = useParams();

  // Group accounts by their type
  const accountsByType = useMemo(() => {
    const groups: Record<string, GLAccount[]> = {};

    if (Array.isArray(data)) {
      data.forEach((account) => {
        if (account && account.type && account.type.codeValue) {
          const type = account.type.codeValue;
          if (!groups[type]) {
            groups[type] = [];
          }
          groups[type].push(account);
        }
      });
    }

    return groups;
  }, [data]);

  // Filter accounts based on search
  const filteredAccountsByType = useMemo(() => {
    if (!searchValue) return accountsByType;

    const lowerSearch = searchValue.toLowerCase();
    const result: Record<string, GLAccount[]> = {};

    Object.entries(accountsByType).forEach(([type, accounts]) => {
      const filtered = accounts.filter(
        (account) =>
          account.name.toLowerCase().includes(lowerSearch) ||
          account.glCode.toLowerCase().includes(lowerSearch) ||
          (account.parent?.name?.toLowerCase()?.includes(lowerSearch) ?? false)
      );

      if (filtered.length > 0) {
        result[type] = filtered;
      }
    });

    return result;
  }, [accountsByType, searchValue]);

  // Group accounts by parent within each type
  const organizeAccountHierarchy = (accounts: GLAccount[]) => {
    // First, identify all root accounts (those without parents)
    const rootAccounts: GLAccount[] = accounts.filter(
      (account) => !account.parent
    );

    // Then, create a map of parent GLCode to child accounts
    const childrenMap: Record<string, GLAccount[]> = {};

    accounts.forEach((account) => {
      if (account.parent && account.parent.glCode) {
        const parentGlCode = account.parent.glCode;
        if (!childrenMap[parentGlCode]) {
          childrenMap[parentGlCode] = [];
        }
        childrenMap[parentGlCode].push(account);
      }
    });

    return { rootAccounts, childrenMap };
  };

  // Handle view account button click
  const handleViewAccount = (e: React.MouseEvent, account: GLAccount) => {
    console.log;
    e.stopPropagation(); // Prevent panel expansion/collapse

    router.push(`/${tenantId}/accounting/chart-of-accounts/${account.id}`);
    if (onViewAccount) {
      onViewAccount(account);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search..."
          allowClear
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-1/4"
        />
      </div>

      {loading ? (
        <Spin tip="Loading accounts..." />
      ) : (
        <Collapse defaultActiveKey={[]}>
          {Object.entries(filteredAccountsByType).map(([type, accounts]) => {
            const { rootAccounts, childrenMap } =
              organizeAccountHierarchy(accounts);

            return (
              <Panel
                key={type}
                header={
                  <div className="panel-header">
                    <Tag color="blue">{type}</Tag>
                    <span className="account-count">
                      {accounts.length} accounts
                    </span>
                  </div>
                }
              >
                {/* Second level collapse for account names */}
                <Collapse defaultActiveKey={[]}>
                  {rootAccounts.map((account) => {
                    const children = childrenMap[account.glCode] || [];
                    const hasChildren = children.length > 0;

                    return (
                      <Panel
                        key={account.glCode}
                        showArrow={hasChildren}
                        header={
                          <div className="account-header">
                            <span className="gl-code">{account.glCode}</span>
                            <span className="account-name">{account.name}</span>
                            {hasChildren && (
                              <span className="account-count">
                                {children.length} accounts
                              </span>
                            )}
                            <span
                              className={`status ${
                                account.isActive ? "active" : "inactive"
                              }`}
                            >
                              {account.isActive ? "Active" : "Inactive"}
                            </span>
                            {account.manualEntriesAllowed && (
                              <Tag color="orange">Manual Entries</Tag>
                            )}
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={(e) => handleViewAccount(e, account)}
                              className="view-button"
                              size="small"
                            >
                              View
                            </Button>
                          </div>
                        }
                      >
                        {/* Display child accounts (not collapsible) */}
                        {hasChildren && (
                          <div className="child-accounts">
                            {children.map((childAccount) => (
                              <div
                                className="child-account-item"
                                key={childAccount.glCode}
                              >
                                <div className="account-content">
                                  <span className="gl-code">
                                    {childAccount.glCode}
                                  </span>
                                  <span className="account-name">
                                    {childAccount.name}
                                  </span>
                                  <span
                                    className={`status ${
                                      childAccount.isActive
                                        ? "active"
                                        : "inactive"
                                    }`}
                                  >
                                    {childAccount.isActive
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                  {childAccount.manualEntriesAllowed && (
                                    <Tag color="orange">Manual Entries</Tag>
                                  )}
                                  <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={(e) =>
                                      handleViewAccount(e, childAccount)
                                    }
                                    className="view-button"
                                    size="small"
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Panel>
                    );
                  })}
                </Collapse>
              </Panel>
            );
          })}
        </Collapse>
      )}

      <style jsx>{`
        .gl-account-type-collapse {
          padding: 20px;
          background: #fff;
          border-radius: 4px;
        }
        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .account-count {
          color: #888;
          font-size: 12px;
          margin-left: 8px;
        }
        .account-header {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .account-content {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 0;
        }
        .gl-code {
          font-weight: bold;
          min-width: 80px;
        }
        .account-name {
          flex: 1;
        }
        .status {
          margin-right: 8px;
        }
        .status.active {
          color: #52c41a;
        }
        .status.inactive {
          color: #ff4d4f;
        }
        .child-accounts {
          margin-left: 16px;
          border-left: 1px solid #f0f0f0;
          padding-left: 16px;
        }
        .child-account-item {
          margin: 8px 0;
          background-color: #fafafa;
          padding: 8px 12px;
          border-radius: 4px;
        }
        .view-button {
          margin-left: auto;
        }
      `}</style>
    </div>
  );
}
