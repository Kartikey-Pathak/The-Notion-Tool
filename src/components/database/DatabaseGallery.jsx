'use client';

import React from 'react';
import { Plus, Maximize2, Trash2, Calendar, Tag } from 'lucide-react';

export default function DatabaseGallery({
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
      {records.map((record) => {
        const props = record.properties || {};
        const title = props[titleProp?.id] || 'Untitled';
        const status = statusProp ? props[statusProp.id] : null;
        const date = dateProp ? props[dateProp.id] : null;

        return (
          <div
            key={record.id}
            className="group rounded-xl bg-[#202020] border border-[#2f2f2f] hover:border-[#3d3d3d] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
            onClick={() => onOpenRecord(record)}
          >
            {/* Card Preview Banner */}
            <div className="h-24 bg-gradient-to-br from-[#262626] to-[#1c1c1c] border-b border-[#2a2a2a] p-3 flex items-start justify-between relative overflow-hidden">
              <span className="text-3xl">📄</span>
              <div
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onOpenRecord(record)}
                  className="p-1 rounded bg-black/40 text-[#c0c0c0] hover:text-white"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-1 rounded bg-black/40 text-[#c0c0c0] hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#ebebeb] line-clamp-2 leading-snug">
                  {title}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-[11px] text-[#808080]">
                {status ? (
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {status}
                  </span>
                ) : (
                  <span />
                )}
                {date && <span>{date}</span>}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add New Card in Gallery */}
      <button
        type="button"
        onClick={() =>
          onCreateRecord({
            [titleProp?.id]: 'Untitled Card'
          })
        }
        className="rounded-xl border border-dashed border-[#333333] hover:border-[#555555] bg-transparent hover:bg-white/5 p-6 flex flex-col items-center justify-center gap-2 text-xs text-[#808080] hover:text-[#ebebeb] transition-colors min-h-[140px]"
      >
        <Plus className="w-5 h-5" />
        <span>New card</span>
      </button>
    </div>
  );
}
