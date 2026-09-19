// src/components/ServiceResourceBreakdown/AIDetailPanel.tsx

import React, { useState } from 'react';
import {
    AIDetailPanelProps,
    AIVerdict,
    RiskLevel,
} from './types';

interface AIDetailPanelExtendedProps extends AIDetailPanelProps {
    accountId: string | number;
    token: string;
    onActionComplete?: (resourceId: string) => void;
}

const API_BASE: string =
    (import.meta as any).env?.VITE_API_URL ||
    'https://cloud-management-backend.onrender.com';

const AIDetailPanel: React.FC<AIDetailPanelExtendedProps> = ({
    resource,
    accountId,
    token,
    onActionComplete,
}) => {
    const [busy, setBusy] = useState<null | 'fix' | 'schedule' | 'dismiss'>(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleStart, setScheduleStart] = useState('');
    const [scheduleEnd, setScheduleEnd] = useState('');
    const [feedback, setFeedback] = useState<{
        kind: 'success' | 'error' | 'info';
        message: string;
        manualSteps?: string[];
    } | null>(null);

    const getRiskColor = (risk: RiskLevel): string => {
        const map: Record<RiskLevel, string> = {
            ZERO: 'risk-zero',
            LOW: 'risk-low',
            MEDIUM: 'risk-medium',
            HIGH: 'risk-high',
        };
        return map[risk];
    };

    const getVerdictClass = (verdict: AIVerdict): string => {
        const map: Record<AIVerdict, string> = {
            LEAVE_IT: 'verdict-leave',
            MONITOR_IT: 'verdict-monitor',
            SCHEDULE_IT: 'verdict-schedule',
            DOWNSIZE_IT: 'verdict-downsize',
            STOP_IT: 'verdict-stop',
            TERMINATE_IT: 'verdict-terminate',
        };
        return map[verdict];
    };

    const postAction = async (payload: Record<string, unknown>) => {
        const res = await fetch(
            `${API_BASE}/aws/accounts/${accountId}/resources/${encodeURIComponent(
                resource.resource_id
            )}/action/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err: any = new Error(data.error || data.message || 'Action failed');
            err.data = data;
            throw err;
        }
        return data;
    };

    const handleFix = async () => {
        setBusy('fix');
        setFeedback(null);
        try {
            const data = await postAction({ action: 'fix' });
            setFeedback({
                kind: 'success',
                message: data.message || `Fix applied to ${resource.resource_id}`,
            });
            onActionComplete?.(resource.resource_id);
        } catch (err: any) {
            const data = err?.data || {};
            setFeedback({
                kind: 'error',
                message: data.message || err.message || 'Fix failed',
                manualSteps: data.manual_steps,
            });
        } finally {
            setBusy(null);
        }
    };

    const handleDismiss = async () => {
        if (!window.confirm(`Dismiss the recommendation for ${resource.resource_id}?`)) {
            return;
        }
        setBusy('dismiss');
        setFeedback(null);
        try {
            const data = await postAction({ action: 'dismiss' });
            setFeedback({
                kind: 'info',
                message: data.message || 'Dismissed',
            });
            onActionComplete?.(resource.resource_id);
        } catch (err: any) {
            setFeedback({
                kind: 'error',
                message: err.message || 'Dismiss failed',
            });
        } finally {
            setBusy(null);
        }
    };

    const handleScheduleSubmit = async () => {
        if (!scheduleStart || !scheduleEnd) {
            setFeedback({ kind: 'error', message: 'Please pick a start and end time.' });
            return;
        }
        if (new Date(scheduleEnd) <= new Date(scheduleStart)) {
            setFeedback({ kind: 'error', message: 'End time must be after start time.' });
            return;
        }

        setBusy('schedule');
        setFeedback(null);
        try {
            const data = await postAction({
                action: 'schedule',
                schedule_start: new Date(scheduleStart).toISOString(),
                schedule_end: new Date(scheduleEnd).toISOString(),
            });
            setFeedback({
                kind: 'success',
                message: data.message || 'Schedule saved',
            });
            setShowSchedule(false);
            setScheduleStart('');
            setScheduleEnd('');
            onActionComplete?.(resource.resource_id);
        } catch (err: any) {
            setFeedback({
                kind: 'error',
                message: err.message || 'Schedule failed',
            });
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="srb-ai-panel">
            {/* HEADER */}
            <div className={`srb-ai-header ${getVerdictClass(resource.ai_verdict)}`}>
                <div className="srb-ai-verdict">
                    <span className="srb-ai-icon">🤖</span>
                    <span className="srb-ai-verdict-text">
                        {resource.ai_verdict.replace('_', ' ')}
                    </span>
                </div>
                <div className="srb-ai-priority">
                    Priority: <strong>{resource.ai_priority}/10</strong>
                </div>
            </div>

            {/* SHORT REASON */}
            <div className="srb-ai-reason-short">{resource.ai_short_reason}</div>

            {/* WHY */}
            <div className="srb-ai-section">
                <h4>📊 Why</h4>
                <p>{resource.ai_detailed_explanation}</p>
            </div>

            {/* IMPACT */}
            <div className="srb-ai-section">
                <h4>💰 Impact</h4>
                <div className="srb-ai-impact-grid">
                    <div className="srb-ai-impact-item">
                        <span className="srb-ai-impact-label">Current Cost</span>
                        <span className="srb-ai-impact-value">
                            ${resource.monthly_cost.toFixed(2)}/mo
                        </span>
                    </div>
                    <div className="srb-ai-impact-item">
                        <span className="srb-ai-impact-label">Monthly Savings</span>
                        <span className="srb-ai-impact-value srb-savings">
                            ${resource.ai_savings_monthly.toFixed(2)}
                        </span>
                    </div>
                    <div className="srb-ai-impact-item">
                        <span className="srb-ai-impact-label">Yearly Savings</span>
                        <span className="srb-ai-impact-value srb-savings">
                            ${resource.ai_savings_yearly.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* RISK */}
            <div className="srb-ai-section">
                <h4>⚠️ Risk</h4>
                <span className={`srb-ai-risk-badge ${getRiskColor(resource.ai_risk)}`}>
                    {resource.ai_risk} RISK
                </span>
            </div>

            {/* STEPS */}
            {resource.ai_steps && resource.ai_steps.length > 0 && (
                <div className="srb-ai-section">
                    <h4>🎯 Recommended Steps</h4>
                    <ol className="srb-ai-steps">
                        {resource.ai_steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                        ))}
                    </ol>
                </div>
            )}

            {/* ALTERNATIVES */}
            {resource.ai_alternatives && resource.ai_alternatives.length > 0 && (
                <div className="srb-ai-section">
                    <h4>💡 Alternatives</h4>
                    <ul className="srb-ai-alternatives">
                        {resource.ai_alternatives.map((alt, idx) => (
                            <li key={idx}>{alt}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* FOOTER */}
            <div className="srb-ai-footer">
                {resource.ai_time_to_fix && (
                    <span className="srb-ai-footer-item">
                        ⏱️ Time to fix: <strong>{resource.ai_time_to_fix}</strong>
                    </span>
                )}
                {resource.on_since && (
                    <span className="srb-ai-footer-item">
                        🕐 On since:{' '}
                        <strong>{new Date(resource.on_since).toLocaleString()}</strong>
                    </span>
                )}
                {resource.last_checked && (
                    <span className="srb-ai-footer-item">
                        🔄 Last checked:{' '}
                        <strong>{new Date(resource.last_checked).toLocaleString()}</strong>
                    </span>
                )}
            </div>

            {/* FEEDBACK */}
            {feedback && (
                <div
                    className={`srb-ai-feedback srb-feedback-${feedback.kind}`}
                    style={{
                        marginTop: 16,
                        padding: '12px 14px',
                        borderRadius: 8,
                        background:
                            feedback.kind === 'success'
                                ? '#ecfdf5'
                                : feedback.kind === 'error'
                                ? '#fef2f2'
                                : '#eff6ff',
                        color:
                            feedback.kind === 'success'
                                ? '#047857'
                                : feedback.kind === 'error'
                                ? '#b91c1c'
                                : '#1d4ed8',
                        fontSize: 14,
                    }}
                >
                    <div>{feedback.message}</div>
                    {feedback.manualSteps && feedback.manualSteps.length > 0 && (
                        <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                            {feedback.manualSteps.map((s, i) => (
                                <li key={i} style={{ marginBottom: 4 }}>{s}</li>
                            ))}
                        </ol>
                    )}
                </div>
            )}

            {/* SCHEDULE FORM */}
            {showSchedule && (
                <div
                    className="srb-ai-schedule-form"
                    style={{
                        marginTop: 16,
                        padding: 16,
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <h4 style={{ margin: 0, marginBottom: 12 }}>📅 Schedule this resource</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <label style={{ fontSize: 13, color: '#475569' }}>
                            Start
                            <input
                                type="datetime-local"
                                value={scheduleStart}
                                onChange={(e) => setScheduleStart(e.target.value)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    marginTop: 4,
                                    padding: '8px 10px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                }}
                            />
                        </label>
                        <label style={{ fontSize: 13, color: '#475569' }}>
                            End
                            <input
                                type="datetime-local"
                                value={scheduleEnd}
                                onChange={(e) => setScheduleEnd(e.target.value)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    marginTop: 4,
                                    padding: '8px 10px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                }}
                            />
                        </label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button
                                type="button"
                                onClick={handleScheduleSubmit}
                                disabled={busy === 'schedule'}
                                className="srb-action-btn srb-action-primary"
                            >
                                {busy === 'schedule' ? 'Saving…' : 'Save Schedule'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSchedule(false);
                                    setScheduleStart('');
                                    setScheduleEnd('');
                                    setFeedback(null);
                                }}
                                className="srb-action-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIONS */}
            {resource.ai_one_click_available && (
                <div className="srb-ai-actions">
                    <button
                        className="srb-action-btn srb-action-primary"
                        onClick={handleFix}
                        disabled={busy !== null}
                    >
                        {busy === 'fix' ? '🚀 Applying…' : '🚀 Fix Now'}
                    </button>
                    <button
                        className="srb-action-btn"
                        onClick={() => {
                            setShowSchedule((v) => !v);
                            setFeedback(null);
                        }}
                        disabled={busy !== null}
                    >
                        📅 {showSchedule ? 'Close Schedule' : 'Schedule'}
                    </button>
                    <button
                        className="srb-action-btn srb-action-dismiss"
                        onClick={handleDismiss}
                        disabled={busy !== null}
                    >
                        {busy === 'dismiss' ? 'Dismissing…' : '❌ Dismiss'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIDetailPanel;