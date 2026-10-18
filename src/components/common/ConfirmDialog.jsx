'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-[#202020] border border-[#2f2f2f] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2f2f2f]">
          <div className="flex items-center gap-2.5">
            {isDestructive && (
              <div className="p-1.5 rounded-md bg-red-500/10 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-base font-semibold text-[#ebebeb]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-[#9b9b9b] leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-[#1a1a1a] border-t border-[#2f2f2f]">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-[#ebebeb] bg-transparent hover:bg-white/5 border border-[#333333] rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
