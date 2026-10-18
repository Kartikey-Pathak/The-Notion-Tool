'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ConnectionSetup from '@/components/connection/ConnectionSetup';
import Sidebar from './Sidebar';
import WorkspaceHeader from './WorkspaceHeader';
import PageEditor from '@/components/editor/PageEditor';
import SearchDialog from '@/components/dialogs/SearchDialog';
import SettingsDialog from '@/components/dialogs/SettingsDialog';
import TrashDialog from '@/components/dialogs/TrashDialog';
import TemplatePicker from '@/components/dialogs/TemplatePicker';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Loader2 } from 'lucide-react';

export default function WorkspaceLayout() {
  // Connection state
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);

  // Workspace & Pages state
  const [workspace, setWorkspace] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [activePageData, setActivePageData] = useState(null);
  const [loadingActivePage, setLoadingActivePage] = useState(false);
  const [trashCount, setTrashCount] = useState(0);

  // Layout UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dialog states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [pageToDeleteId, setPageToDeleteId] = useState(null);

  // 1. Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/connection');
      const data = await res.json();
      if (data.isConnected) {
        setIsConnected(true);
        setConnectionInfo(data);
        await loadWorkspaceAndPages();
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Failed to check connection:', err);
      setIsConnected(false);
    } finally {
      setConnectionChecked(true);
    }
  };

  // 2. Load workspace metadata & pages
  const loadWorkspaceAndPages = async () => {
    try {
      const [wsRes, pagesRes, trashRes] = await Promise.all([
        fetch('/api/workspace'),
        fetch('/api/pages'),
        fetch('/api/trash')
      ]);

      const wsData = await wsRes.json();
      const pagesData = await pagesRes.json();
      const trashData = await trashRes.json();

      if (wsData.workspace) setWorkspace(wsData.workspace);
      const loadedPages = pagesData.pages || [];
      setPages(loadedPages);
      setTrashCount((trashData.pages || []).length);

      // Select first page if none currently selected
      if (loadedPages.length > 0 && !activePageId) {
        setActivePageId(loadedPages[0].id);
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  // 3. Load active page data (blocks + database if applicable)
  const loadActivePage = useCallback(async (id) => {
    if (!id) return;
    setLoadingActivePage(true);
    try {
      const res = await fetch(`/api/pages/${id}`);
      const data = await res.json();
      if (res.ok && data.page) {
        setActivePageData(data);
      }
    } catch (err) {
      console.error('Failed to load page:', err);
    } finally {
      setLoadingActivePage(false);
    }
  }, []);

  useEffect(() => {
    if (activePageId && isConnected) {
      loadActivePage(activePageId);
    }
  }, [activePageId, isConnected, loadActivePage]);

  // Global keyboard shortcuts (Ctrl+K for search, Ctrl+\ to toggle sidebar)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '\\' || e.code === 'Backslash')) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Handlers for Pages CRUD
  const handleCreatePage = async (parentId = null, isDatabase = false) => {
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: isDatabase ? 'Untitled Database' : 'Untitled',
          parentId,
          icon: isDatabase ? '📊' : '📄',
          isDatabase
        })
      });
      const data = await res.json();
      if (res.ok && data.page) {
        setPages((prev) => [...prev, data.page]);
        setActivePageId(data.page.id);
      }
    } catch (err) {
      console.error('Failed to create page:', err);
    }
  };

  const handleToggleFavorite = async (page) => {
    try {
      const updatedFav = !page.isFavorite;
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: updatedFav })
      });
      if (res.ok) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, isFavorite: updatedFav } : p))
        );
        if (activePageData?.page?.id === page.id) {
          setActivePageData((prev) => ({
            ...prev,
            page: { ...prev.page, isFavorite: updatedFav }
          }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDuplicatePage = async (id) => {
    try {
      const res = await fetch(`/api/pages/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.page) {
        setPages((prev) => [...prev, data.page]);
        setActivePageId(data.page.id);
      }
    } catch (err) {
      console.error('Failed to duplicate page:', err);
    }
  };

  const handleDeletePage = async (id) => {
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        const trashedIds = data.trashedIds || [id];
        setPages((prev) => prev.filter((p) => !trashedIds.includes(p.id)));
        setTrashCount((prev) => prev + trashedIds.length);
        setPageToDeleteId(null);

        // If active page was deleted, switch to another page
        if (trashedIds.includes(activePageId)) {
          const remaining = pages.filter((p) => !trashedIds.includes(p.id));
          setActivePageId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  };

  const handleUpdatePageMetadata = (updated) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === updated.id
          ? {
              ...p,
              title: updated.title !== undefined ? updated.title : p.title,
              icon: updated.icon !== undefined ? updated.icon : p.icon,
              cover: updated.cover !== undefined ? updated.cover : p.cover
            }
          : p
      )
    );
  };

  // Database Record Handlers
  const handleCreateRecord = async (properties) => {
    if (!activePageData?.database) return;
    try {
      const res = await fetch(`/api/databases/${activePageData.database.id}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties })
      });
      const data = await res.json();
      if (res.ok && data.record) {
        setActivePageData((prev) => ({
          ...prev,
          records: [...(prev.records || []), data.record]
        }));
      }
    } catch (err) {
      console.error('Failed to create record:', err);
    }
  };

  const handleUpdateRecord = async (recordId, properties) => {
    if (!activePageData?.database) return;
    try {
      const res = await fetch(
        `/api/databases/${activePageData.database.id}/records/${recordId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        }
      );
      const data = await res.json();
      if (res.ok && data.record) {
        setActivePageData((prev) => ({
          ...prev,
          records: (prev.records || []).map((r) => (r.id === recordId ? data.record : r))
        }));
      }
    } catch (err) {
      console.error('Failed to update record:', err);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!activePageData?.database) return;
    try {
      const res = await fetch(
        `/api/databases/${activePageData.database.id}/records/${recordId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setActivePageData((prev) => ({
          ...prev,
          records: (prev.records || []).filter((r) => r.id !== recordId)
        }));
      }
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/connection', { method: 'DELETE' });
      setIsConnected(false);
      setWorkspace(null);
      setPages([]);
      setActivePageId(null);
      setActivePageData(null);
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  // If initial connection check is pending
  if (!connectionChecked) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center text-xs text-[#808080] gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  // If no database connection, show onboarding setup screen
  if (!isConnected) {
    return (
      <ConnectionSetup
        onConnected={(info) => {
          setIsConnected(true);
          setConnectionInfo(info);
          loadWorkspaceAndPages();
        }}
      />
    );
  }

  const activePage = activePageData?.page || pages.find((p) => p.id === activePageId);

  return (
    <div className="flex h-screen w-full bg-[#191919] text-[#ebebeb] overflow-hidden">
      {/* Notion Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        workspace={workspace}
        pages={pages}
        activePageId={activePageId}
        trashCount={trashCount}
        connectionInfo={connectionInfo}
        onClose={() => setIsSidebarOpen(false)}
        onSelectPage={(id) => setActivePageId(id)}
        onCreatePage={() => handleCreatePage(null, false)}
        onCreateSubPage={(parentId) => handleCreatePage(parentId, false)}
        onToggleFavorite={handleToggleFavorite}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={(id) => setPageToDeleteId(id)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenTrash={() => setIsTrashOpen(true)}
        onDisconnect={handleDisconnect}
      />

      {/* Main Workspace Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Workspace Top Header */}
        <WorkspaceHeader
          workspace={workspace}
          activePage={activePage}
          allPages={pages}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onSelectPage={(id) => setActivePageId(id)}
          onToggleFavorite={handleToggleFavorite}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={(id) => setPageToDeleteId(id)}
        />

        {/* Central Document Editor Canvas */}
        <main className="flex-1 overflow-y-auto">
          {loadingActivePage ? (
            <div className="py-24 flex items-center justify-center gap-2 text-xs text-[#808080]">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Opening page...</span>
            </div>
          ) : activePage ? (
            <PageEditor
              page={activePageData?.page || activePage}
              database={activePageData?.database}
              records={activePageData?.records || []}
              onUpdatePageMetadata={handleUpdatePageMetadata}
              onUpdateDatabase={(db) =>
                setActivePageData((prev) => ({ ...prev, database: db }))
              }
              onCreateRecord={handleCreateRecord}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onNavigateToPage={(id) => setActivePageId(id)}
            />
          ) : (
            <div className="py-28 text-center text-xs text-[#777777] space-y-3">
              <div>No page selected or all pages in trash.</div>
              <button
                onClick={() => handleCreatePage(null, false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#2383e2] text-white text-xs font-medium"
              >
                + Create New Page
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={(id) => setActivePageId(id)}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workspace={workspace}
        onUpdateWorkspace={(ws) => setWorkspace(ws)}
        onDisconnect={handleDisconnect}
        onResetWorkspace={(ws) => {
          setWorkspace(ws);
          loadWorkspaceAndPages();
        }}
      />

      <TrashDialog
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        onRestored={(id) => {
          loadWorkspaceAndPages();
          setActivePageId(id);
        }}
      />

      <TemplatePicker
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(newPageId) => {
          loadWorkspaceAndPages();
          setActivePageId(newPageId);
        }}
      />

      {/* Confirm Soft Delete Page */}
      <ConfirmDialog
        isOpen={Boolean(pageToDeleteId)}
        title="Move page to Trash?"
        message="This page and all of its nested subpages will be moved to the trash. You can restore it anytime."
        confirmText="Move to Trash"
        isDestructive={true}
        onConfirm={() => handleDeletePage(pageToDeleteId)}
        onCancel={() => setPageToDeleteId(null)}
      />
    </div>
  );
}
