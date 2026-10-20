'use client';

import React, { useState } from 'react';
import {
  Search,
  Home,
  Bell,
  Settings,
  Star,
  Plus,
  Trash2,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  Database,
  Unplug,
  ChevronsLeft,
  Layers
} from 'lucide-react';
import PageTreeItem from './PageTreeItem';

export default function Sidebar({
  isOpen,
  workspace,
  pages = [],
  activePageId,
  trashCount = 0,
  connectionInfo,
  onClose,
  onSelectPage,
  onCreatePage,
  onCreateSubPage,
  onToggleFavorite,
  onDuplicatePage,
  onDeletePage,
  onOpenSearch,
  onOpenSettings,
  onOpenTemplates,
  onOpenTrash,
  onDisconnect
}) {
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [showInboxNotice, setShowInboxNotice] = useState(false);

  // Filter root pages (parentId is null/empty and not in trash)
  const rootPages = pages.filter((p) => !p.parentId && !p.isTrash);
  const favoritePages = pages.filter((p) => p.isFavorite && !p.isTrash);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 h-screen bg-[#202020] border-r border-[#262626] flex flex-col select-none transition-all duration-200 ease-in-out shrink-0 ${isOpen
            ? 'w-60 translate-x-0 opacity-100'
            : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 overflow-hidden pointer-events-none opacity-0'
          }`}
      >
        {/* Workspace Switcher / Header */}
        <div className="h-12 px-3 border-b border-[#262626] flex items-center justify-between shrink-0">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors min-w-0 flex-1 text-left"
          >
            <div className="w-5 h-5 rounded bg-[#2b2b2b] flex items-center justify-center text-xs shrink-0 font-medium">
              {workspace?.icon || 'N'}
            </div>
            <span className="text-xs font-semibold text-[#ebebeb] truncate flex-1">
              {workspace?.name || 'Personal Workspace'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#777777] shrink-0" />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close sidebar (Ctrl+\)"
            className="p-1.5 rounded-md text-[#777777] hover:text-[#ebebeb] hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {/* Top Quick Actions */}
          <div className="space-y-0.5">
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#9b9b9b] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </div>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#282828] text-[#777777] border border-[#333333]">
                Ctrl K
              </span>
            </button>

            {/* Home / Welcome */}
            <button
              onClick={() => {
                if (rootPages.length > 0) onSelectPage(rootPages[0].id);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#9b9b9b] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* Inbox / Updates */}
            <div className="relative">
              <button
                onClick={() => setShowInboxNotice(!showInboxNotice)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#9b9b9b] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Inbox</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </button>

              {showInboxNotice && (
                <div className="p-3 my-1 rounded-lg bg-[#252525] border border-[#333333] text-xs space-y-1">
                  <div className="font-medium text-[#ebebeb]">All caught up!</div>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    No new workspace updates or notifications at this time.
                  </p>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#9b9b9b] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Favorites Section */}
          {favoritePages.length > 0 && (
            <div className="space-y-0.5">
              <div
                onClick={() => setFavoritesExpanded(!favoritesExpanded)}
                className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#777777] hover:text-[#a0a0a0] cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-yellow-500/80 fill-yellow-500/80" />
                  <span>Favorites</span>
                </div>
                {favoritesExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </div>

              {favoritesExpanded && (
                <div className="space-y-0.5 pl-1">
                  {favoritePages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => onSelectPage(page.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${activePageId === page.id
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-[#9b9b9b] hover:bg-white/5 hover:text-[#ebebeb]'
                        }`}
                    >
                      <span className="text-sm shrink-0">{page.icon || '📄'}</span>
                      <span className="truncate flex-1">{page.title || 'Untitled'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Private Pages Tree Section */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#777777]">
              <div
                onClick={() => setPagesExpanded(!pagesExpanded)}
                className="flex items-center gap-1.5 hover:text-[#a0a0a0] cursor-pointer"
              >
                <span>Private</span>
                {pagesExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </div>

              <button
                onClick={() => onCreatePage()}
                title="Add a page"
                className="p-0.5 rounded text-[#777777] hover:text-[#ebebeb] hover:bg-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {pagesExpanded && (
              <div className="space-y-0.5">
                {rootPages.map((page) => (
                  <PageTreeItem
                    key={page.id}
                    page={page}
                    allPages={pages}
                    activePageId={activePageId}
                    level={0}
                    onSelectPage={onSelectPage}
                    onCreateSubPage={onCreateSubPage}
                    onToggleFavorite={onToggleFavorite}
                    onDuplicatePage={onDuplicatePage}
                    onDeletePage={onDeletePage}
                  />
                ))}

                {/* + Add a page quick button */}
                <button
                  onClick={() => onCreatePage()}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#777777] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add a page</span>
                </button>
              </div>
            )}
          </div>

          {/* Extra Notion Tools */}
          <div className="pt-2 border-t border-[#262626] space-y-0.5">
            {/* Templates */}
            <button
              onClick={onOpenTemplates}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#9b9b9b] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
              <span>Templates</span>
            </button>

            {/* Trash */}
            <button
              onClick={onOpenTrash}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#9b9b9b] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Trash</span>
              </div>
              {trashCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#282828] text-[#808080]">
                  {trashCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Connection Status Footnote */}
        <div className="p-3 border-t border-[#262626] bg-[#1a1a1a]/80 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-[#ebebeb] truncate">
                  {connectionInfo?.dbName || 'MongoDB Connected'}
                </div>
                <div className="text-[10px] text-[#666666] truncate">
                  {connectionInfo?.host || 'Cluster / Local'}
                </div>
              </div>
            </div>

            <button
              onClick={onDisconnect}
              title="Disconnect database"
              className="p-1 rounded text-[#777777] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Unplug className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
