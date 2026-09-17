// src/components/ServiceResourceBreakdown/ResourceBar.tsx

import React from 'react';
import AIDetailPanel from './AIDetailPanel';
import {
    ResourceBarProps,
    ResourceStatus,
    AIVerdict,
} from './types';

interface VerdictBadge {
    icon: string;
    label: string;
    className: string;
}

const ResourceBar: React.FC<ResourceBarProps> = ({
    resource,
    isExpanded,
    onToggle,
}) => {
    const getStatusIcon = (status: ResourceStatus): string => {
        switch (status) {
            case 'ON':
                return '🟢';
            case 'OFF':
            case 'STOPPED':
                return '⚪';
            default:
                return '⚪';
        }
    };

    const getVerdictBadge = (verdict: AIVerdict): VerdictBadge => {
        const map: Record<AIVerdict, VerdictBadge> = {
            LEAVE_IT: {
                icon: '🟢',
                label: 'LEAVE IT',
                className: 'verdict-leave',
            },
            MONITOR_IT: {
                icon: '🟡',
                label: 'MONITOR IT',
                className: 'verdict-monitor',
            },
            SCHEDULE_IT: {
                icon: '🔵',
                label: 'SCHEDULE IT',
                className: 'verdict-schedule',
            },
            DOWNSIZE_IT: {
                icon: '🟠',
                label: 'DOWNSIZE IT',
                className: 'verdict-downsize',
            },
            STOP_IT: {
                icon: '🔴',
                label: 'STOP IT',
                className: 'verdict-stop',
            },
            TERMINATE_IT: {
                icon: '⚫',
                label: 'TERMINATE IT',
                className: 'verdict-terminate',
            },
        };
        return map[verdict];
    };

    const formatDate = (iso: string | null): string => {
        if (!iso) return 'N/A';
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const badge: VerdictBadge = getVerdictBadge(resource.ai_verdict);

    return (
        <div
            className={`srb-resource-wrapper ${
                isExpanded ? 'expanded' : ''
            }`}
        >
            <div
                className="srb-resource-bar"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') onToggle();
                }}
            >
                <div className="srb-resource-id">
                    <span className="srb-resource-status">
                        {getStatusIcon(resource.status)}
                    </span>
                    <div className="srb-resource-id-block">
                        <span className="srb-resource-name">
                            {resource.resource_id}
                        </span>
                        <span className="srb-resource-type">
                            {resource.resource_type}
                        </span>
                    </div>
                </div>

                <div className="srb-resource-status-cell">
                    {resource.status}
                </div>

                <div className="srb-resource-cpu">
                    {resource.cpu_avg.toFixed(1)}%
                </div>

                <div className="srb-resource-onsince">
                    {formatDate(resource.on_since)}
                </div>

                <div className="srb-resource-cost">
                    ${resource.monthly_cost.toFixed(2)}
                </div>

                <div
                    className={`srb-resource-verdict ${badge.className}`}
                >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                </div>

                <div className="srb-resource-arrow">
                    {isExpanded ? '▲' : '▼'}
                </div>
            </div>

            {isExpanded && <AIDetailPanel resource={resource} />}
        </div>
    );
};

export default ResourceBar;