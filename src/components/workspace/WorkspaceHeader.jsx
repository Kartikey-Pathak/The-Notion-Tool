'use client';

import React, { useState } from 'react';
import {
  PanelLeft,
  PanelLeftClose,
  ChevronRight,
  Star,
  MoreHorizontal,
  Share2,
  Download,
  Copy,
  Trash2,
  Check
} from 'lucide-react';

export default function WorkspaceHeader({
  workspace,
  activePage,
  allPages = [],
  isSidebarOpen,
  onToggleSidebar,
  onSelectPage,
  onToggleFavorite,
  onDuplicatePage,
  onDeletePage
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Build breadcrumbs path by traversing parents
  const breadcrumbs = [];
  let curr = activePage;
  while (curr) {
    breadcrumbs.unshift(curr);
    curr = curr.parentId ? allPages.find((p) => p.id === curr.parentId) : null;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportJSON = () => {
    if (!activePage) return;
    const blob = new Blob([JSON.stringify(activePage, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activePage.title || 'page').toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-20 h-12 border-b border-[#262626] bg-[#191919]/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between">
      {/* Left side: Toggle button & Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Close sidebar (Ctrl+\\)" : "Open sidebar (Ctrl+\\)"}
          className="p-1.5 rounded-md text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs text-[#808080] min-w-0 overflow-hidden truncate">
          <span className="truncate hover:text-[#ebebeb] cursor-pointer">
            {workspace?.name || 'Workspace'}
          </span>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3 h-3 text-[#555555] shrink-0" />
              <button
                type="button"
                onClick={() => onSelectPage(crumb.id)}
                className={`truncate hover:text-[#ebebeb] flex items-center gap-1 ${
                  idx === breadcrumbs.length - 1 ? 'text-[#ebebeb] font-medium' : ''
                }`}
              >
                <span>{crumb.icon || '📄'}</span>
                <span className="truncate">{crumb.title || 'Untitled'}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right side: Favorite & More menu */}
      {activePage && (
        <div className="flex items-center gap-1 shrink-0 ml-4">
          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleFavorite(activePage)}
            title={activePage.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="p-1.5 rounded-lg text-[#808080] hover:text-yellow-400 hover:bg-white/5 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                activePage.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-lg text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50 w-48 bg-[#252525] border border-[#333333] rounded-xl shadow-2xl p-1 text-xs text-[#ebebeb] animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowMoreMenu(false)}
              >
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#808080]" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDuplicatePage(activePage.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#808080]" />
                  <span>Duplicate Page</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                >
                  <Download className="w-3.5 h-3.5 text-[#808080]" />
                  <span>Export as JSON</span>
                </button>

                <div className="h-px bg-[#333333] my-1" />

                <button
                  onClick={() => onDeletePage(activePage.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Page</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
