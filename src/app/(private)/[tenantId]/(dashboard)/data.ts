export const tenantsData = [
  {
    id: 1,
    name: "Tenant A",
    users: 25,
    lastLogin: "2023-10-01",
    active: true,
    storageUsed: 120,
    apiCalls: 500,
  },
  {
    id: 2,
    name: "Tenant B",
    users: 10,
    lastLogin: "2023-09-28",
    active: false,
    storageUsed: 80,
    apiCalls: 300,
  },
  {
    id: 3,
    name: "Tenant C",
    users: 50,
    lastLogin: "2023-10-05",
    active: true,
    storageUsed: 200,
    apiCalls: 1000,
  },
];

export const loginActivity = [
  { date: "2023-10-01", logins: 120, failedLogins: 5 },
  { date: "2023-10-02", logins: 90, failedLogins: 3 },
  { date: "2023-10-03", logins: 150, failedLogins: 10 },
];

export const tenantActivity = [
  { name: "Tenant A", activeUsers: 25, logins: 120 },
  { name: "Tenant B", activeUsers: 10, logins: 90 },
  { name: "Tenant C", activeUsers: 50, logins: 150 },
];

export const systemMetrics = {
  totalStorageUsed: 400, // in GB
  totalApiCalls: 1800,
  systemUptime: 99.9, // in percentage
};
