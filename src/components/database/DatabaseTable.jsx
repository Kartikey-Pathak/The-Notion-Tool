'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Maximize2, Tag, Calendar, CheckSquare, Hash, Link2, Mail, AlignLeft } from 'lucide-react';

const TAG_STYLES = {
  gray: 'bg-neutral-800 text-neutral-300 border-neutral-700',
  blue: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  green: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  yellow: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  red: 'bg-red-950/60 text-red-300 border-red-800/60',
  purple: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
  pink: 'bg-pink-950/60 text-pink-300 border-pink-800/60'
};

export default function DatabaseTable({
  schema = [],
  records = [],
  onUpdateRecord,
  onCreateRecord,
  onDeleteRecord,
  onOpenRecord,
  onOpenAddProperty
}) {
  const [newRowTitle, setNewRowTitle] = useState('');

  const titleProp = schema.find((p) => p.type === 'title') || schema[0];
  const otherProps = schema.filter((p) => p.id !== titleProp?.id);

  const handleCellChange = (recordId, currentProperties, propId, val) => {
    const updated = { ...currentProperties, [propId]: val };
    onUpdateRecord(recordId, updated);
  };

  const handleAddQuickRow = () => {
    onCreateRecord({
      [titleProp?.id]: newRowTitle.trim() || 'Untitled'
    });
    setNewRowTitle('');
  };

  return (
    <div className="w-full overflow-x-auto border border-[#2d2d2d] rounded-lg bg-[#181818]">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-[#2d2d2d] bg-[#1c1c1c] text-[#808080]">
            <th className="w-10 px-3 py-2 text-center border-r border-[#2d2d2d] select-none font-normal">
              #
            </th>

            {/* Title Column Header */}
            <th className="min-w-[200px] px-3 py-2 font-medium border-r border-[#2d2d2d]">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" />
                <span>{titleProp?.name || 'Name'}</span>
              </div>
            </th>

            {/* Other Property Headers */}
            {otherProps.map((prop) => (
              <th
                key={prop.id}
                className="min-w-[150px] px-3 py-2 font-medium border-r border-[#2d2d2d]"
              >
                <div className="flex items-center gap-2">
                  {prop.type === 'status' && <Tag className="w-3 h-3 text-blue-400" />}
                  {prop.type === 'select' && <Tag className="w-3 h-3 text-purple-400" />}
                  {prop.type === 'multi-select' && <Tag className="w-3 h-3 text-pink-400" />}
                  {prop.type === 'date' && <Calendar className="w-3 h-3 text-yellow-400" />}
                  {prop.type === 'checkbox' && <CheckSquare className="w-3 h-3 text-emerald-400" />}
                  {prop.type === 'number' && <Hash className="w-3 h-3 text-orange-400" />}
                  {prop.type === 'url' && <Link2 className="w-3 h-3 text-blue-400" />}
                  {prop.type === 'email' && <Mail className="w-3 h-3 text-indigo-400" />}
                  {prop.type === 'text' && <AlignLeft className="w-3 h-3" />}
                  <span>{prop.name}</span>
                </div>
              </th>
            ))}

            {/* Add Property Button */}
            <th className="w-28 px-3 py-2 font-normal">
              <button
                type="button"
                onClick={onOpenAddProperty}
                className="flex items-center gap-1 text-[#808080] hover:text-[#ebebeb] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Column</span>
              </button>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {records.map((record, rIdx) => {
            const props = record.properties || {};

            return (
              <tr
                key={record.id}
                className="group border-b border-[#262626] hover:bg-[#202020] transition-colors"
              >
                {/* Row Number & Open/Delete controls */}
                <td className="px-2 py-2 text-center text-[#666666] border-r border-[#262626] select-none">
                  <div className="group-hover:hidden">{rIdx + 1}</div>
                  <div className="hidden group-hover:flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenRecord(record)}
                      title="Open side-peek"
                      className="p-0.5 rounded text-[#808080] hover:text-[#ebebeb]"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      title="Delete record"
                      className="p-0.5 rounded text-[#808080] hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Title Cell */}
                <td className="px-3 py-1.5 border-r border-[#262626]">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={props[titleProp?.id] || ''}
                      onChange={(e) =>
                        handleCellChange(record.id, props, titleProp.id, e.target.value)
                      }
                      placeholder="Empty"
                      className="w-full bg-transparent text-[#ebebeb] placeholder-[#555555] font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onOpenRecord(record)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-[#808080] hover:text-[#ebebeb] px-1.5 py-0.5 rounded hover:bg-white/5 transition-opacity shrink-0"
                    >
                      OPEN
                    </button>
                  </div>
                </td>

                {/* Other Property Cells */}
                {otherProps.map((prop) => {
                  const val = props[prop.id];

                  return (
                    <td key={prop.id} className="px-3 py-1.5 border-r border-[#262626]">
                      {/* Status / Select Tag */}
                      {(prop.type === 'status' || prop.type === 'select') && (
                        <select
                          value={val || ''}
                          onChange={(e) =>
                            handleCellChange(record.id, props, prop.id, e.target.value)
                          }
                          className="bg-[#242424] border border-[#333333] rounded px-2 py-0.5 text-xs text-[#ebebeb] focus:outline-none focus:border-[#4a9eff] cursor-pointer"
                        >
                          <option value="">None</option>
                          {(prop.options || []).map((opt) => (
                            <option key={opt.id || opt.name} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Multi-Select */}
                      {prop.type === 'multi-select' && (
                        <div className="flex flex-wrap items-center gap-1">
                          {(Array.isArray(val) ? val : []).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => onOpenRecord(record)}
                            className="text-[10px] text-[#666666] hover:text-[#ebebeb] px-1"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Date */}
                      {prop.type === 'date' && (
                        <input
                          type="date"
                          value={val || ''}
                          onChange={(e) =>
                            handleCellChange(record.id, props, prop.id, e.target.value)
                          }
                          className="bg-transparent text-[#ebebeb] focus:outline-none cursor-pointer"
                        />
                      )}

                      {/* Checkbox */}
                      {prop.type === 'checkbox' && (
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) =>
                            handleCellChange(record.id, props, prop.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded bg-[#202020] border-[#444444] text-[#2383e2] cursor-pointer accent-[#2383e2]"
                        />
                      )}

                      {/* Number */}
                      {prop.type === 'number' && (
                        <input
                          type="number"
                          value={val || ''}
                          onChange={(e) =>
                            handleCellChange(record.id, props, prop.id, e.target.value)
                          }
                          placeholder="Empty"
                          className="w-full bg-transparent text-[#ebebeb] placeholder-[#444444] focus:outline-none"
                        />
                      )}

                      {/* URL / Email / Text */}
                      {['url', 'email', 'text'].includes(prop.type) && (
                        <input
                          type={prop.type === 'email' ? 'email' : 'text'}
                          value={val || ''}
                          onChange={(e) =>
                            handleCellChange(record.id, props, prop.id, e.target.value)
                          }
                          placeholder="Empty"
                          className="w-full bg-transparent text-[#ebebeb] placeholder-[#444444] focus:outline-none"
                        />
                      )}
                    </td>
                  );
                })}

                <td className="px-3 py-1.5" />
              </tr>
            );
          })}

          {/* Quick Add Row at bottom */}
          <tr className="hover:bg-[#1f1f1f] transition-colors">
            <td className="px-3 py-2 text-center text-[#666666] border-r border-[#262626]">
              <Plus className="w-3.5 h-3.5 mx-auto" />
            </td>
            <td className="px-3 py-2 border-r border-[#262626]" colSpan={schema.length + 1}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newRowTitle}
                  onChange={(e) => setNewRowTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuickRow()}
                  placeholder="+ New record (type name and press Enter)..."
                  className="w-full bg-transparent text-xs text-[#ebebeb] placeholder-[#666666] focus:outline-none"
                />
                {newRowTitle.trim() && (
                  <button
                    type="button"
                    onClick={handleAddQuickRow}
                    className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-medium shrink-0"
                  >
                    Add
                  </button>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
