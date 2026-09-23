// src/components/ServiceResourceBreakdown/types.ts

export type AIVerdict =
    | 'LEAVE_IT'
    | 'MONITOR_IT'
    | 'SCHEDULE_IT'
    | 'DOWNSIZE_IT'
    | 'STOP_IT'
    | 'TERMINATE_IT';

export type RiskLevel = 'ZERO' | 'LOW' | 'MEDIUM' | 'HIGH';

export type ResourceStatus = 'ON' | 'OFF' | 'STOPPED' | 'UNKNOWN';

export type ServiceStatus = 'Active' | 'Idle' | 'Partially Idle' | 'Unknown';

export interface Resource {
    resource_id: string;
    resource_name: string;
    resource_type: string;
    region: string;
    service_name: string;
    service_category?: string;
    status: ResourceStatus;
    on_since: string | null;
    last_checked: string | null;
    cpu_avg: number;
    monthly_cost: number;
    ai_verdict: AIVerdict;
    ai_short_reason: string;
    ai_detailed_explanation: string;
    ai_savings_monthly: number;
    ai_savings_yearly: number;
    ai_risk: RiskLevel;
    ai_steps: string[];
    ai_alternatives: string[];
    ai_time_to_fix: string;
    ai_one_click_available: boolean;
    ai_priority: number;
    tags: Record<string, string>;
    resource_details: Record<string, unknown>;
}

export interface Service {
    service_name: string;
    service_category: string;
    status: ServiceStatus;
    resource_count: number;
    monthly_cost: number;
    savings: number;
    resources: Resource[];
}

export interface TopFinding {
    title: string;
    verdict: AIVerdict;
    cost: number;
    savings: number;
}

export interface BreakdownSummaryBlock {
    ai_summary: string;
    top_findings: TopFinding[];
    scan_duration_seconds: number | null;
    ai_calls_made: number;
    ai_calls_skipped: number;
    scanned_at: string | null;
}

export interface BreakdownResponse {
    success: boolean;
    cached: boolean;
    region: string;
    total_services: number;
    total_resources: number;
    total_monthly_cost: number;
    total_savings: number;
    services: Service[];
    resources: Resource[];
    summary: BreakdownSummaryBlock;
    last_scan: string;
}

export interface BreakdownError {
    error: string;
}

export interface ServiceResourceBreakdownProps {
    accountId: string | number;
    token: string;
}

export interface ServiceBarProps {
    service: Service;
    isSelected: boolean;
    onClick: () => void;
}

export interface ResourceBarProps {
    resource: Resource;
    isExpanded: boolean;
    onToggle: () => void;
    accountId: string | number;
    token: string;
    onActionComplete?: (resourceId: string) => void;
}

export interface AIDetailPanelProps {
    resource: Resource;
    accountId: string | number;
    token: string;
    onActionComplete?: (resourceId: string) => void;
}

export interface Region {
    code: string;
    name: string;
}