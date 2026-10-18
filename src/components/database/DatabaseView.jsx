'use client';

import React, { useState } from 'react';
import {
  Table as TableIcon,
  Kanban,
  List as ListIcon,
  LayoutGrid,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  X
} from 'lucide-react';
import DatabaseTable from './DatabaseTable';
import DatabaseBoard from './DatabaseBoard';
import DatabaseList from './DatabaseList';
import DatabaseGallery from './DatabaseGallery';
import RecordModal from './RecordModal';
import PropertyEditor from './PropertyEditor';

export default function DatabaseView({
  database,
  records = [],
  onUpdateDatabase,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord
}) {
  const [activeViewId, setActiveViewId] = useState(
    database?.defaultViewId || database?.views?.[0]?.id || 'view_table'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProp, setFilterProp] = useState('');
  const [filterVal, setFilterVal] = useState('');
  const [sortProp, setSortProp] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAddViewOpen, setIsAddViewOpen] = useState(false);

  const schema = database?.schema || [
    { id: 'prop_title', name: 'Name', type: 'title' }
  ];
  const views = database?.views || [
    { id: 'view_table', name: 'Table', type: 'table' },
    { id: 'view_board', name: 'Board', type: 'board' },
    { id: 'view_list', name: 'List', type: 'list' },
    { id: 'view_gallery', name: 'Gallery', type: 'gallery' }
  ];

  const currentView = views.find((v) => v.id === activeViewId) || views[0];

  // Filter & Search records
  let filteredRecords = records.filter((r) => {
    const props = r.properties || {};
    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = Object.values(props).some((v) =>
        String(v).toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    // Specific property filter
    if (filterProp && filterVal) {
      const val = String(props[filterProp] || '').toLowerCase();
      if (!val.includes(filterVal.toLowerCase())) return false;
    }
    return true;
  });

  // Sort records
  if (sortProp) {
    filteredRecords = [...filteredRecords].sort((a, b) => {
      const valA = a.properties?.[sortProp] || '';
      const valB = b.properties?.[sortProp] || '';
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Handle adding new custom property
  const handleAddProperty = async (newProp) => {
    const updatedSchema = [...schema, newProp];
    try {
      const res = await fetch(`/api/databases/${database.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: updatedSchema })
      });
      const data = await res.json();
      if (res.ok && data.database) {
        onUpdateDatabase(data.database);
      }
    } catch (err) {
      console.error('Failed to add property:', err);
    }
  };

  // Handle adding new view
  const handleAddNewView = async (viewType, viewName) => {
    const newView = {
      id: `view_${Date.now()}`,
      name: viewName || viewType.charAt(0).toUpperCase() + viewType.slice(1),
      type: viewType
    };
    const updatedViews = [...views, newView];
    try {
      const res = await fetch(`/api/databases/${database.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ views: updatedViews, defaultViewId: newView.id })
      });
      const data = await res.json();
      if (res.ok && data.database) {
        onUpdateDatabase(data.database);
        setActiveViewId(newView.id);
        setIsAddViewOpen(false);
      }
    } catch (err) {
      console.error('Failed to add view:', err);
    }
  };

  const getViewIcon = (type) => {
    switch (type) {
      case 'board':
        return <Kanban className="w-3.5 h-3.5" />;
      case 'list':
        return <ListIcon className="w-3.5 h-3.5" />;
      case 'gallery':
        return <LayoutGrid className="w-3.5 h-3.5" />;
      case 'table':
      default:
        return <TableIcon className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Views & Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2a2a2a] pb-2">
        {/* View Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {views.map((v) => {
            const isActive = v.id === activeViewId;
            return (
              <button
                key={v.id}
                onClick={() => setActiveViewId(v.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-[#ebebeb] shadow-sm'
                    : 'text-[#808080] hover:text-[#ebebeb] hover:bg-white/5'
                }`}
              >
                {getViewIcon(v.type)}
                <span>{v.name}</span>
              </button>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setIsAddViewOpen(!isAddViewOpen)}
              className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 text-xs flex items-center gap-1"
              title="Add view"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {isAddViewOpen && (
              <div className="absolute left-0 top-full mt-1 z-40 w-44 bg-[#252525] border border-[#333333] rounded-lg shadow-xl p-1 text-xs">
                <div className="px-2 py-1 text-[10px] text-[#666666] font-semibold uppercase">
                  Add View
                </div>
                {['table', 'board', 'list', 'gallery'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleAddNewView(t)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-left text-[#c0c0c0] capitalize"
                  >
                    {getViewIcon(t)}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search, Filter, Sort, New Record Toolbar */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="flex items-center px-2 py-1 bg-[#1a1a1a] border border-[#2f2f2f] rounded-md text-xs">
            <Search className="w-3 h-3 text-[#666666] mr-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter..."
              className="w-24 focus:w-36 transition-all bg-transparent text-[#ebebeb] placeholder-[#555555] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#808080] hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortProp}
            onChange={(e) => setSortProp(e.target.value)}
            className="bg-[#1a1a1a] border border-[#2f2f2f] rounded-md px-2 py-1 text-xs text-[#808080] hover:text-[#ebebeb] focus:outline-none cursor-pointer"
          >
            <option value="">Sort</option>
            {schema.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* New Record Button */}
          <button
            onClick={() =>
              onCreateRecord({
                [schema[0]?.id]: 'Untitled'
              })
            }
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2383e2] hover:bg-[#1d70c4] text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      <div className="pt-1">
        {currentView.type === 'board' ? (
          <DatabaseBoard
            schema={schema}
            records={filteredRecords}
            viewConfig={currentView}
            onUpdateRecord={onUpdateRecord}
            onCreateRecord={onCreateRecord}
            onDeleteRecord={onDeleteRecord}
            onOpenRecord={(rec) => setSelectedRecord(rec)}
          />
        ) : currentView.type === 'list' ? (
          <DatabaseList
            schema={schema}
            records={filteredRecords}
            onOpenRecord={(rec) => setSelectedRecord(rec)}
            onDeleteRecord={onDeleteRecord}
            onCreateRecord={onCreateRecord}
          />
        ) : currentView.type === 'gallery' ? (
          <DatabaseGallery
            schema={schema}
            records={filteredRecords}
            onOpenRecord={(rec) => setSelectedRecord(rec)}
            onDeleteRecord={onDeleteRecord}
            onCreateRecord={onCreateRecord}
          />
        ) : (
          <DatabaseTable
            schema={schema}
            records={filteredRecords}
            onUpdateRecord={onUpdateRecord}
            onCreateRecord={onCreateRecord}
            onDeleteRecord={onDeleteRecord}
            onOpenRecord={(rec) => setSelectedRecord(rec)}
            onOpenAddProperty={() => setIsAddPropertyOpen(true)}
          />
        )}
      </div>

      {/* Record Side-Peek / Modal */}
      <RecordModal
        isOpen={Boolean(selectedRecord)}
        record={selectedRecord}
        schema={schema}
        onClose={() => setSelectedRecord(null)}
        onUpdateRecord={(recId, updatedProps) => {
          onUpdateRecord(recId, updatedProps);
          setSelectedRecord((prev) => (prev ? { ...prev, properties: updatedProps } : null));
        }}
        onDeleteRecord={(recId) => {
          onDeleteRecord(recId);
          setSelectedRecord(null);
        }}
      />

      {/* Property Creator Modal */}
      <PropertyEditor
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onAddProperty={handleAddProperty}
      />
    </div>
  );
}
