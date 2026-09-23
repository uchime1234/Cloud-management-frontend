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
    Region,
} from './types';
import './ServiceResourceBreakdown.css';

const API_BASE: string =
    (import.meta as any).env?.VITE_API_URL ||
    'https://cloud-management-backend.onrender.com';

const DEFAULT_REGIONS: Region[] = [
    { code: 'us-east-1', name: 'US East (N. Virginia)' },
    { code: 'us-east-2', name: 'US East (Ohio)' },
    { code: 'us-west-1', name: 'US West (N. California)' },
    { code: 'us-west-2', name: 'US West (Oregon)' },
    { code: 'ca-central-1', name: 'Canada (Central)' },
    { code: 'eu-west-1', name: 'Europe (Ireland)' },
    { code: 'eu-west-2', name: 'Europe (London)' },
    { code: 'eu-west-3', name: 'Europe (Paris)' },
    { code: 'eu-central-1', name: 'Europe (Frankfurt)' },
    { code: 'eu-north-1', name: 'Europe (Stockholm)' },
    { code: 'ap-south-1', name: 'Asia Pacific (Mumbai)' },
    { code: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' },
    { code: 'ap-southeast-2', name: 'Asia Pacific (Sydney)' },
    { code: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)' },
    { code: 'ap-northeast-2', name: 'Asia Pacific (Seoul)' },
    { code: 'sa-east-1', name: 'South America (São Paulo)' },
    { code: 'af-south-1', name: 'Africa (Cape Town)' },
    { code: 'me-south-1', name: 'Middle East (Bahrain)' },
];

const ServiceResourceBreakdown: React.FC<ServiceResourceBreakdownProps> = ({
    accountId,
    token,
}) => {
    const [data, setData] = useState<BreakdownResponse | null>(null);
    const [regions, setRegions] = useState<Region[]>(DEFAULT_REGIONS);
    const [selectedRegion, setSelectedRegion] = useState<string>('us-east-1');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [clearing, setClearing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<string>('ALL');
    const [expandedResource, setExpandedResource] = useState<string | null>(null);

    // ============================================================
    // Load region list (fallback to constants if endpoint fails)
    // ============================================================
    useEffect(() => {
        const loadRegions = async () => {
            try {
                const res = await axios.get(`${API_BASE}/aws/regions/`, {
                    headers: { Authorization: `Token ${token}` },
                    timeout: 15000,
                });
                if (res.data?.regions?.length) {
                    setRegions(res.data.regions);
                }
            } catch {
                // keep DEFAULT_REGIONS
            }
        };
        if (token) loadRegions();
    }, [token]);

    // ============================================================
    // Fetch breakdown for the selected region
    // ============================================================
    const fetchBreakdown = useCallback(
        async (forceRefresh: boolean = false): Promise<void> => {
            if (!accountId || !token) return;
            try {
                if (forceRefresh) setRefreshing(true);
                else setLoading(true);

                const params = new URLSearchParams();
                params.set('region', selectedRegion);
                if (forceRefresh) params.set('force_refresh', 'true');

                const url = `${API_BASE}/aws/accounts/${accountId}/service-resource-breakdown/?${params.toString()}`;
                const response = await axios.get<BreakdownResponse | BreakdownError>(url, {
                    headers: { Authorization: `Token ${token}` },
                    timeout: 600000, // 10 min for full multi-service scan
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
                setError(axiosError.response?.data?.error || 'Failed to load breakdown');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [accountId, token, selectedRegion]
    );

    // ============================================================
    // Clear cache — actually clears now
    // ============================================================
    const clearCache = useCallback(async (): Promise<void> => {
        const confirmed = window.confirm(
            `Clear cached resource analysis for ${selectedRegion}? You will need to rescan.`
        );
        if (!confirmed) return;

        setClearing(true);
        try {
            const url = `${API_BASE}/aws/accounts/${accountId}/service-resource-breakdown/clear/?region=${selectedRegion}`;
            const res = await axios.delete(url, {
                headers: { Authorization: `Token ${token}` },
            });
            // Wipe local state so UI immediately reflects "no data"
            setData(null);
            setError(null);
            // Re-fetch (will trigger a fresh scan since cache is now empty)
            await fetchBreakdown(true);
            console.log('Cache cleared:', res.data?.message);
        } catch (err) {
            console.error('Clear cache failed:', err);
            alert('Failed to clear cache. Please try again.');
        } finally {
            setClearing(false);
        }
    }, [accountId, token, selectedRegion, fetchBreakdown]);

    // ============================================================
    // After an action (Fix / Schedule / Dismiss) — refresh from DB
    // ============================================================
    const handleActionComplete = useCallback(
        async (_resourceId: string): Promise<void> => {
            try {
                const params = new URLSearchParams();
                params.set('region', selectedRegion);
                const url = `${API_BASE}/aws/accounts/${accountId}/service-resource-breakdown/?${params.toString()}`;
                const response = await axios.get<BreakdownResponse | BreakdownError>(url, {
                    headers: { Authorization: `Token ${token}` },
                    timeout: 60000,
                });
                if (!('error' in response.data)) {
                    setData(response.data);
                }
            } catch {
                // silent
            }
        },
        [accountId, token, selectedRegion]
    );

    // ============================================================
    // Initial fetch — runs when accountId, token, or region changes
    // ============================================================
    useEffect(() => {
        if (accountId && token) {
            fetchBreakdown(false);
        }
    }, [accountId, token, selectedRegion, fetchBreakdown]);

    // ============================================================
    // Filter resources
    // ============================================================
    const filteredResources: Resource[] =
        data?.resources?.filter(
            (r: Resource) =>
                selectedService === 'ALL' || r.service_name === selectedService
        ) ?? [];

    // ============================================================
    // Region picker (rendered in every state so users can change region even on error/empty)
    // ============================================================
    const RegionPicker = () => (
        <div className="srb-region-picker">
            <label htmlFor="srb-region">🌍 Region</label>
            <select
                id="srb-region"
                value={selectedRegion}
                onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedService('ALL');
                    setExpandedResource(null);
                }}
                disabled={refreshing || loading}
            >
                {regions.map((r) => (
                    <option key={r.code} value={r.code}>
                        {r.name} — {r.code}
                    </option>
                ))}
            </select>
        </div>
    );

    // ============================================================
    // Loading
    // ============================================================
    if (loading) {
        return (
            <div className="srb-container">
                <div className="srb-loading">
                    <div className="srb-spinner" />
                    <h3>🔍 Scanning {selectedRegion}...</h3>
                    <p>Running all AWS discovery modules. This may take 1-3 minutes.</p>
                    <RegionPicker />
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
                    <RegionPicker />
                    <button onClick={() => fetchBreakdown(true)}>Try Again</button>
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
                    <h3>📭 No resources found in {selectedRegion}</h3>
                    <p>Run a scan to discover your AWS resources.</p>
                    <RegionPicker />
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
                        {data.total_resources} resources · {data.total_services} services · {data.region}
                        {data.cached && ' · cached'}
                    </p>
                </div>
                <div className="srb-header-right">
                    <RegionPicker />
                    <button
                        className="srb-btn srb-btn-refresh"
                        onClick={() => fetchBreakdown(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? '🔄 Scanning...' : '🔄 Rescan'}
                    </button>
                    <button
                        className="srb-btn srb-btn-clear"
                        onClick={clearCache}
                        disabled={clearing || refreshing}
                    >
                        {clearing ? '🗑️ Clearing...' : '🗑️ Clear Cache'}
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
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
                            isExpanded={expandedResource === resource.resource_id}
                            onToggle={() =>
                                setExpandedResource(
                                    expandedResource === resource.resource_id
                                        ? null
                                        : resource.resource_id
                                )
                            }
                            accountId={accountId}
                            token={token}
                            onActionComplete={handleActionComplete}
                        />
                    ))}
                </div>
            </div>

            {/* AI SUMMARY (bottom) */}
            {data.summary && data.summary.ai_summary && (
                <div className="srb-ai-summary">
                    <div className="srb-ai-summary-header">
                        <span className="srb-ai-summary-icon">🤖</span>
                        <h3>AI Summary</h3>
                        {data.summary.scanned_at && (
                            <span className="srb-ai-summary-meta">
                                Scanned {new Date(data.summary.scanned_at).toLocaleString()}
                                {data.summary.scan_duration_seconds &&
                                    ` · ${data.summary.scan_duration_seconds}s`}
                                {` · ${data.summary.ai_calls_made} AI calls`}
                            </span>
                        )}
                    </div>
                    <div className="srb-ai-summary-body">
                        {data.summary.ai_summary.split('\n').map((line, i) => (
                            <p key={i}>{line || '\u00A0'}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceResourceBreakdown;