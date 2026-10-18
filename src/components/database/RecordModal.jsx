'use client';

import React, { useState } from 'react';
import { X, Calendar, CheckSquare, Hash, Link2, Mail, Tag, AlignLeft, Trash2 } from 'lucide-react';

const TAG_COLORS = {
  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
};

export default function RecordModal({
  isOpen,
  record,
  schema = [],
  onClose,
  onUpdateRecord,
  onDeleteRecord
}) {
  if (!isOpen || !record) return null;

  const properties = record.properties || {};

  const handlePropertyChange = (propId, value) => {
    const updatedProps = { ...properties, [propId]: value };
    onUpdateRecord(record.id, updatedProps);
  };

  const titleProp = schema.find((p) => p.type === 'title') || schema[0];
  const titleValue = properties[titleProp?.id] || 'Untitled Item';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          <div className="flex items-center gap-2 text-xs text-[#808080]">
            <span>Database Record</span>
            <span>•</span>
            <span className="font-mono text-[10px]">{record.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDeleteRecord(record.id);
                onClose();
              }}
              title="Delete record"
              className="p-1 rounded text-[#808080] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6">
          {/* Record Title */}
          <div>
            <input
              type="text"
              value={titleValue}
              onChange={(e) => handlePropertyChange(titleProp.id, e.target.value)}
              placeholder="Record Title..."
              className="w-full bg-transparent text-2xl font-bold text-[#f5f5f5] placeholder-[#555555] focus:outline-none"
            />
          </div>

          {/* Properties Grid */}
          <div className="space-y-3 pt-2 border-t border-[#2a2a2a]">
            {schema
              .filter((p) => p.id !== titleProp?.id)
              .map((prop) => {
                const val = properties[prop.id];

                return (
                  <div key={prop.id} className="grid grid-cols-3 items-center gap-4 py-1 text-xs">
                    {/* Property Label */}
                    <div className="flex items-center gap-2 text-[#808080]">
                      {prop.type === 'status' && <Tag className="w-3.5 h-3.5 text-blue-400" />}
                      {prop.type === 'select' && <Tag className="w-3.5 h-3.5 text-purple-400" />}
                      {prop.type === 'multi-select' && <Tag className="w-3.5 h-3.5 text-pink-400" />}
                      {prop.type === 'date' && <Calendar className="w-3.5 h-3.5 text-yellow-400" />}
                      {prop.type === 'checkbox' && <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />}
                      {prop.type === 'number' && <Hash className="w-3.5 h-3.5 text-orange-400" />}
                      {prop.type === 'url' && <Link2 className="w-3.5 h-3.5 text-blue-400" />}
                      {prop.type === 'email' && <Mail className="w-3.5 h-3.5 text-indigo-400" />}
                      {prop.type === 'text' && <AlignLeft className="w-3.5 h-3.5 text-[#808080]" />}
                      <span className="font-medium text-[#a0a0a0] truncate">{prop.name}</span>
                    </div>

                    {/* Property Value Input */}
                    <div className="col-span-2">
                      {/* Status / Select */}
                      {(prop.type === 'status' || prop.type === 'select') && (
                        <select
                          value={val || ''}
                          onChange={(e) => handlePropertyChange(prop.id, e.target.value)}
                          className="bg-[#171717] border border-[#333333] rounded px-2.5 py-1 text-xs text-[#ebebeb] focus:outline-none focus:border-[#4a9eff]"
                        >
                          <option value="">Empty</option>
                          {(prop.options || []).map((opt) => (
                            <option key={opt.id || opt.name} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Multi-Select */}
                      {prop.type === 'multi-select' && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(Array.isArray(val) ? val : []).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-full text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = val.filter((_, i) => i !== tIdx);
                                  handlePropertyChange(prop.id, updated);
                                }}
                                className="hover:text-white"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder="+ Add tag & Enter"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                e.preventDefault();
                                const current = Array.isArray(val) ? val : [];
                                if (!current.includes(e.target.value.trim())) {
                                  handlePropertyChange(prop.id, [...current, e.target.value.trim()]);
                                }
                                e.target.value = '';
                              }
                            }}
                            className="bg-transparent text-xs text-[#ebebeb] placeholder-[#555555] focus:outline-none w-28 px-1 py-0.5 border-b border-[#333333]"
                          />
                        </div>
                      )}

                      {/* Date */}
                      {prop.type === 'date' && (
                        <input
                          type="date"
                          value={val || ''}
                          onChange={(e) => handlePropertyChange(prop.id, e.target.value)}
                          className="bg-[#171717] border border-[#333333] rounded px-2.5 py-1 text-xs text-[#ebebeb] focus:outline-none focus:border-[#4a9eff]"
                        />
                      )}

                      {/* Checkbox */}
                      {prop.type === 'checkbox' && (
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handlePropertyChange(prop.id, e.target.checked)}
                          className="w-4 h-4 rounded bg-[#171717] border-[#444444] text-[#2383e2] cursor-pointer"
                        />
                      )}

                      {/* Number */}
                      {prop.type === 'number' && (
                        <input
                          type="number"
                          value={val || ''}
                          onChange={(e) => handlePropertyChange(prop.id, e.target.value)}
                          placeholder="Empty"
                          className="w-full bg-[#171717] border border-[#333333] rounded px-2.5 py-1 text-xs text-[#ebebeb] focus:outline-none focus:border-[#4a9eff]"
                        />
                      )}

                      {/* URL / Email / Text */}
                      {['url', 'email', 'text'].includes(prop.type) && (
                        <input
                          type={prop.type === 'email' ? 'email' : 'text'}
                          value={val || ''}
                          onChange={(e) => handlePropertyChange(prop.id, e.target.value)}
                          placeholder="Empty"
                          className="w-full bg-[#171717] border border-[#333333] rounded px-2.5 py-1 text-xs text-[#ebebeb] focus:outline-none focus:border-[#4a9eff]"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Record Notes/Description */}
          <div className="pt-6 border-t border-[#2a2a2a] space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
              Notes & Comments
            </h4>
            <textarea
              value={properties.__notes || ''}
              onChange={(e) => handlePropertyChange('__notes', e.target.value)}
              placeholder="Add extended notes or thoughts for this record..."
              rows={4}
              className="w-full bg-[#171717] border border-[#2f2f2f] rounded-lg p-3 text-xs text-[#ebebeb] placeholder-[#555555] focus:outline-none focus:border-[#4a9eff] leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
