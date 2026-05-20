// components/DeleteAccountModal.tsx

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Power,
  Settings,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Database,
  Server,
  HardDrive,
  Cpu,
  Activity,
  Container,
  Cloud,
  Layers,
  Globe,
  Scale,
  Key,
  MessageSquare,
  Bell,
  Package,
  Lock,
  Eye,
  Trash2,
  Lightbulb,
  Zap,
  Code,
  Box,
  Sparkles,
  FileText,
  CircuitBoard,
  Monitor,
  Shield,
  Wrench,
  Flame as Heatmap,
  Network,
  ChevronUp,
  ChevronDown,
  Filter,
  Search,
  X,
  Github,
  GitMerge,
  FolderTree,
  FileCode,
  ChevronRight,
} from "lucide-react"

import { Card } from './ui/Card';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onAccountDeleted }) => {
  const [step, setStep] = useState<'confirm' | 'type-confirm' | 'deleting' | 'done'>('confirm');
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };
  
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${getAuthToken()}`
    };
  };
  
  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }
    
    setStep('deleting');
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/delete-account/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStep('done');
        
        // Start countdown before redirecting to login
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              // Clear all tokens
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              // Notify parent and redirect
              onAccountDeleted();
              window.location.href = '/login';
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (err: any) {
      setError(err.message);
      setStep('type-confirm');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Delete Account</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {step === 'confirm' && (
            <>
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Warning: This action is irreversible!</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1 list-disc list-inside">
                  <li>All your AWS account connections</li>
                  <li>All cost and resource data</li>
                  <li>GitHub integrations and deployment history</li>
                  <li>Security scan results and findings</li>
                  <li>MFA configuration and backup codes</li>
                  <li>All personal information</li>
                </ul>
              </div>
              
              <p className="text-muted-foreground mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('type-confirm')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          )}
          
          {step === 'type-confirm' && (
            <>
              <div className="mb-4">
                <p className="text-muted-foreground mb-2">
                  To confirm account deletion, please type:
                </p>
                <code className="block p-3 bg-muted rounded-lg text-center font-mono font-bold text-red-600">
                  DELETE MY ACCOUNT
                </code>
              </div>
              
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE MY ACCOUNT here"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-4"
                autoFocus
              />
              
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Permanently Delete Account
                </button>
              </div>
            </>
          )}
          
          {step === 'deleting' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-foreground font-medium">Deleting your account...</p>
              <p className="text-sm text-muted-foreground mt-1">Please wait, this may take a moment.</p>
            </div>
          )}
          
          {step === 'done' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-foreground font-medium text-lg">Account Deleted</p>
              <p className="text-muted-foreground mt-2">
                Your account has been permanently deleted.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Redirecting to login in {countdown} seconds...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DeleteAccountModal;