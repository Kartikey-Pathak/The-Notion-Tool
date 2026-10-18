'use client';

import React, { useState } from 'react';
import { LayoutTemplate, X, Check, ArrowRight, Loader2 } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';

export default function TemplatePicker({ isOpen, onClose, onSelectTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;
    setCreating(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate.id })
      });
      const data = await res.json();
      if (res.ok && data.page) {
        onSelectTemplate(data.page.id);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create page from template:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2f2f2f]">
          <div className="flex items-center gap-2.5">
            <LayoutTemplate className="w-4 h-4 text-[#4a9eff]" />
            <h3 className="text-base font-semibold text-[#ebebeb]">Choose a Template</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar list + Preview pane */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Left list */}
          <div className="border-r border-[#2f2f2f] p-3 space-y-1 overflow-y-auto max-h-[55vh]">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#777777] px-3 py-1">
              Curated Templates
            </div>
            {TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-white/10 text-white font-medium shadow-sm'
                      : 'text-[#9b9b9b] hover:bg-white/5 hover:text-[#ebebeb]'
                  }`}
                >
                  <span className="text-xl shrink-0">{tpl.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate">{tpl.title}</div>
                    <div className="text-[10px] text-[#666666]">{tpl.category}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#4a9eff] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right preview pane */}
          <div className="md:col-span-2 p-6 overflow-y-auto max-h-[55vh] flex flex-col bg-[#191919]">
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTemplate.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-[#ebebeb]">
                      {selectedTemplate.title}
                    </h2>
                    <p className="text-xs text-[#808080] mt-0.5">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#2a2a2a] pt-4">
                  <div className="text-[11px] uppercase tracking-wider text-[#666666] font-medium mb-3">
                    Sample Structure Preview
                  </div>
                  <div className="space-y-2.5 p-4 rounded-lg bg-[#202020] border border-[#2c2c2c]">
                    {selectedTemplate.blocks.slice(0, 6).map((block, idx) => (
                      <div key={idx} className="text-xs text-[#9b9b9b] flex items-start gap-2">
                        {block.type === 'callout' && (
                          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 w-full text-xs">
                            💡 {block.content}
                          </div>
                        )}
                        {block.type === 'heading2' && (
                          <div className="font-semibold text-sm text-[#ebebeb] mt-1">
                            {block.content}
                          </div>
                        )}
                        {block.type === 'heading3' && (
                          <div className="font-medium text-xs text-[#ebebeb] mt-1">
                            {block.content}
                          </div>
                        )}
                        {block.type === 'todo' && (
                          <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                            <div className="w-3.5 h-3.5 rounded border border-[#555555]" />
                            <span>{block.content}</span>
                          </div>
                        )}
                        {block.type === 'bullet_list' && (
                          <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                            <span className="text-sm">•</span>
                            <span>{block.content}</span>
                          </div>
                        )}
                        {block.type === 'quote' && (
                          <div className="border-l-2 border-[#555555] pl-2 text-xs italic text-[#888888]">
                            {block.content}
                          </div>
                        )}
                      </div>
                    ))}
                    {selectedTemplate.blocks.length > 6 && (
                      <div className="text-[11px] text-[#555555] text-center pt-1">
                        + {selectedTemplate.blocks.length - 6} more blocks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#1a1a1a] border-t border-[#2f2f2f]">
          <div className="text-xs text-[#666666]">
            Ready-to-use editable productivity pages
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#808080] hover:text-[#ebebeb] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUseTemplate}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#2383e2] hover:bg-[#1d70c4] text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating page...</span>
                </>
              ) : (
                <>
                  <span>Use this template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
