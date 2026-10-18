'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Star,
  Trash2,
  Copy,
  FolderPlus,
  FileText
} from 'lucide-react';

export default function PageTreeItem({
  page,
  allPages = [],
  activePageId,
  level = 0,
  onSelectPage,
  onCreateSubPage,
  onToggleFavorite,
  onDuplicatePage,
  onDeletePage
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Find direct child pages
  const childPages = allPages.filter((p) => p.parentId === page.id && !p.isTrash);
  const hasChildren = childPages.length > 0;
  const isActive = activePageId === page.id;

  const handleChevronClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleAddChild = (e) => {
    e.stopPropagation();
    setIsExpanded(true);
    onCreateSubPage(page.id);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div className="select-none">
      {/* Item Row */}
      <div
        onClick={() => onSelectPage(page.id)}
        style={{ paddingLeft: `${Math.min(level * 14 + 10, 60)}px` }}
        className={`group relative flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition-colors ${
          isActive
            ? 'bg-white/10 text-white font-medium'
            : 'text-[#9b9b9b] hover:bg-white/5 hover:text-[#ebebeb]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Chevron expand/collapse */}
          <button
            type="button"
            onClick={handleChevronClick}
            className={`p-0.5 rounded text-[#777777] hover:text-[#ebebeb] hover:bg-white/10 transition-colors ${
              hasChildren ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Icon */}
          <span className="text-sm shrink-0">{page.icon || '📄'}</span>

          {/* Title */}
          <span className="truncate leading-tight flex-1">
            {page.title || 'Untitled'}
          </span>
        </div>

        {/* Action Buttons on Hover */}
        <div
          className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-[#777777] shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleAddChild}
            title="Add a page inside"
            className="p-1 rounded hover:text-[#ebebeb] hover:bg-white/10 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={handleMenuClick}
              title="Page options"
              className="p-1 rounded hover:text-[#ebebeb] hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>

            {/* Context Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50 w-44 bg-[#252525] border border-[#333333] rounded-lg shadow-2xl p-1 text-xs text-[#ebebeb] animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              >
                <button
                  onClick={() => onToggleFavorite(page)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/5 text-left text-xs"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      page.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-[#808080]'
                    }`}
                  />
                  <span>{page.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>

                <button
                  onClick={() => onDuplicatePage(page.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/5 text-left text-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-[#808080]" />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={() => handleAddChild({ stopPropagation: () => {} })}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/5 text-left text-xs"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#808080]" />
                  <span>Add Sub-page</span>
                </button>

                <div className="h-px bg-[#333333] my-1" />

                <button
                  onClick={() => onDeletePage(page.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-500/10 text-red-400 text-left text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recursive Nested Subpages */}
      {isExpanded && hasChildren && (
        <div className="space-y-0.5 mt-0.5 border-l border-[#2a2a2a] ml-4">
          {childPages.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              allPages={allPages}
              activePageId={activePageId}
              level={level + 1}
              onSelectPage={onSelectPage}
              onCreateSubPage={onCreateSubPage}
              onToggleFavorite={onToggleFavorite}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
