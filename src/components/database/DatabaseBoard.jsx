'use client';

import React, { useState } from 'react';
import { Plus, Maximize2, Trash2, Calendar, CheckSquare, Tag, AlignLeft } from 'lucide-react';

export default function DatabaseBoard({
  schema = [],
  records = [],
  viewConfig = {},
  onUpdateRecord,
  onCreateRecord,
  onDeleteRecord,
  onOpenRecord
}) {
  const [newCardTitles, setNewCardTitles] = useState({});

  // Group by property (default to status or first select property)
  const groupByPropId =
    viewConfig?.groupBy ||
    schema.find((p) => p.type === 'status')?.id ||
    schema.find((p) => p.type === 'select')?.id ||
    schema[1]?.id;

  const groupProp = schema.find((p) => p.id === groupByPropId);
  const titleProp = schema.find((p) => p.type === 'title') || schema[0];

  // Derive columns from group property options (or fallback default columns)
  const columns = groupProp?.options && groupProp.options.length > 0
    ? groupProp.options.map((opt) => opt.name)
    : ['Not Started', 'In Progress', 'Done', 'Unassigned'];

  // Categorize records into columns
  const recordsByColumn = {};
  columns.forEach((col) => {
    recordsByColumn[col] = [];
  });
  recordsByColumn['Other'] = [];

  records.forEach((rec) => {
    const val = rec.properties?.[groupByPropId] || 'Unassigned';
    if (recordsByColumn[val]) {
      recordsByColumn[val].push(rec);
    } else {
      recordsByColumn['Other'].push(rec);
    }
  });

  const handleAddCardInColumn = (colName) => {
    const title = (newCardTitles[colName] || '').trim();
    if (!title) return;

    onCreateRecord({
      [titleProp?.id]: title,
      [groupByPropId]: colName === 'Unassigned' ? '' : colName
    });

    setNewCardTitles((prev) => ({ ...prev, [colName]: '' }));
  };

  const handleMoveCard = (record, targetCol) => {
    const updated = {
      ...record.properties,
      [groupByPropId]: targetCol === 'Unassigned' ? '' : targetCol
    };
    onUpdateRecord(record.id, updated);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
      {columns.map((colName) => {
        const colRecords = recordsByColumn[colName] || [];

        return (
          <div
            key={colName}
            className="w-72 shrink-0 flex flex-col rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] max-h-[75vh]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-[#ebebeb]">{colName}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[#252525] text-[#808080]">
                  {colRecords.length}
                </span>
              </div>
            </div>

            {/* Cards List */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {colRecords.map((record) => {
                const props = record.properties || {};
                const title = props[titleProp?.id] || 'Untitled';

                return (
                  <div
                    key={record.id}
                    className="group relative p-3 rounded-lg bg-[#242424] hover:bg-[#282828] border border-[#2f2f2f] hover:border-[#3a3a3a] shadow-sm transition-all text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        onClick={() => onOpenRecord(record)}
                        className="font-medium text-[#ebebeb] hover:text-[#4a9eff] cursor-pointer flex-1 leading-snug"
                      >
                        {title}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onOpenRecord(record)}
                          className="p-1 rounded text-[#808080] hover:text-[#ebebeb]"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1 rounded text-[#808080] hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Properties (due date, tags, priority) */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#2d2d2d] text-[11px]">
                      {props.prop_due && (
                        <span className="flex items-center gap-1 text-[#808080] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                          <Calendar className="w-3 h-3 text-yellow-500/80" />
                          <span>{props.prop_due}</span>
                        </span>
                      )}

                      {props.prop_priority && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {props.prop_priority}
                        </span>
                      )}

                      {Array.isArray(props.prop_tags) &&
                        props.prop_tags.map((t, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          >
                            {t}
                          </span>
                        ))}
                    </div>

                    {/* Quick Move Selector */}
                    <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-[#666666]">
                      <span>Move to:</span>
                      <select
                        value={colName}
                        onChange={(e) => handleMoveCard(record, e.target.value)}
                        className="bg-transparent text-[#808080] hover:text-[#ebebeb] cursor-pointer focus:outline-none"
                      >
                        {columns.map((c) => (
                          <option key={c} value={c} className="bg-[#202020] text-[#ebebeb]">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add at Column Bottom */}
            <div className="p-2 border-t border-[#262626]">
              <div className="flex items-center gap-1.5 bg-[#171717] rounded-lg px-2 py-1 border border-[#2d2d2d]">
                <Plus className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                <input
                  type="text"
                  value={newCardTitles[colName] || ''}
                  onChange={(e) =>
                    setNewCardTitles((prev) => ({ ...prev, [colName]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCardInColumn(colName)}
                  placeholder="New card..."
                  className="w-full bg-transparent text-xs text-[#ebebeb] placeholder-[#555555] focus:outline-none"
                />
                {(newCardTitles[colName] || '').trim() && (
                  <button
                    type="button"
                    onClick={() => handleAddCardInColumn(colName)}
                    className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded shrink-0"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
