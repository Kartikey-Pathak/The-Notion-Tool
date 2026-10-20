'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRightSquare,
  Quote,
  Lightbulb,
  Minus,
  Code,
  Table,
  Image as ImageIcon,
  Bookmark,
  FileText
} from 'lucide-react';

export const COMMAND_ITEMS = [
  { id: 'paragraph', title: 'Text', desc: 'Plain text (Shift+Enter inserts a new line).', icon: Type, keywords: ['p', 'text', 'paragraph'] },
  { id: 'heading1', title: 'Heading 1', desc: 'Big section heading.', icon: Heading1, keywords: ['h1', 'heading', 'title'] },
  { id: 'heading2', title: 'Heading 2', desc: 'Medium section heading.', icon: Heading2, keywords: ['h2', 'subheading'] },
  { id: 'heading3', title: 'Heading 3', desc: 'Small section heading.', icon: Heading3, keywords: ['h3', 'subheading'] },
  { id: 'bullet_list', title: 'Bulleted list', desc: 'Create a simple bulleted list.', icon: List, keywords: ['ul', 'bullet', 'list'] },
  { id: 'numbered_list', title: 'Numbered list', desc: 'Create a list with numbering.', icon: ListOrdered, keywords: ['ol', 'number', 'ordered'] },
  { id: 'todo', title: 'To-do list', desc: 'Track tasks with a to-do list.', icon: CheckSquare, keywords: ['todo', 'task', 'check', 'checkbox'] },
  { id: 'toggle', title: 'Toggle list', desc: 'Toggles can show and hide content.', icon: ChevronRightSquare, keywords: ['toggle', 'collapse'] },
  { id: 'quote', title: 'Quote', desc: 'Capture a quote or citation.', icon: Quote, keywords: ['quote', 'cite'] },
  { id: 'callout', title: 'Callout', desc: 'Make writing stand out.', icon: Lightbulb, keywords: ['callout', 'box', 'note', 'alert'] },
  { id: 'divider', title: 'Divider', desc: 'Visually divide blocks.', icon: Minus, keywords: ['divider', 'hr', 'line'] },
  { id: 'code', title: 'Code', desc: 'Capture a code snippet with syntax formatting.', icon: Code, keywords: ['code', 'snippet', 'syntax'] },
  { id: 'table', title: 'Simple Table', desc: 'Add a clean table with rows and columns.', icon: Table, keywords: ['table', 'grid', 'sheet'] },
  { id: 'image', title: 'Image', desc: 'Embed an image with a link.', icon: ImageIcon, keywords: ['image', 'img', 'photo', 'picture'] },
  { id: 'bookmark', title: 'Web Bookmark', desc: 'Save a visual link preview.', icon: Bookmark, keywords: ['bookmark', 'link', 'url'] },
  { id: 'child_page', title: 'Sub-page', desc: 'Create a nested sub-page inside this page.', icon: FileText, keywords: ['page', 'subpage', 'nested'] }
];

export default function SlashCommandMenu({
  query = '',
  onSelect,
  onClose,
  position = { top: 0, left: 0 }
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const cleanQuery = query.toLowerCase().replace(/^\//, '').trim();

  const filteredItems = COMMAND_ITEMS.filter((item) => {
    if (!cleanQuery) return true;
    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.desc.toLowerCase().includes(cleanQuery) ||
      item.keywords.some((k) => k.toLowerCase().includes(cleanQuery))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  if (filteredItems.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="absolute z-50 w-72 max-h-80 overflow-y-auto bg-[#252525] border border-[#333333] rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#777777]">
        Basic Blocks
      </div>

      <div className="space-y-0.5 mt-0.5">
        {filteredItems.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                isSelected ? 'bg-white/10 text-white' : 'text-[#c0c0c0] hover:bg-white/5'
              }`}
            >
              <div className="w-8 h-8 rounded-md bg-[#1d1d1d] border border-[#303030] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#9b9b9b]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-[#ebebeb]">{item.title}</div>
                <div className="text-[10px] text-[#777777] truncate">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-1 pt-1.5 px-2.5 pb-0.5 border-t border-[#303030] text-[10px] text-[#777777]">
        Tip: Press <kbd className="px-1 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[9px] text-[#a0a0a0]">Shift+Enter</kbd> to insert a new line
      </div>
    </div>
  );
}
