'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Moon,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Unplug,
  RefreshCw,
  Server
} from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function SettingsDialog({
  isOpen,
  onClose,
  workspace,
  onUpdateWorkspace,
  onDisconnect,
  onResetWorkspace
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || 'Personal Workspace');
  const [workspaceIcon, setWorkspaceIcon] = useState(workspace?.icon || '🚀');
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [loadingConn, setLoadingConn] = useState(false);
  const [savingWs, setSavingWs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Clear workspace confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInput, setClearInput] = useState('');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name || 'Personal Workspace');
      setWorkspaceIcon(workspace.icon || '🚀');
    }
  }, [workspace]);

  useEffect(() => {
    if (isOpen) {
      fetchConnectionStatus();
    }
  }, [isOpen]);

  const fetchConnectionStatus = async () => {
    setLoadingConn(true);
    try {
      const res = await fetch('/api/connection');
      const data = await res.json();
      setConnectionInfo(data);
    } catch (err) {
      console.error('Error fetching connection status:', err);
    } finally {
      setLoadingConn(false);
    }
  };

  const handleSaveWorkspace = async () => {
    setSavingWs(true);
    try {
      const res = await fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName, icon: workspaceIcon })
      });
      const data = await res.json();
      if (res.ok && data.workspace) {
        onUpdateWorkspace(data.workspace);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to update workspace:', err);
    } finally {
      setSavingWs(false);
    }
  };

  const handleClearWorkspaceData = async () => {
    if (clearInput !== 'CLEAR') return;
    setClearing(true);
    try {
      const res = await fetch('/api/workspace', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'CLEAR' })
      });
      const data = await res.json();
      if (res.ok) {
        setShowClearConfirm(false);
        setClearInput('');
        if (onResetWorkspace) onResetWorkspace(data.workspace);
        onClose();
      }
    } catch (err) {
      console.error('Failed to clear workspace data:', err);
    } finally {
      setClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2f2f2f]">
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-[#808080]" />
              <h3 className="text-base font-semibold text-[#ebebeb]">Workspace Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Tabs sidebar */}
            <div className="w-44 border-r border-[#2f2f2f] p-3 space-y-1 bg-[#1a1a1a]">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  activeTab === 'general'
                    ? 'bg-white/10 text-white'
                    : 'text-[#808080] hover:text-[#ebebeb] hover:bg-white/5'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveTab('connection')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  activeTab === 'connection'
                    ? 'bg-white/10 text-white'
                    : 'text-[#808080] hover:text-[#ebebeb] hover:bg-white/5'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Database</span>
              </button>

              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-white/10 text-white'
                    : 'text-[#808080] hover:text-[#ebebeb] hover:bg-white/5'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Theme</span>
              </button>

              <button
                onClick={() => setActiveTab('danger')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                  activeTab === 'danger'
                    ? 'bg-red-500/10 text-red-400'
                    : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/5'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Danger Zone</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-[#ebebeb]">Workspace Profile</h4>
                    <p className="text-xs text-[#808080] mt-1">
                      Customize your workspace name and visual identifier.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#9b9b9b] mb-1.5">
                        Workspace Icon
                      </label>
                      <div className="flex items-center gap-2">
                        {['🚀', '💼', '💡', '⚡', '🪐', '🎯'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setWorkspaceIcon(emoji)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all ${
                              workspaceIcon === emoji
                                ? 'bg-white/10 border-blue-500 ring-1 ring-blue-500'
                                : 'bg-[#181818] border-[#333333] hover:border-[#555555]'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#9b9b9b] mb-1.5">
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="w-full max-w-sm px-3.5 py-2 bg-[#171717] border border-[#333333] rounded-lg text-xs text-[#ebebeb] focus:outline-none focus:border-[#4a9eff]"
                      />
                    </div>

                    <button
                      onClick={handleSaveWorkspace}
                      disabled={savingWs}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2383e2] hover:bg-[#1d70c4] text-white text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {savingWs ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : saveSuccess ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : null}
                      <span>{saveSuccess ? 'Changes Saved' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'connection' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-[#ebebeb]">Database Connection</h4>
                    <p className="text-xs text-[#808080] mt-1">
                      Status of your active server-side MongoDB connection.
                    </p>
                  </div>

                  {loadingConn ? (
                    <div className="py-6 flex items-center gap-2 text-xs text-[#808080]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking database connectivity...</span>
                    </div>
                  ) : connectionInfo?.isConnected ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#171717] border border-[#2f2f2f] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-400">
                              Connected & Operational
                            </span>
                          </div>
                          <button
                            onClick={fetchConnectionStatus}
                            title="Refresh status"
                            className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[#262626]">
                          <div>
                            <div className="text-[10px] uppercase text-[#666666]">Host / Cluster</div>
                            <div className="text-[#ebebeb] font-mono mt-0.5 truncate">
                              {connectionInfo.host || 'MongoDB'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-[#666666]">Target Database</div>
                            <div className="text-[#ebebeb] font-mono mt-0.5">
                              {connectionInfo.dbName || 'notion_workspace'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-[#262626]">
                        <div>
                          <div className="text-xs font-medium text-[#ebebeb]">Disconnect Database</div>
                          <div className="text-[11px] text-[#777777]">
                            Safely disconnects without removing your MongoDB documents.
                          </div>
                        </div>
                        <button
                          onClick={onDisconnect}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] hover:border-red-500/50 hover:bg-red-500/10 text-xs text-[#9b9b9b] hover:text-red-400 transition-colors"
                        >
                          <Unplug className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-300">
                      Not currently connected to MongoDB.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#ebebeb]">Appearance & Theme</h4>
                    <p className="text-xs text-[#808080] mt-1">
                      This workspace is locked to authentic Notion Dark Mode as requested.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#171717] border border-[#2f2f2f] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#252525] border border-[#3a3a3a] flex items-center justify-center text-yellow-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#ebebeb]">Notion Dark Theme</div>
                        <div className="text-[11px] text-[#777777]">
                          #191919 background with minimal dark borders and sleek contrasts.
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'danger' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-red-400">Danger Zone</h4>
                    <p className="text-xs text-[#808080] mt-1">
                      Destructive workspace actions requiring explicit confirmation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-[#ebebeb]">
                          Clear All Workspace Data
                        </div>
                        <div className="text-[11px] text-[#9b9b9b] mt-0.5 leading-relaxed">
                          This will erase all pages, databases, and records in this MongoDB database, then reset the workspace to default starter documents.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                    >
                      Reset Workspace Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Confirm Clear Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#202020] border border-red-900/60 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-400 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Are you absolutely certain?</span>
            </div>

            <p className="text-xs text-[#9b9b9b] leading-relaxed">
              This action will permanently delete all workspace pages, records, and databases. To confirm, please type <strong className="text-white font-mono">CLEAR</strong> below:
            </p>

            <input
              type="text"
              value={clearInput}
              onChange={(e) => setClearInput(e.target.value)}
              placeholder="Type CLEAR"
              className="w-full px-3 py-2 bg-[#171717] border border-[#333333] rounded-lg text-xs text-[#ebebeb] font-mono focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2a2a]">
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setClearInput('');
                }}
                className="px-3 py-1.5 text-xs text-[#808080] hover:text-[#ebebeb]"
              >
                Cancel
              </button>
              <button
                onClick={handleClearWorkspaceData}
                disabled={clearInput !== 'CLEAR' || clearing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors disabled:opacity-40"
              >
                {clearing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Clear & Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
