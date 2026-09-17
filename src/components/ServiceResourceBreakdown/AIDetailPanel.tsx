// src/components/ServiceResourceBreakdown/AIDetailPanel.tsx

import React from 'react';
import {
    AIDetailPanelProps,
    AIVerdict,
    RiskLevel,
} from './types';

const AIDetailPanel: React.FC<AIDetailPanelProps> = ({ resource }) => {
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

    return (
        <div className="srb-ai-panel">
            {/* HEADER */}
            <div
                className={`srb-ai-header ${getVerdictClass(
                    resource.ai_verdict
                )}`}
            >
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
            <div className="srb-ai-reason-short">
                {resource.ai_short_reason}
            </div>

            {/* WHY (LONG) */}
            <div className="srb-ai-section">
                <h4>📊 Why</h4>
                <p>{resource.ai_detailed_explanation}</p>
            </div>

            {/* IMPACT */}
            <div className="srb-ai-section">
                <h4>💰 Impact</h4>
                <div className="srb-ai-impact-grid">
                    <div className="srb-ai-impact-item">
                        <span className="srb-ai-impact-label">
                            Current Cost
                        </span>
                        <span className="srb-ai-impact-value">
                            ${resource.monthly_cost.toFixed(2)}/mo
                        </span>
                    </div>
                    <div className="srb-ai-impact-item">
                        <span className="srb-ai-impact-label">
                            Monthly Savings
                        </span>
                        <span className="srb-ai-impact-value srb-savings">
                            ${resource.ai_savings_monthly.toFixed(2)}
                        </span>
                    </div>
                    <div className="srb-ai-impact-item">
                        <span className="srb-ai-impact-label">
                            Yearly Savings
                        </span>
                        <span className="srb-ai-impact-value srb-savings">
                            ${resource.ai_savings_yearly.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* RISK */}
            <div className="srb-ai-section">
                <h4>⚠️ Risk</h4>
                <span
                    className={`srb-ai-risk-badge ${getRiskColor(
                        resource.ai_risk
                    )}`}
                >
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
            {resource.ai_alternatives &&
                resource.ai_alternatives.length > 0 && (
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
                        ⏱️ Time to fix:{' '}
                        <strong>{resource.ai_time_to_fix}</strong>
                    </span>
                )}
                {resource.on_since && (
                    <span className="srb-ai-footer-item">
                        🕐 On since:{' '}
                        <strong>
                            {new Date(resource.on_since).toLocaleString()}
                        </strong>
                    </span>
                )}
                {resource.last_checked && (
                    <span className="srb-ai-footer-item">
                        🔄 Last checked:{' '}
                        <strong>
                            {new Date(resource.last_checked).toLocaleString()}
                        </strong>
                    </span>
                )}
            </div>

            {/* ACTIONS */}
            {resource.ai_one_click_available && (
                <div className="srb-ai-actions">
                    <button className="srb-action-btn srb-action-primary">
                        🚀 Fix Now
                    </button>
                    <button className="srb-action-btn">📅 Schedule</button>
                    <button className="srb-action-btn srb-action-dismiss">
                        ❌ Dismiss
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIDetailPanel;