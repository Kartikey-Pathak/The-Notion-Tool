'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Check,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Code2,
  Table as TableIcon,
  Image as ImageIcon,
  Link2,
  FileText,
  Palette
} from 'lucide-react';
import SlashCommandMenu, { COMMAND_ITEMS } from './SlashCommandMenu';

const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'json',
  'sql',
  'shell'
];

export const NOTION_TEXT_COLORS = [
  { id: 'default', name: 'Default', class: 'text-[#ebebeb]', hex: '#ebebeb' },
  { id: 'gray', name: 'Gray', class: 'text-[#9b9b9b]', hex: '#9b9b9b' },
  { id: 'brown', name: 'Brown', class: 'text-[#bca495]', hex: '#bca495' },
  { id: 'orange', name: 'Orange', class: 'text-[#e89a3c]', hex: '#e89a3c' },
  { id: 'yellow', name: 'Yellow', class: 'text-[#e3c457]', hex: '#e3c457' },
  { id: 'green', name: 'Green', class: 'text-[#6ac98e]', hex: '#6ac98e' },
  { id: 'blue', name: 'Blue', class: 'text-[#5e9bf7]', hex: '#5e9bf7' },
  { id: 'purple', name: 'Purple', class: 'text-[#b488f2]', hex: '#b488f2' },
  { id: 'pink', name: 'Pink', class: 'text-[#eb73a6]', hex: '#eb73a6' },
  { id: 'red', name: 'Red', class: 'text-[#f26f63]', hex: '#f26f63' },
];

export const NOTION_BG_COLORS = [
  { id: 'default', name: 'Default background', class: '', hex: 'transparent' },
  { id: 'gray_bg', name: 'Gray background', class: 'bg-[#2a2a2a]/90 px-3 py-1.5 rounded-md my-0.5', hex: '#2a2a2a' },
  { id: 'brown_bg', name: 'Brown background', class: 'bg-[#3b2d23]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#3b2d23' },
  { id: 'orange_bg', name: 'Orange background', class: 'bg-[#432b1a]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#432b1a' },
  { id: 'yellow_bg', name: 'Yellow background', class: 'bg-[#40361a]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#40361a' },
  { id: 'green_bg', name: 'Green background', class: 'bg-[#1c3825]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#1c3825' },
  { id: 'blue_bg', name: 'Blue background', class: 'bg-[#183049]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#183049' },
  { id: 'purple_bg', name: 'Purple background', class: 'bg-[#302146]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#302146' },
  { id: 'pink_bg', name: 'Pink background', class: 'bg-[#3d1d2f]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#3d1d2f' },
  { id: 'red_bg', name: 'Red background', class: 'bg-[#421d1d]/80 px-3 py-1.5 rounded-md my-0.5', hex: '#421d1d' },
];

const getTextColorClass = (colorId) => {
  const item = NOTION_TEXT_COLORS.find((c) => c.id === colorId);
  return item ? item.class : 'text-[#ebebeb]';
};

const getBgColorClass = (bgId) => {
  const item = NOTION_BG_COLORS.find((b) => b.id === bgId);
  return item ? item.class : '';
};

// Auto-resizing textarea that wraps text to new lines and dynamically expands height
function AutoResizeTextarea({
  value,
  onChange,
  onKeyDown,
  onInput,
  placeholder,
  className = '',
  style = {},
  autoFocus = false,
  onFocused,
  rows = 1,
  ...props
}) {
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      onFocused?.();
    }
  }, [autoFocus, onFocused]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [resize]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        resize();
      }}
      onInput={(e) => {
        onInput?.(e);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={rows}
      className={`overflow-hidden resize-none ${className}`}
      style={{
        fieldSizing: 'content',
        ...style
      }}
      {...props}
    />
  );
}

export default function BlockRenderer({
  blocks,
  onChangeBlocks,
  onNavigateToPage
}) {
  const [activeSlashIndex, setActiveSlashIndex] = useState(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openColorIndex, setOpenColorIndex] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [focusTargetId, setFocusTargetId] = useState(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = () => {
      setOpenMenuIndex(null);
      setOpenColorIndex(null);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Update a single block's content or properties
  const updateBlock = (index, updates) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    onChangeBlocks(newBlocks);
  };

  // Insert a new block after index
  const insertBlockAfter = (index, type = 'paragraph') => {
    const newId = `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBlock = {
      id: newId,
      type,
      content: '',
      properties: type === 'callout' ? { icon: '💡', color: 'blue' } : {}
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setFocusTargetId(newId);
    onChangeBlocks(newBlocks);
    setActiveSlashIndex(null);
  };

  // Convert block type
  const turnBlockInto = (index, newType) => {
    const current = blocks[index];
    const newBlock = {
      ...current,
      type: newType,
      properties: newType === 'callout' ? { icon: '💡', color: 'blue' } : (current.properties || {})
    };
    const newBlocks = [...blocks];
    newBlocks[index] = newBlock;
    onChangeBlocks(newBlocks);
    setOpenMenuIndex(null);
  };

  // Delete block
  const deleteBlock = (index) => {
    if (blocks.length <= 1) {
      // Keep at least one empty block
      const newId = `b_${Date.now()}`;
      onChangeBlocks([
        {
          id: newId,
          type: 'paragraph',
          content: '',
          properties: {}
        }
      ]);
      setFocusTargetId(newId);
      return;
    }
    const prevBlock = blocks[index - 1];
    if (prevBlock) {
      setFocusTargetId(prevBlock.id);
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChangeBlocks(newBlocks);
    setOpenMenuIndex(null);
  };

  // Duplicate block
  const duplicateBlock = (index) => {
    const current = blocks[index];
    const cloned = {
      ...current,
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, cloned);
    onChangeBlocks(newBlocks);
    setOpenMenuIndex(null);
  };

  // Move block up or down
  const moveBlock = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    onChangeBlocks(newBlocks);
    setOpenMenuIndex(null);
  };

  // Copy code snippet to clipboard
  const handleCopyCode = (id, codeText) => {
    navigator.clipboard.writeText(codeText || '');
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Handle typing inside text blocks (Enter, Backspace, Slash command)
  const handleTextKeyDown = (e, index, block) => {
    // If slash menu is active, let it handle Enter/Arrows
    if (activeSlashIndex !== null && (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      return;
    }

    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: Soft break (new line in the SAME block)
        return;
      }
      if (e.ctrlKey) {
        // Ctrl+Enter: Also allow new line in the SAME block
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const oldVal = block.content || '';
        const newVal = oldVal.substring(0, start) + '\n' + oldVal.substring(end);
        updateBlock(index, { content: newVal });
        requestAnimationFrame(() => {
          if (e.target) {
            e.target.selectionStart = e.target.selectionEnd = start + 1;
          }
        });
        return;
      }

      // Enter without Shift/Ctrl: Create a new block below
      e.preventDefault();
      const nextType =
        block.type === 'bullet_list' || block.type === 'numbered_list' || block.type === 'todo'
          ? block.type
          : 'paragraph';
      insertBlockAfter(index, nextType);
    } else if (e.key === 'Backspace' && (block.content === '' || block.content === undefined)) {
      if (block.type !== 'paragraph') {
        e.preventDefault();
        turnBlockInto(index, 'paragraph');
      } else if (blocks.length > 1) {
        e.preventDefault();
        deleteBlock(index);
      }
    }
  };

  // Check for slash command input
  const handleTextChange = (e, index) => {
    const val = e.target.value;
    updateBlock(index, { content: val });

    if (val.startsWith('/')) {
      setActiveSlashIndex(index);
      setSlashQuery(val);
      const rect = e.target.getBoundingClientRect();
      setSlashMenuPos({ top: e.target.offsetTop + 32, left: 36 });
    } else if (activeSlashIndex === index) {
      setActiveSlashIndex(null);
    }
  };

  const handleSelectSlashCommand = (blockType) => {
    if (activeSlashIndex !== null) {
      turnBlockInto(activeSlashIndex, blockType);
      updateBlock(activeSlashIndex, { content: '' });
      setActiveSlashIndex(null);
    }
  };

  return (
    <div className="relative space-y-1 pb-32">
      {blocks.map((block, index) => {
        const isMenuOpen = openMenuIndex === index;

        return (
          <div
            key={block.id || index}
            className="group relative flex items-start -ml-12 pl-12 pr-4 rounded-md transition-colors"
          >
            {/* Block Hover Drag & Actions Handle */}
            <div
              className="absolute left-0 top-1.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-[#666666] select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => insertBlockAfter(index, 'paragraph')}
                title="Click to add a block below"
                className="p-0.5 rounded hover:bg-white/10 hover:text-[#ebebeb] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpenMenuIndex(isMenuOpen ? null : index)}
                title="Drag or click for menu"
                className="p-0.5 rounded hover:bg-white/10 hover:text-[#ebebeb] transition-colors"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>

              {/* Block Options Context Menu */}
              {isMenuOpen && (
                <div className="absolute left-10 top-0 z-50 w-52 bg-[#252525] border border-[#333333] rounded-lg shadow-2xl p-1 text-xs text-[#ebebeb] animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] text-[#666666] uppercase tracking-wider font-semibold">
                    Block Actions
                  </div>

                  <button
                    onClick={() => deleteBlock(index)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-500/10 text-red-400 text-left transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => duplicateBlock(index)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-left transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>

                  <div className="h-px bg-[#333333] my-1" />

                  <button
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 disabled:opacity-40 text-left transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Move Up</span>
                  </button>

                  <button
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 disabled:opacity-40 text-left transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Move Down</span>
                  </button>

                  <div className="h-px bg-[#333333] my-1" />

                  {/* Color Selector Button */}
                  <button
                    onClick={() => setOpenColorIndex(openColorIndex === index ? null : index)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-[#808080]" />
                      <span>Color</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-[#666666]" />
                  </button>

                  {/* Submenu for Colors */}
                  {openColorIndex === index && (
                    <div className="my-1 p-1 bg-[#1a1a1a] border border-[#333333] rounded-md max-h-56 overflow-y-auto space-y-1">
                      <div className="px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#666666] font-semibold">
                        Text Color
                      </div>
                      {NOTION_TEXT_COLORS.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => {
                            updateBlock(index, {
                              properties: { ...block.properties, textColor: col.id }
                            });
                            setOpenColorIndex(null);
                            setOpenMenuIndex(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 text-left text-[11px]"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className={col.class}>{col.name}</span>
                        </button>
                      ))}

                      <div className="h-px bg-[#2f2f2f] my-1" />

                      <div className="px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#666666] font-semibold">
                        Background
                      </div>
                      {NOTION_BG_COLORS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            updateBlock(index, {
                              properties: { ...block.properties, bgColor: bg.id }
                            });
                            setOpenColorIndex(null);
                            setOpenMenuIndex(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 text-left text-[11px] text-[#c0c0c0]"
                        >
                          <span
                            className="w-3 h-3 rounded border border-white/20 shrink-0"
                            style={{ backgroundColor: bg.hex === 'transparent' ? '#252525' : bg.hex }}
                          />
                          <span>{bg.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="h-px bg-[#333333] my-1" />

                  <div className="px-2 py-1 text-[10px] text-[#666666] uppercase tracking-wider font-semibold">
                    Turn into
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-0.5">
                    {COMMAND_ITEMS.slice(0, 10).map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => turnBlockInto(index, cmd.id)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 text-left text-[11px] text-[#c0c0c0]"
                      >
                        <cmd.icon className="w-3 h-3 text-[#808080]" />
                        <span>{cmd.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Block Content by Type */}
            <div className={`w-full min-w-0 ${getBgColorClass(block.properties?.bgColor)}`}>
              {/* Paragraph */}
              {block.type === 'paragraph' && (
                <AutoResizeTextarea
                  autoFocus={focusTargetId === block.id}
                  onFocused={() => setFocusTargetId(null)}
                  value={block.content || ''}
                  onChange={(e) => handleTextChange(e, index)}
                  onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                  placeholder="Type '/' for commands, Shift+Enter for new line..."
                  className={`w-full bg-transparent text-sm placeholder-[#555555] focus:outline-none leading-relaxed py-1 block ${getTextColorClass(block.properties?.textColor)}`}
                  style={{ minHeight: '1.75rem' }}
                />
              )}

              {/* Heading 1 */}
              {block.type === 'heading1' && (
                <AutoResizeTextarea
                  autoFocus={focusTargetId === block.id}
                  onFocused={() => setFocusTargetId(null)}
                  value={block.content || ''}
                  onChange={(e) => handleTextChange(e, index)}
                  onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                  placeholder="Heading 1"
                  className={`w-full bg-transparent text-2xl font-bold placeholder-[#555555] focus:outline-none pt-4 pb-1 block ${getTextColorClass(block.properties?.textColor)}`}
                  style={{ minHeight: '2.5rem' }}
                />
              )}

              {/* Heading 2 */}
              {block.type === 'heading2' && (
                <AutoResizeTextarea
                  autoFocus={focusTargetId === block.id}
                  onFocused={() => setFocusTargetId(null)}
                  value={block.content || ''}
                  onChange={(e) => handleTextChange(e, index)}
                  onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                  placeholder="Heading 2"
                  className={`w-full bg-transparent text-xl font-semibold placeholder-[#555555] focus:outline-none pt-3 pb-1 block ${getTextColorClass(block.properties?.textColor)}`}
                  style={{ minHeight: '2rem' }}
                />
              )}

              {/* Heading 3 */}
              {block.type === 'heading3' && (
                <AutoResizeTextarea
                  autoFocus={focusTargetId === block.id}
                  onFocused={() => setFocusTargetId(null)}
                  value={block.content || ''}
                  onChange={(e) => handleTextChange(e, index)}
                  onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                  placeholder="Heading 3"
                  className={`w-full bg-transparent text-lg font-medium placeholder-[#555555] focus:outline-none pt-2 pb-1 block ${getTextColorClass(block.properties?.textColor)}`}
                  style={{ minHeight: '1.75rem' }}
                />
              )}

              {/* Bullet List */}
              {block.type === 'bullet_list' && (
                <div className="flex items-start gap-2.5 py-1">
                  <span className="text-sm text-[#808080] select-none mt-0.5">•</span>
                  <AutoResizeTextarea
                    autoFocus={focusTargetId === block.id}
                    onFocused={() => setFocusTargetId(null)}
                    value={block.content || ''}
                    onChange={(e) => handleTextChange(e, index)}
                    onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                    placeholder="List item..."
                    className={`w-full bg-transparent text-sm placeholder-[#555555] focus:outline-none leading-relaxed ${getTextColorClass(block.properties?.textColor)}`}
                    style={{ minHeight: '1.5rem' }}
                  />
                </div>
              )}

              {/* Numbered List */}
              {block.type === 'numbered_list' && (
                <div className="flex items-start gap-2.5 py-1">
                  <span className="text-xs text-[#808080] font-mono select-none mt-1">1.</span>
                  <AutoResizeTextarea
                    autoFocus={focusTargetId === block.id}
                    onFocused={() => setFocusTargetId(null)}
                    value={block.content || ''}
                    onChange={(e) => handleTextChange(e, index)}
                    onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                    placeholder="Numbered item..."
                    className={`w-full bg-transparent text-sm placeholder-[#555555] focus:outline-none leading-relaxed ${getTextColorClass(block.properties?.textColor)}`}
                    style={{ minHeight: '1.5rem' }}
                  />
                </div>
              )}

              {/* To-Do */}
              {block.type === 'todo' && (
                <div className="flex items-start gap-2.5 py-1">
                  <input
                    type="checkbox"
                    checked={Boolean(block.properties?.checked)}
                    onChange={(e) =>
                      updateBlock(index, {
                        properties: { ...block.properties, checked: e.target.checked }
                      })
                    }
                    className="w-4 h-4 rounded mt-1 bg-[#252525] border-[#444444] text-[#2383e2] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#2383e2]"
                  />
                  <AutoResizeTextarea
                    autoFocus={focusTargetId === block.id}
                    onFocused={() => setFocusTargetId(null)}
                    value={block.content || ''}
                    onChange={(e) => handleTextChange(e, index)}
                    onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                    placeholder="To-do item..."
                    className={`w-full bg-transparent text-sm placeholder-[#555555] focus:outline-none leading-relaxed ${
                      block.properties?.checked ? 'line-through text-[#777777]' : getTextColorClass(block.properties?.textColor)
                    }`}
                    style={{ minHeight: '1.5rem' }}
                  />
                </div>
              )}

              {/* Toggle Block */}
              {block.type === 'toggle' && (
                <div className="py-1">
                  <div className="flex items-start gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateBlock(index, {
                          properties: { ...block.properties, isOpen: !block.properties?.isOpen }
                        })
                      }
                      className="p-0.5 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 mt-0.5"
                    >
                      {block.properties?.isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <AutoResizeTextarea
                      autoFocus={focusTargetId === block.id}
                      onFocused={() => setFocusTargetId(null)}
                      value={block.content || ''}
                      onChange={(e) => handleTextChange(e, index)}
                      onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                      placeholder="Toggle header..."
                      className={`w-full bg-transparent text-sm font-medium placeholder-[#555555] focus:outline-none ${getTextColorClass(block.properties?.textColor)}`}
                      style={{ minHeight: '1.5rem' }}
                    />
                  </div>

                  {block.properties?.isOpen && (
                    <div className="pl-6 pt-2 border-l border-[#2f2f2f] ml-2 mt-1">
                      <AutoResizeTextarea
                        value={block.properties?.nestedContent || ''}
                        onChange={(e) =>
                          updateBlock(index, {
                            properties: { ...block.properties, nestedContent: e.target.value }
                          })
                        }
                        placeholder="Hidden toggle content..."
                        className={`w-full bg-transparent text-sm placeholder-[#555555] focus:outline-none leading-relaxed ${getTextColorClass(block.properties?.textColor)}`}
                        style={{ minHeight: '2.5rem' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Quote */}
              {block.type === 'quote' && (
                <div className="border-l-2 border-[#555555] pl-3 py-1 my-1">
                  <AutoResizeTextarea
                    autoFocus={focusTargetId === block.id}
                    onFocused={() => setFocusTargetId(null)}
                    value={block.content || ''}
                    onChange={(e) => handleTextChange(e, index)}
                    onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                    placeholder="Empty quote..."
                    className={`w-full bg-transparent text-sm italic placeholder-[#555555] focus:outline-none leading-relaxed ${getTextColorClass(block.properties?.textColor)}`}
                    style={{ minHeight: '1.5rem' }}
                  />
                </div>
              )}

              {/* Callout */}
              {block.type === 'callout' && (
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#222222] border border-[#2d2d2d] my-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      const icons = ['💡', '⚠️', '🔥', '📌', '🚀', '⭐'];
                      const current = block.properties?.icon || '💡';
                      const next = icons[(icons.indexOf(current) + 1) % icons.length];
                      updateBlock(index, { properties: { ...block.properties, icon: next } });
                    }}
                    className="text-lg shrink-0 hover:scale-110 transition-transform select-none"
                  >
                    {block.properties?.icon || '💡'}
                  </button>
                  <AutoResizeTextarea
                    autoFocus={focusTargetId === block.id}
                    onFocused={() => setFocusTargetId(null)}
                    value={block.content || ''}
                    onChange={(e) => handleTextChange(e, index)}
                    onKeyDown={(e) => handleTextKeyDown(e, index, block)}
                    placeholder="Callout text..."
                    className={`w-full bg-transparent text-sm placeholder-[#555555] focus:outline-none leading-relaxed ${getTextColorClass(block.properties?.textColor)}`}
                    style={{ minHeight: '1.5rem' }}
                  />
                </div>
              )}

              {/* Divider */}
              {block.type === 'divider' && (
                <div className="py-3">
                  <hr className="border-t border-[#2f2f2f]" />
                </div>
              )}

              {/* Code Block */}
              {block.type === 'code' && (
                <div className="my-2 rounded-lg bg-[#141414] border border-[#2a2a2a] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#1c1c1c] border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-[#777777]" />
                      <select
                        value={block.properties?.language || 'javascript'}
                        onChange={(e) =>
                          updateBlock(index, {
                            properties: { ...block.properties, language: e.target.value }
                          })
                        }
                        className="bg-transparent text-xs text-[#9b9b9b] focus:outline-none cursor-pointer"
                      >
                        {CODE_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang} className="bg-[#202020] text-[#ebebeb]">
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(block.id, block.content)}
                      className="flex items-center gap-1 text-[11px] text-[#808080] hover:text-[#ebebeb] transition-colors"
                    >
                      {copiedCodeId === block.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <AutoResizeTextarea
                    autoFocus={focusTargetId === block.id}
                    onFocused={() => setFocusTargetId(null)}
                    value={block.content || ''}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="// Write or paste code snippet here..."
                    className="w-full p-3 bg-transparent text-xs font-mono text-[#d4d4d4] placeholder-[#555555] focus:outline-none leading-relaxed"
                    style={{ minHeight: '5rem' }}
                  />
                </div>
              )}

              {/* Image Block */}
              {block.type === 'image' && (
                <div className="my-2 p-3 rounded-lg bg-[#202020] border border-[#2d2d2d] space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-[#777777]" />
                    <input
                      type="text"
                      value={block.properties?.url || ''}
                      onChange={(e) =>
                        updateBlock(index, {
                          properties: { ...block.properties, url: e.target.value }
                        })
                      }
                      placeholder="Paste image URL (https://...)"
                      className="w-full bg-transparent text-xs text-[#ebebeb] placeholder-[#555555] focus:outline-none"
                    />
                  </div>
                  {block.properties?.url && (
                    <div className="rounded-lg overflow-hidden border border-[#2a2a2a] max-h-96 flex items-center justify-center bg-black/40">
                      <img
                        src={block.properties.url}
                        alt={block.content || 'Embedded image'}
                        className="object-contain max-h-96 w-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={block.content || ''}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Optional image caption..."
                    className="w-full bg-transparent text-xs text-[#777777] text-center focus:outline-none"
                  />
                </div>
              )}

              {/* Web Bookmark */}
              {block.type === 'bookmark' && (
                <div className="my-2 p-3.5 rounded-lg bg-[#202020] border border-[#2d2d2d] hover:border-[#3d3d3d] transition-all flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={block.content || ''}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                      placeholder="Bookmark title..."
                      className="w-full bg-transparent text-xs font-medium text-[#ebebeb] placeholder-[#555555] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={block.properties?.url || ''}
                      onChange={(e) =>
                        updateBlock(index, {
                          properties: { ...block.properties, url: e.target.value }
                        })
                      }
                      placeholder="https://example.com"
                      className="w-full bg-transparent text-[11px] text-[#4a9eff] placeholder-[#555555] focus:outline-none mt-1"
                    />
                  </div>
                  {block.properties?.url && (
                    <a
                      href={block.properties.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 ml-3"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Simple Table */}
              {block.type === 'table' && (
                <div className="my-3 overflow-x-auto border border-[#2d2d2d] rounded-lg">
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      {(block.properties?.rows || [
                        ['Column 1', 'Column 2', 'Column 3'],
                        ['Data A', 'Data B', 'Data C']
                      ]).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-[#2d2d2d]">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`p-2 border-r border-[#2d2d2d] ${
                                rIdx === 0 ? 'bg-[#232323] font-semibold text-[#ebebeb]' : 'text-[#c0c0c0]'
                              }`}
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const rowsCopy = JSON.parse(
                                    JSON.stringify(
                                      block.properties?.rows || [
                                        ['Column 1', 'Column 2', 'Column 3'],
                                        ['Data A', 'Data B', 'Data C']
                                      ]
                                    )
                                  );
                                  rowsCopy[rIdx][cIdx] = e.target.value;
                                  updateBlock(index, {
                                    properties: { ...block.properties, rows: rowsCopy }
                                  });
                                }}
                                className="w-full bg-transparent focus:outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-2 p-1.5 bg-[#1c1c1c] border-t border-[#2d2d2d] text-[11px] text-[#808080]">
                    <button
                      type="button"
                      onClick={() => {
                        const rows = JSON.parse(
                          JSON.stringify(
                            block.properties?.rows || [
                              ['Column 1', 'Column 2', 'Column 3'],
                              ['Data A', 'Data B', 'Data C']
                            ]
                          )
                        );
                        const colCount = rows[0]?.length || 3;
                        rows.push(new Array(colCount).fill(''));
                        updateBlock(index, { properties: { ...block.properties, rows } });
                      }}
                      className="hover:text-[#ebebeb] px-2 py-0.5 rounded hover:bg-white/5"
                    >
                      + Add Row
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const rows = JSON.parse(
                          JSON.stringify(
                            block.properties?.rows || [
                              ['Column 1', 'Column 2', 'Column 3'],
                              ['Data A', 'Data B', 'Data C']
                            ]
                          )
                        );
                        rows.forEach((r) => r.push(''));
                        updateBlock(index, { properties: { ...block.properties, rows } });
                      }}
                      className="hover:text-[#ebebeb] px-2 py-0.5 rounded hover:bg-white/5"
                    >
                      + Add Column
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-page */}
              {block.type === 'child_page' && (
                <div
                  onClick={() => block.properties?.pageId && onNavigateToPage(block.properties.pageId)}
                  className="my-1.5 flex items-center gap-2.5 p-2.5 rounded-lg bg-[#202020] hover:bg-[#262626] border border-[#2f2f2f] cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#4a9eff]" />
                  <span className="text-xs font-medium text-[#ebebeb] underline-offset-2 hover:underline">
                    {block.content || 'Untitled Sub-page'}
                  </span>
                </div>
              )}
            </div>

            {/* Inline Slash Command Menu */}
            {activeSlashIndex === index && (
              <SlashCommandMenu
                query={slashQuery}
                onSelect={handleSelectSlashCommand}
                onClose={() => setActiveSlashIndex(null)}
                position={slashMenuPos}
              />
            )}
          </div>
        );
      })}

      {/* Quick Add at bottom */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => insertBlockAfter(blocks.length - 1, 'paragraph')}
          className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#9b9b9b] transition-colors py-1 px-2 rounded hover:bg-white/5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Click to add a block</span>
        </button>
      </div>
    </div>
  );
}
