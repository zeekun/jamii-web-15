"use client";

import { useGet } from "@/api";
import { GLAccount } from "@/types";
import { useParams } from "next/navigation";
import { useState } from "react";

interface SearchFilterProps {
  onSearch: (filters: { [key: string]: string }) => void;
}

export default function SearchFilter({ onSearch }: SearchFilterProps) {
  const { tenantId } = useParams();
  const [filters, setFilters] = useState<{ [key: string]: string }>({
    transactionId: "",
    glAccountId: "",
    typeEnum: "",
  });
  const [glAccountSearchTerm, setGlAccountSearchTerm] = useState("");
  const [showGlAccountDropdown, setShowGlAccountDropdown] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleGlAccountSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGlAccountSearchTerm(e.target.value);
    setShowGlAccountDropdown(true); // Show dropdown when typing
  };

  const handleGlAccountSelect = (accountId: string, accountName: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      glAccountId: accountId,
    }));
    setGlAccountSearchTerm(accountName); // Show selected account name in the input
    setShowGlAccountDropdown(false); // Hide dropdown after selection
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      transactionId: "",
      glAccountId: "",
      typeEnum: "",
    });
    setGlAccountSearchTerm(""); // Clear the GL account search term
    setShowGlAccountDropdown(false); // Hide the dropdown
  };

  const {
    status: glAccountsStatus,
    data: glAccounts,
    error: glAccountsError,
  } = useGet<GLAccount[]>(
    `${tenantId}/gl-accounts?filter={"where":{"isActive":true,"manualEntriesAllowed":true}}`,
    ["gl-accounts"]
  );

  const filteredGlAccounts = glAccounts
    ? glAccounts.filter((account) =>
        account.name.toLowerCase().includes(glAccountSearchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex  gap-4 mb-4">
      {/* Transaction ID Input */}
      <input
        type="text"
        name="transactionId"
        placeholder="Transaction ID"
        value={filters.transactionId}
        onChange={handleInputChange}
        className="p-2 border rounded"
      />

      {/* GL Account Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search GL Accounts"
          value={glAccountSearchTerm}
          onChange={handleGlAccountSearchChange}
          onFocus={() => setShowGlAccountDropdown(true)} // Show dropdown on focus
          className="p-2 border rounded w-full"
        />
        {showGlAccountDropdown && glAccountsStatus === "success" && (
          <div className="absolute bg-white border rounded mt-1 w-full max-h-60 overflow-y-auto z-10">
            {filteredGlAccounts.length > 0 ? (
              filteredGlAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() =>
                    handleGlAccountSelect(`${account.id}`, account.name)
                  }
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {account.name} ({account.glCode})
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Type Enum Select */}
      <select
        name="typeEnum"
        value={filters.typeEnum}
        onChange={handleInputChange}
        className="p-2 border rounded"
      >
        <option value="">All Types</option>
        <option value="CREDIT">Credit</option>
        <option value="DEBIT">Debit</option>
      </select>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
