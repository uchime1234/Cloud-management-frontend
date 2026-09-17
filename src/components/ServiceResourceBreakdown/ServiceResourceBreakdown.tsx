// src/components/ServiceResourceBreakdown/ServiceResourceBreakdown.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import ServiceBar from './ServiceBar';
import ResourceBar from './ResourceBar';
import {
    BreakdownResponse,
    BreakdownError,
    ServiceResourceBreakdownProps,
    Resource,
} from './types';
import './ServiceResourceBreakdown.css';

const API_BASE: string =
    (import.meta as any).env?.VITE_API_URL ||
    'https://cloud-management-backend.onrender.com';

const ServiceResourceBreakdown: React.FC<ServiceResourceBreakdownProps> = ({
    accountId,
    token,
}) => {
    const [data, setData] = useState<BreakdownResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<string>('ALL');
    const [expandedResource, setExpandedResource] = useState<string | null>(null);

    // ============================================================
    // Fetch breakdown data
    // ============================================================
    const fetchBreakdown = useCallback(
        async (forceRefresh: boolean = false): Promise<void> => {
            try {
                if (forceRefresh) setRefreshing(true);
                else setLoading(true);

                const url: string = `${API_BASE}/aws/accounts/${accountId}/service-resource-breakdown/${
                    forceRefresh ? '?force_refresh=true' : ''
                }`;

                const response = await axios.get<BreakdownResponse | BreakdownError>(url, {
                    headers: { Authorization: `Token ${token}` },
                    timeout: 300000, // 5 minutes for full scan
                });

                if ('error' in response.data) {
                    setError(response.data.error);
                } else {
                    setData(response.data);
                    setError(null);
                }
            } catch (err) {
                const axiosError = err as AxiosError<BreakdownError>;
                console.error('Breakdown fetch error:', axiosError);
                setError(
                    axiosError.response?.data?.error ||
                        'Failed to load breakdown'
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [accountId, token]
    );

    // ============================================================
    // Clear cache
    // ============================================================
    const clearCache = useCallback(async (): Promise<void> => {
        const confirmed = window.confirm(
            'Clear all cached resource analysis? This will remove all AI recommendations.'
        );
        if (!confirmed) return;

        try {
            await axios.delete(
                `${API_BASE}/aws/accounts/${accountId}/service-resource-breakdown/clear/`,
                { headers: { Authorization: `Token ${token}` } }
            );
            setData(null);
            fetchBreakdown(true);
        } catch {
            alert('Failed to clear cache');
        }
    }, [accountId, token, fetchBreakdown]);

    // ============================================================
    // Initial fetch
    // ============================================================
    useEffect(() => {
        if (accountId && token) {
            fetchBreakdown(false);
        }
    }, [accountId, token, fetchBreakdown]);

    // ============================================================
    // Filter resources
    // ============================================================
    const filteredResources: Resource[] =
        data?.resources?.filter(
            (r: Resource) =>
                selectedService === 'ALL' || r.service_name === selectedService
        ) ?? [];

    // ============================================================
    // Loading
    // ============================================================
    if (loading) {
        return (
            <div className="srb-container">
                <div className="srb-loading">
                    <div className="srb-spinner" />
                    <h3>🔍 Scanning your AWS resources...</h3>
                    <p>Analyzing every resource with AI. This may take 1-2 minutes.</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // Error
    // ============================================================
    if (error) {
        return (
            <div className="srb-container">
                <div className="srb-error">
                    <h3>⚠️ Error</h3>
                    <p>{error}</p>
                    <button onClick={() => fetchBreakdown(false)}>Try Again</button>
                </div>
            </div>
        );
    }

    // ============================================================
    // Empty
    // ============================================================
    if (!data || !data.resources || data.resources.length === 0) {
        return (
            <div className="srb-container">
                <div className="srb-empty">
                    <h3>📭 No resources found</h3>
                    <p>Run a scan to discover your AWS resources.</p>
                    <button onClick={() => fetchBreakdown(true)}>Scan Now</button>
                </div>
            </div>
        );
    }

    // ============================================================
    // Main Render
    // ============================================================
    return (
        <div className="srb-container">
            {/* HEADER */}
            <div className="srb-header">
                <div className="srb-header-left">
                    <h2>📊 Service & Resource Breakdown</h2>
                    <p className="srb-subtitle">
                        {data.total_resources} resources · {data.total_services} services
                        {data.cached && ' · cached'}
                    </p>
                </div>
                <div className="srb-header-right">
                    <button
                        className="srb-btn srb-btn-refresh"
                        onClick={() => fetchBreakdown(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? '🔄 Scanning...' : '🔄 Rescan'}
                    </button>
                    <button className="srb-btn srb-btn-clear" onClick={clearCache}>
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* SUMMARY */}
            <div className="srb-summary">
                <div className="srb-summary-card">
                    <span className="srb-summary-label">Total Cost</span>
                    <span className="srb-summary-value">
                        ${data.total_monthly_cost.toFixed(2)}/mo
                    </span>
                </div>
                <div className="srb-summary-card srb-summary-savings">
                    <span className="srb-summary-label">Potential Savings</span>
                    <span className="srb-summary-value">
                        ${data.total_savings.toFixed(2)}/mo
                    </span>
                </div>
                <div className="srb-summary-card">
                    <span className="srb-summary-label">Services</span>
                    <span className="srb-summary-value">{data.total_services}</span>
                </div>
                <div className="srb-summary-card">
                    <span className="srb-summary-label">Resources</span>
                    <span className="srb-summary-value">{data.total_resources}</span>
                </div>
            </div>

            {/* SERVICE SECTION */}
            <div className="srb-section">
                <div className="srb-section-header">
                    <h3>🎯 Services</h3>
                    <button
                        className={`srb-filter-btn ${
                            selectedService === 'ALL' ? 'active' : ''
                        }`}
                        onClick={() => setSelectedService('ALL')}
                    >
                        All
                    </button>
                </div>

                <div className="srb-service-list">
                    {data.services.map((service, idx) => (
                        <ServiceBar
                            key={idx}
                            service={service}
                            isSelected={selectedService === service.service_name}
                            onClick={() =>
                                setSelectedService(
                                    selectedService === service.service_name
                                        ? 'ALL'
                                        : service.service_name
                                )
                            }
                        />
                    ))}
                </div>
            </div>

            {/* RESOURCE SECTION */}
            <div className="srb-section">
                <div className="srb-section-header">
                    <h3>
                        📦 Resources
                        {selectedService !== 'ALL' && ` — ${selectedService}`}
                    </h3>
                    <span className="srb-count">{filteredResources.length}</span>
                </div>

                <div className="srb-resource-list">
                    {filteredResources.map((resource, idx) => (
                        <ResourceBar
                            key={idx}
                            resource={resource}
                            isExpanded={
                                expandedResource === resource.resource_id
                            }
                            onToggle={() =>
                                setExpandedResource(
                                    expandedResource === resource.resource_id
                                        ? null
                                        : resource.resource_id
                                )
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceResourceBreakdown;