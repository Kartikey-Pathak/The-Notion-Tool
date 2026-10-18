'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Smile,
  Image as ImageIcon,
  Check,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database as DatabaseIcon,
  X
} from 'lucide-react';
import BlockRenderer from './BlockRenderer';
import DatabaseView from '@/components/database/DatabaseView';

const EMOJI_PRESETS = ['📄', '💡', '🚀', '🎯', '📝', '☕', '📚', '🗓️', '⚡', '💼', '🎨', '🔬', '🌟', '🛠️', '📊'];

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
];

export default function PageEditor({
  page,
  database,
  records = [],
  onUpdatePageMetadata,
  onUpdateDatabase,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
  onNavigateToPage
}) {
  const [title, setTitle] = useState(page?.title || 'Untitled');
  const [icon, setIcon] = useState(page?.icon || '📄');
  const [cover, setCover] = useState(page?.cover || null);
  const [blocks, setBlocks] = useState(page?.blocks || []);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saving...', 'Saved', 'Unsaved'

  // Popover toggles
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  const saveTimerRef = useRef(null);
  const titleInputRef = useRef(null);

  // Sync state when active page changes
  useEffect(() => {
    if (page) {
      setTitle(page.title || 'Untitled');
      setIcon(page.icon || '📄');
      setCover(page.cover || null);
      setBlocks(page.blocks || []);
      setSaveStatus('Saved');
    }
  }, [page?.id]);

  // Debounced auto-save function
  const triggerAutoSave = useCallback(
    (updates) => {
      setSaveStatus('Saving...');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/pages/${page.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          const data = await res.json();
          if (res.ok) {
            setSaveStatus('Saved');
            if (onUpdatePageMetadata) {
              onUpdatePageMetadata({
                id: page.id,
                title: updates.title !== undefined ? updates.title : page.title,
                icon: updates.icon !== undefined ? updates.icon : page.icon,
                cover: updates.cover !== undefined ? updates.cover : page.cover
              });
            }
          } else {
            setSaveStatus('Error');
          }
        } catch (err) {
          console.error('Autosave error:', err);
          setSaveStatus('Error');
        }
      }, 600);
    },
    [page?.id, onUpdatePageMetadata, page?.title, page?.icon, page?.cover]
  );

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutoSave({ title: val });
  };

  const handleIconSelect = (emoji) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
    triggerAutoSave({ icon: emoji });
  };

  const handleCoverSelect = (url) => {
    setCover(url);
    setShowCoverPicker(false);
    triggerAutoSave({ cover: url });
  };

  const handleRemoveCover = () => {
    setCover(null);
    setShowCoverPicker(false);
    triggerAutoSave({ cover: null });
  };

  const handleBlocksChange = (newBlocks) => {
    setBlocks(newBlocks);
    triggerAutoSave({ blocks: newBlocks });
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-[#808080]">
        No page selected
      </div>
    );
  }

  return (
    <div className="relative min-h-full flex flex-col pb-24">
      {/* Cover Image Banner */}
      {cover ? (
        <div className="relative group/cover w-full h-48 md:h-56 overflow-hidden">
          <img
            src={cover}
            alt="Page cover"
            className="w-full h-full object-cover select-none"
          />
          {/* Cover Controls */}
          <div className="absolute bottom-3 right-6 opacity-0 group-hover/cover:opacity-100 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-xs text-[#d0d0d0] transition-opacity">
            <button
              onClick={() => setShowCoverPicker(true)}
              className="hover:text-white transition-colors"
            >
              Change cover
            </button>
            <span>•</span>
            <button
              onClick={handleRemoveCover}
              className="hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="h-12 w-full" />
      )}

      {/* Main Document Content Canvas */}
      <div className="w-full max-w-4xl mx-auto px-6 sm:px-12 flex-1">
        {/* Hover buttons for Cover / Icon if not set */}
        <div className="flex items-center gap-2 text-xs text-[#777777] mb-2">
          {!icon && (
            <button
              onClick={() => setShowEmojiPicker(true)}
              className="flex items-center gap-1 hover:text-[#ebebeb] px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Add icon</span>
            </button>
          )}

          {!cover && (
            <button
              onClick={() => setShowCoverPicker(true)}
              className="flex items-center gap-1 hover:text-[#ebebeb] px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Add cover</span>
            </button>
          )}
        </div>

        {/* Page Icon Display & Picker */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-5xl hover:opacity-80 transition-opacity select-none p-1 rounded-lg hover:bg-white/5 -ml-1 inline-block"
            title="Click to change icon"
          >
            {icon || '📄'}
          </button>

          {showEmojiPicker && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-[#252525] border border-[#333333] rounded-xl shadow-2xl p-3 w-64 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#303030]">
                <span className="text-[11px] font-semibold uppercase text-[#777777]">
                  Select Icon
                </span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 rounded text-[#808080] hover:text-[#ebebeb]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleIconSelect(emoji)}
                    className="text-2xl p-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cover Picker Dialog */}
        {showCoverPicker && (
          <div className="mb-6 p-4 rounded-xl bg-[#202020] border border-[#2f2f2f] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#ebebeb]">Select Cover Image</span>
              <button
                onClick={() => setShowCoverPicker(false)}
                className="p-1 text-[#808080] hover:text-[#ebebeb]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {COVER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCoverSelect(preset)}
                  className="h-16 rounded-lg overflow-hidden border border-[#333333] hover:border-blue-500 transition-all"
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="pt-2 border-t border-[#2a2a2a] flex items-center gap-2">
              <input
                type="text"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                placeholder="Paste image link URL (https://...)"
                className="w-full bg-[#171717] border border-[#333333] rounded-lg px-3 py-1.5 text-xs text-[#ebebeb] placeholder-[#555555] focus:outline-none focus:border-[#4a9eff]"
              />
              <button
                onClick={() => {
                  if (customCoverUrl.trim()) handleCoverSelect(customCoverUrl.trim());
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shrink-0"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Page Title Auto-expanding Input */}
        <div className="mb-6">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full bg-transparent text-3xl sm:text-4xl font-bold text-[#f5f5f5] placeholder-[#444444] focus:outline-none tracking-tight leading-tight"
          />
        </div>

        {/* If page is Database, render DatabaseView */}
        {page.isDatabase ? (
          <div className="pt-2">
            <DatabaseView
              database={database}
              records={records}
              onUpdateDatabase={onUpdateDatabase}
              onCreateRecord={onCreateRecord}
              onUpdateRecord={onUpdateRecord}
              onDeleteRecord={onDeleteRecord}
            />
          </div>
        ) : (
          /* Normal Document: render BlockRenderer */
          <div className="pt-2">
            <BlockRenderer
              blocks={blocks}
              onChangeBlocks={handleBlocksChange}
              onNavigateToPage={onNavigateToPage}
            />
          </div>
        )}
      </div>

      {/* Floating Save Status pill in bottom right */}
      <div className="fixed bottom-4 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#202020]/90 backdrop-blur-md border border-[#2f2f2f] text-[11px] text-[#808080] shadow-lg select-none">
        {saveStatus === 'Saving...' ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            <span className="text-[#a0a0a0]">Saving...</span>
          </>
        ) : saveStatus === 'Error' ? (
          <span className="text-red-400">Save failed</span>
        ) : (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-[#808080]">Saved</span>
          </>
        )}
      </div>
    </div>
  );
}
