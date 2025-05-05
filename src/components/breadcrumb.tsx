import { get } from "@/api";
import { Tenant } from "@/types";
import { SearchOutlined } from "@ant-design/icons";
import { UseQueryResult } from "@tanstack/react-query";
import { Button, Select } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Breadcrumbs(props: {
  tenantId: string | string[];
  tenantName: string;
  userTenants: UseQueryResult<Tenant[], Error>;
}) {
  const { tenantId, tenantName, userTenants } = props;
  const [showSearchList, setShowSearchList] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleBlur = () => {
    setShowSearch(false);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  const handleSearch = async (value: string) => {
    if (value.trim().length <= 2) {
      // Clear options if input length is <= 2
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      // Construct the filter object
      const filter = {
        where: {
          name: {
            like: `%${value}%`,
          },
        },
      };

      // Encode the filter as a URI component
      const encodedFilter = encodeURIComponent(JSON.stringify(filter));

      // Send the request with the properly encoded filter
      const response = await get(`${tenantId}/tenants?filter=${encodedFilter}`);
      const fetchedOptions = response.data;

      setOptions(
        fetchedOptions.map((option: { id: string | number; name: string }) => ({
          value: option.id,
          label: option.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value: string) => {
    const currentPathSegments = pathname.split("/").filter(Boolean);

    // Always redirect to the new tenant path, regardless of the number of segments
    const newPath = `/${value}${
      currentPathSegments.length > 1
        ? `/${currentPathSegments.slice(1).join("/")}`
        : ""
    }`;
    router.push(newPath); // Navigate to the new path
  };

  const BreadcrumbsArray = pathname.split("/");
  BreadcrumbsArray.shift();
  BreadcrumbsArray.splice(0, 1);

  useEffect(() => {
    if (userTenants.status === "success") {
      if (userTenants.data.length > 1) {
        setShowSearchList(true);
      } else {
        setShowSearchList(false);
      }
    }
  }, [userTenants]);

  return (
    <>
      <ul className="breadcrumbs flex gap-2 text-black">
        {showSearchList && (
          <li className="flex gap-1">
            {!showSearch && (
              <Button
                size="small"
                icon={<SearchOutlined />}
                onClick={toggleSearch}
                className="fade-in"
                title="Search Accounts"
              />
            )}
            {showSearch && (
              <Select
                allowClear
                showSearch
                size="small"
                autoFocus
                onBlur={handleBlur}
                onSearch={handleSearch}
                onSelect={handleSelect} // Redirect when an option is selected
                options={options} // Set fetched options here
                loading={loading} // Show loading spinner while fetching
                className="fade-in w-96"
                placeholder="Search Accounts..."
                defaultActiveFirstOption // Automatically highlight the first option
                notFoundContent={loading ? "Loading..." : "No results found"} // Display dynamic content
                filterOption={false} // Disable default filtering to use fetched options as-is
              />
            )}
          </li>
        )}

        <li>
          {BreadcrumbsArray[0] !== "" && BreadcrumbsArray.length > 0 ? (
            <Link
              href={`/${tenantId}`}
              className="text-blue-600 hover:underline capitalize"
            >
              [ {tenantName.trim()} ]
            </Link>
          ) : (
            <span className="capitalize">[ {tenantName.trim()} ]</span>
          )}
        </li>
        <li>
          {BreadcrumbsArray[0] !== "" && BreadcrumbsArray.length > 0 && (
            <h4> {">"} </h4>
          )}
        </li>

        {BreadcrumbsArray[0] !== undefined &&
          BreadcrumbsArray.map((item, index) => {
            const href =
              "/" +
              tenantId +
              "/" +
              BreadcrumbsArray.slice(0, index + 1).join("/");
            return (
              <React.Fragment key={index}>
                <li>
                  {index != BreadcrumbsArray.length - 1 ? (
                    <Link
                      href={href}
                      className="capitalize text-blue-600 hover:underline"
                    >
                      {item.replace(/-/g, " ")}
                    </Link>
                  ) : (
                    <span className="capitalize">
                      {item.replace(/-/g, " ")}
                    </span>
                  )}
                </li>
                <li>
                  {index < BreadcrumbsArray.length - 1 && <h4> {">"} </h4>}
                </li>
              </React.Fragment>
            );
          })}
      </ul>
    </>
  );
}
