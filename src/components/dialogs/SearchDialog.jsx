'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, FileText, Database, X, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function SearchDialog({ isOpen, onClose, onSelectPage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isRecent, setIsRecent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      fetchResults('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const fetchResults = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setIsRecent(data.isRecent || false);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchResults(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectPage(results[selectedIndex].id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#2f2f2f]">
          <Search className="w-4 h-4 text-[#808080] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, notes, or databases..."
            className="w-full bg-transparent text-sm text-[#ebebeb] placeholder-[#666666] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#808080] hover:text-[#ebebeb] hover:bg-white/5 mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#808080] border border-[#333333]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#777777] flex items-center justify-between">
            <span>{isRecent ? 'Recently Updated' : `Results (${results.length})`}</span>
            {isRecent && <Clock className="w-3 h-3 text-[#666666]" />}
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#808080]">Searching workspace...</div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#808080]">
              No pages or matching text found for "{query}".
            </div>
          ) : (
            <div className="space-y-0.5">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectPage(item.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                      isSelected ? 'bg-white/10 text-white' : 'text-[#c0c0c0] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-base shrink-0">{item.icon || '📄'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#ebebeb] truncate flex items-center gap-1.5">
                          {item.title || 'Untitled'}
                          {item.isDatabase && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Database
                            </span>
                          )}
                        </div>
                        {item.snippet && (
                          <div className="text-[11px] text-[#808080] truncate mt-0.5">
                            {item.snippet}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[11px] text-[#808080] shrink-0 ml-2">
                        <span>Open</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between text-[11px] text-[#777777]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#252525] border border-[#333333] text-[10px]">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-[#252525] border border-[#333333] text-[10px]">↓</kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#252525] border border-[#333333] text-[10px]">↵</kbd>{' '}
              to select
            </span>
          </div>
          <span>Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}
