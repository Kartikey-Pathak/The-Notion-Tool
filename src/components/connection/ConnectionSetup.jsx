'use client';

import React, { useState } from 'react';
import { Database, ShieldCheck, ArrowRight, Loader2, AlertCircle, Info, Terminal } from 'lucide-react';

export default function ConnectionSetup({ onConnected }) {
  const [uri, setUri] = useState('');
  const [dbName, setDbName] = useState('notion_workspace');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async (e) => {
    if (e) e.preventDefault();
    if (!uri.trim()) {
      setError('Please provide a valid MongoDB connection URI.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: uri.trim(), dbName: dbName.trim() || 'notion_workspace' })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to MongoDB');
      }

      // Success
      if (onConnected) {
        onConnected(data);
      }
    } catch (err) {
      setError(err.message || 'Connection failed. Please check your credentials and network access.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseLocal = () => {
    setUri('mongodb://127.0.0.1:27017');
    setDbName('notion_workspace');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#191919] text-[#ebebeb] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#222222] border border-[#333333] shadow-md mb-4">
            <span className="text-xl font-bold font-serif text-white tracking-wider">N</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f5f5f5]">
            Connect your Notion Workspace
          </h1>
          <p className="mt-2 text-sm text-[#9b9b9b] max-w-md mx-auto">
            You own your data. Connect your MongoDB database to initialize your workspace with persistent pages, rich-text blocks, and databases.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#202020] border border-[#2f2f2f] rounded-xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9b9b9b] uppercase tracking-wider mb-2">
                MongoDB Connection URI
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={uri}
                  onChange={(e) => setUri(e.target.value)}
                  placeholder="mongodb+srv://user:pass@cluster.mongodb.net or mongodb://localhost:27017"
                  className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#333333] rounded-lg text-sm text-[#ebebeb] placeholder-[#555555] focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-[#666666]">
                  Supports MongoDB Atlas or local deployment
                </span>
                <button
                  type="button"
                  onClick={handleUseLocal}
                  className="text-xs text-[#4a9eff] hover:underline flex items-center gap-1"
                >
                  <Terminal className="w-3 h-3" />
                  Use Local MongoDB
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9b9b9b] uppercase tracking-wider mb-2">
                Database Name (Optional)
              </label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="notion_workspace"
                className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#333333] rounded-lg text-sm text-[#ebebeb] placeholder-[#555555] focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2383e2] hover:bg-[#1d70c4] active:bg-[#185fa7] text-white text-sm font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting & Initializing...</span>
                </>
              ) : (
                <>
                  <span>Connect & Enter Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Guidance notice */}
          <div className="mt-6 pt-5 border-t border-[#2a2a2a] space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-[#808080]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero credential leakage:</strong> Your URI is stored exclusively in a secure, local-first configuration file ignored by Git. It is never exposed in browser bundles or client APIs.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#808080]">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>MongoDB Atlas tip:</strong> In your Atlas dashboard, ensure Network Access allows your IP (or 0.0.0.0/0 for testing), and your database user has read/write privileges.
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-[#555555]">
          Includes Pages, Nested Trees, Slash Commands, and Multi-View Databases
        </div>
      </div>
    </div>
  );
}
