'use client';

import React from 'react';
import { Maximize2, Trash2, Calendar, Tag, Plus } from 'lucide-react';

export default function DatabaseList({
  schema = [],
  records = [],
  onOpenRecord,
  onDeleteRecord,
  onCreateRecord
}) {
  const titleProp = schema.find((p) => p.type === 'title') || schema[0];
  const statusProp = schema.find((p) => p.type === 'status' || p.type === 'select');
  const dateProp = schema.find((p) => p.type === 'date');

  return (
    <div className="space-y-1 max-w-4xl">
      <div className="border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#1a1a1a]">
        {records.map((record) => {
          const props = record.properties || {};
          const title = props[titleProp?.id] || 'Untitled';
          const status = statusProp ? props[statusProp.id] : null;
          const date = dateProp ? props[dateProp.id] : null;

          return (
            <div
              key={record.id}
              className="group flex items-center justify-between px-4 py-2.5 border-b border-[#252525] hover:bg-[#202020] transition-colors text-xs"
            >
              <div
                onClick={() => onOpenRecord(record)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <span className="text-base">📄</span>
                <span className="font-medium text-[#ebebeb] truncate hover:text-[#4a9eff]">
                  {title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {status && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {status}
                  </span>
                )}
                {date && (
                  <span className="text-[11px] text-[#808080] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-yellow-500/70" />
                    <span>{date}</span>
                  </span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
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
            </div>
          );
        })}

        {/* Add Row Button */}
        <button
          type="button"
          onClick={() =>
            onCreateRecord({
              [titleProp?.id]: 'Untitled'
            })
          }
          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New item</span>
        </button>
      </div>
    </div>
  );
}
