'use client';

import React, { useState } from 'react';
import { X, Plus, Tag, AlignLeft, Hash, Calendar, CheckSquare, Link2, Mail } from 'lucide-react';

export const PROPERTY_TYPES = [
  { id: 'text', name: 'Text', icon: AlignLeft, desc: 'Plain text notes' },
  { id: 'number', name: 'Number', icon: Hash, desc: 'Numerical values and currency' },
  { id: 'select', name: 'Select', icon: Tag, desc: 'Single tag from choices' },
  { id: 'multi-select', name: 'Multi-select', icon: Tag, desc: 'Multiple tags' },
  { id: 'status', name: 'Status', icon: Tag, desc: 'Progress tracking (Not Started, In Progress, Done)' },
  { id: 'date', name: 'Date', icon: Calendar, desc: 'Calendar date' },
  { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, desc: 'Binary toggle' },
  { id: 'url', name: 'URL', icon: Link2, desc: 'Web link' },
  { id: 'email', name: 'Email', icon: Mail, desc: 'Email address' }
];

export default function PropertyEditor({ isOpen, onClose, onAddProperty }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let options = [];
    if (type === 'select') {
      options = [
        { id: 'opt_1', name: 'Option 1', color: 'blue' },
        { id: 'opt_2', name: 'Option 2', color: 'green' }
      ];
    } else if (type === 'status') {
      options = [
        { id: 'opt_not_started', name: 'Not Started', color: 'gray' },
        { id: 'opt_in_progress', name: 'In Progress', color: 'blue' },
        { id: 'opt_done', name: 'Done', color: 'green' }
      ];
    }

    const newProp = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      type,
      options
    };

    onAddProperty(newProp);
    setName('');
    setType('text');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2f2f2f]">
          <h3 className="text-sm font-semibold text-[#ebebeb]">New Property</h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9b9b9b] mb-1.5">
              Property Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priority, Assignee, Due Date..."
              className="w-full px-3 py-2 bg-[#171717] border border-[#333333] rounded-lg text-xs text-[#ebebeb] focus:outline-none focus:border-[#4a9eff]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9b9b9b] mb-1.5">
              Property Type
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 p-1 bg-[#171717] border border-[#2f2f2f] rounded-lg">
              {PROPERTY_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isSelected = type === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setType(pt.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'text-[#9b9b9b] hover:bg-white/5 hover:text-[#ebebeb]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">{pt.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#808080] hover:text-[#ebebeb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#2383e2] hover:bg-[#1d70c4] text-white text-xs font-medium transition-colors disabled:opacity-40"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
