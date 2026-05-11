export const mockProviderCosts = {
  aws: {
    totalSpend: 45_234.56,
    monthlyChange: 12.5,
    services: [
      { name: "EC2", cost: 15_234.12, percentage: 33.7 },
      { name: "S3", cost: 8_456.34, percentage: 18.7 },
      { name: "RDS", cost: 7_234.56, percentage: 16.0 },
      { name: "Lambda", cost: 5_123.45, percentage: 11.3 },
      { name: "CloudFront", cost: 4_567.89, percentage: 10.1 },
      { name: "Other", cost: 4_618.2, percentage: 10.2 },
    ],
    dailySpend: [
      { date: "12/09", amount: 1_456 },
      { date: "12/10", amount: 1_523 },
      { date: "12/11", amount: 1_389 },
      { date: "12/12", amount: 1_612 },
      { date: "12/13", amount: 1_478 },
      { date: "12/14", amount: 1_534 },
      { date: "12/15", amount: 1_598 },
    ],
    forecast: { sevenDay: 10_856, thirtyDay: 46_780 },
    anomalies: [
      { service: "EC2", date: "12/12", amount: 2_456, expected: 1_523, severity: "high" },
      { service: "Lambda", date: "12/14", amount: 876, expected: 512, severity: "medium" },
    ],
    idleResources: [
      { type: "EC2 Instance", id: "i-0abc123", monthlyCost: 145.6, idle: "7 days" },
      { type: "EBS Volume", id: "vol-xyz789", monthlyCost: 89.2, idle: "14 days" },
      { type: "Elastic IP", id: "eipalloc-456", monthlyCost: 3.6, idle: "30 days" },
    ],
    regions: [
      { name: "us-east-1", cost: 18_234, percentage: 40.3 },
      { name: "us-west-2", cost: 12_456, percentage: 27.5 },
      { name: "eu-west-1", cost: 8_934, percentage: 19.7 },
      { name: "ap-southeast-1", cost: 5_610, percentage: 12.5 },
    ],
  },
  azure: {
    totalSpend: 32_456.78,
    monthlyChange: -5.2,
    services: [
      { name: "Virtual Machines", cost: 12_345.67, percentage: 38.0 },
      { name: "Storage", cost: 6_789.12, percentage: 20.9 },
      { name: "SQL Database", cost: 5_234.56, percentage: 16.1 },
      { name: "App Service", cost: 4_123.45, percentage: 12.7 },
      { name: "Networking", cost: 2_345.67, percentage: 7.2 },
      { name: "Other", cost: 1_618.31, percentage: 5.1 },
    ],
  },
  gcp: {
    totalSpend: 28_123.45,
    monthlyChange: 8.7,
    services: [
      { name: "Compute Engine", cost: 10_234.56, percentage: 36.4 },
      { name: "Cloud Storage", cost: 5_678.9, percentage: 20.2 },
      { name: "BigQuery", cost: 4_567.89, percentage: 16.2 },
      { name: "Cloud Run", cost: 3_456.78, percentage: 12.3 },
      { name: "Cloud SQL", cost: 2_345.67, percentage: 8.3 },
      { name: "Other", cost: 1_839.65, percentage: 6.6 },
    ],
  },
}
