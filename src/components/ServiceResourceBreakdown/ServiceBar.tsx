// src/components/ServiceResourceBreakdown/ServiceBar.tsx

import React from 'react';
import { ServiceBarProps, ServiceStatus } from './types';

const ServiceBar: React.FC<ServiceBarProps> = ({
    service,
    isSelected,
    onClick,
}) => {
    const getStatusIcon = (status: ServiceStatus): string => {
        switch (status) {
            case 'Active':
                return '🟢';
            case 'Idle':
                return '🔴';
            case 'Partially Idle':
                return '🟡';
            default:
                return '⚪';
        }
    };

    const statusClass: string = service.status
        .toLowerCase()
        .replace(' ', '-');

    return (
        <div
            className={`srb-service-bar ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') onClick();
            }}
        >
            <div className="srb-service-name">
                <span className="srb-service-icon">
                    {getStatusIcon(service.status)}
                </span>
                <span className="srb-service-title">{service.service_name}</span>
                <span className="srb-service-category">
                    {service.service_category}
                </span>
            </div>

            <div className="srb-service-status">
                <span className={`srb-status-badge srb-status-${statusClass}`}>
                    {service.status}
                </span>
            </div>

            <div className="srb-service-count">
                {service.resource_count}{' '}
                {service.resource_count === 1 ? 'resource' : 'resources'}
            </div>

            <div className="srb-service-cost">
                ${service.monthly_cost.toFixed(2)}
                <span className="srb-cost-label">/mo</span>
            </div>

            <div className="srb-service-savings">
                {service.savings > 0 ? (
                    <>
                        Save <strong>${service.savings.toFixed(2)}</strong>
                    </>
                ) : (
                    <span className="srb-no-savings">—</span>
                )}
            </div>
        </div>
    );
};

export default ServiceBar;