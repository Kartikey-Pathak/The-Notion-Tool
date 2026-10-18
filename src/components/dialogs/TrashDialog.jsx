'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X, Search, AlertTriangle, Loader2 } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function TrashDialog({ isOpen, onClose, onRestored }) {
  const [trashedPages, setTrashedPages] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTrash();
    }
  }, [isOpen]);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trash');
      const data = await res.json();
      setTrashedPages(data.pages || []);
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await fetch(`/api/pages/${id}/restore`, { method: 'POST' });
      if (res.ok) {
        setTrashedPages((prev) => prev.filter((p) => p.id !== id));
        if (onRestored) onRestored(id);
      }
    } catch (err) {
      console.error('Failed to restore page:', err);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      const res = await fetch(`/api/pages/${id}/permanent`, { method: 'DELETE' });
      if (res.ok) {
        setTrashedPages((prev) => prev.filter((p) => p.id !== id));
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error('Failed to delete permanently:', err);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const res = await fetch('/api/trash', { method: 'DELETE' });
      if (res.ok) {
        setTrashedPages([]);
        setConfirmEmptyTrash(false);
      }
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  };

  if (!isOpen) return null;

  const filtered = trashedPages.filter((p) =>
    (p.title || 'Untitled').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2f2f2f]">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#808080]" />
              <h3 className="text-sm font-semibold text-[#ebebeb]">Trash</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-[#808080]">
                {trashedPages.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {trashedPages.length > 0 && (
                <button
                  onClick={() => setConfirmEmptyTrash(true)}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline px-2 py-1"
                >
                  Empty Trash
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar inside trash */}
          <div className="p-3 border-b border-[#2a2a2a]">
            <div className="flex items-center px-3 py-1.5 bg-[#171717] border border-[#2f2f2f] rounded-lg">
              <Search className="w-3.5 h-3.5 text-[#666666] mr-2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter pages in trash..."
                className="w-full bg-transparent text-xs text-[#ebebeb] placeholder-[#555555] focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#808080]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading trash...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#777777]">
                {trashedPages.length === 0 ? 'Trash is empty.' : 'No matching pages in trash.'}
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#252525]/50 hover:bg-[#252525] border border-transparent hover:border-[#333333] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-base shrink-0">{item.icon || '📄'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-[#ebebeb] truncate">
                          {item.title || 'Untitled'}
                        </div>
                        {item.trashedAt && (
                          <div className="text-[10px] text-[#666666]">
                            Deleted {new Date(item.trashedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <button
                        onClick={() => handleRestore(item.id)}
                        title="Restore page"
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 border border-[#333333] transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        title="Delete permanently"
                        className="p-1 rounded text-[#808080] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Permanent Delete Modal */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        title="Delete page permanently?"
        message="This page and all of its nested blocks and subpages will be erased forever from your MongoDB database."
        confirmText="Delete permanently"
        isDestructive={true}
        onConfirm={() => handlePermanentDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Confirm Empty Trash Modal */}
      <ConfirmDialog
        isOpen={confirmEmptyTrash}
        title="Empty entire trash?"
        message={`Permanently remove all ${trashedPages.length} pages currently in the trash? This action cannot be reversed.`}
        confirmText="Empty Trash"
        isDestructive={true}
        onConfirm={handleEmptyTrash}
        onCancel={() => setConfirmEmptyTrash(false)}
      />
    </>
  );
}
