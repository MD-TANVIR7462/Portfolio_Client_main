import React, { useState, useMemo } from 'react';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiEdit2,
  FiTrash2,
  FiX,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/FeedbackStates';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  isLoading = false,
  navigating = false,
  title = null,
  searchPlaceholder = 'Quick search records...',
  searchKeys = [],
  pageSize = 10,
  currentPage = 1,
  total = 0,
  quickFilterText = '',
  setQuickFilterText,
  onPageChange,
  onPageSizeChange,
  onSort,
  onEdit,
  onDelete,
  onRowClick,
  sl = false,
  serverPagination = false, // true ONLY if backend handles pagination slicing & query searching
  maxHeight = '500px', // Fixed height with vertical scroll when data is large
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your criteria.',
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize || 10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // If setQuickFilterText is provided, sync with it; otherwise use internalSearch
  const activeSearch = setQuickFilterText !== undefined ? quickFilterText : internalSearch;
  const isServer = Boolean(serverPagination);
  const activePage = isServer && onPageChange ? currentPage : internalPage;
  const activePageSize = isServer && onPageSizeChange ? pageSize : internalPageSize;
  const isDataLoading = loading || isLoading || navigating;

  const handleSearchChange = (val) => {
    if (setQuickFilterText) {
      setQuickFilterText(val);
    } else {
      setInternalSearch(val);
    }
    // Always reset to page 1 on new search keyword
    if (isServer && onPageChange) {
      onPageChange(1);
    } else {
      setInternalPage(1);
    }
  };

  const handleClearSearch = () => {
    handleSearchChange('');
  };

  const handlePageSelect = (page) => {
    if (isServer && onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  const handleSizeChange = (size) => {
    if (isServer && onPageSizeChange) {
      onPageSizeChange(size);
      if (onPageChange) onPageChange(1);
    } else {
      setInternalPageSize(size);
      setInternalPage(1);
    }
  };

  const handleSort = (field) => {
    if (!field) return;
    const nextDirection = sortConfig.key === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key: field, direction: nextDirection });
    if (onSort) {
      onSort(field, nextDirection);
    }
  };

  // Normalized columns
  const effectiveColumns = useMemo(() => {
    const cols = columns.map((col) => ({
      field: col.field || col.accessor,
      headerName: col.headerName || col.header || col.field,
      sortable: col.sortable !== false,
      render: col.cellRenderer || col.render,
      minWidth: col.minWidth,
      flex: col.flex,
      align: col.align || 'left',
    }));

    if (sl) {
      cols.unshift({
        field: '__sl',
        headerName: '#SL',
        sortable: false,
        minWidth: 55,
        render: (params) => {
          const idx = params?.node?.rowIndex ?? params?.rowIndex ?? 0;
          return (
            <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
              {String(idx + 1).padStart(2, '0')}
            </span>
          );
        },
      });
    }

    if (onEdit || onDelete) {
      cols.push({
        field: '__actions',
        headerName: 'ACTIONS',
        sortable: false,
        minWidth: 100,
        align: 'right',
        render: (params) => {
          const row = params?.data || params?.row;
          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  aria-label="Edit record"
                  title="Edit record"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/60 dark:hover:text-teal-400 transition-all cursor-pointer shadow-xs border border-transparent hover:border-teal-200 dark:hover:border-teal-800"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(row?._id || row?.id || row)}
                  aria-label="Delete record"
                  title="Delete record"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-all cursor-pointer shadow-xs border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [columns, sl, onEdit, onDelete]);

  // Client-side filtering & sorting:
  // If not server pagination, process activeSearch and sortConfig directly on data
  const processedData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Filter locally if not server-side search
    if (!isServer && activeSearch && activeSearch.trim()) {
      const term = activeSearch.toLowerCase().trim();
      result = result.filter((row) => {
        if (searchKeys.length > 0) {
          return searchKeys.some((k) => {
            const val = row[k];
            if (val == null) return false;
            if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(term));
            return String(val).toLowerCase().includes(term);
          });
        }
        return Object.values(row).some((val) => {
          if (val == null) return false;
          if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(term));
          return String(val).toLowerCase().includes(term);
        });
      });
    }

    // Sort locally
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, activeSearch, searchKeys, sortConfig, isServer]);

  const totalRecords = isServer ? (total || data.length) : processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / activePageSize));

  // If server pagination, data is already the page slice.
  // If client pagination, slice processedData based on activePage & activePageSize.
  const displayRows = isServer
    ? processedData
    : processedData.slice((activePage - 1) * activePageSize, activePage * activePageSize);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {title ? (
            <h3 className="font-black text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h3>
          ) : null}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {totalRecords} records found
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-sm sm:ml-auto">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={activeSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table with fixed height and smooth internal scroll */}
      <div
        className="overflow-x-auto overflow-y-auto w-full relative"
        style={maxHeight ? { maxHeight: maxHeight } : { maxHeight: '520px' }}
      >
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 shadow-xs">
            <tr className="border-b border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              {effectiveColumns.map((col, idx) => {
                const isSorted = sortConfig.key === col.field;
                return (
                  <th
                    key={idx}
                    onClick={() => col.sortable && handleSort(col.field)}
                    className={`px-5 py-3.5 text-[11px] font-mono font-bold uppercase tracking-wider select-none transition-colors ${
                      isSorted
                        ? 'text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/40'
                        : 'text-slate-500 dark:text-slate-400'
                    } ${
                      col.sortable
                        ? 'cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                        : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    style={col.minWidth ? { minWidth: `${col.minWidth}px` } : undefined}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.headerName}</span>
                      {col.sortable && (
                        <span className="flex items-center">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <FiChevronUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 font-bold" />
                            ) : (
                              <FiChevronDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 font-bold" />
                            )
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs leading-none">⇅</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {isDataLoading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {effectiveColumns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayRows.length === 0 ? (
              <tr>
                <td colSpan={effectiveColumns.length} className="px-5 py-16 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              displayRows.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`group transition-all duration-150 ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-teal-50/40 dark:hover:bg-teal-950/20'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {effectiveColumns.map((col, cIdx) => {
                    const value = row[col.field];
                    let renderedContent = value ?? '—';

                    if (col.render) {
                      renderedContent = col.render({
                        value,
                        data: row,
                        row,
                        node: { rowIndex: (activePage - 1) * activePageSize + rIdx },
                        rowIndex: (activePage - 1) * activePageSize + rIdx,
                      });
                    }

                    return (
                      <td
                        key={cIdx}
                        className={`px-5 py-3.5 text-slate-700 dark:text-slate-300 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {renderedContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isDataLoading && totalRecords > 0 && (
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-slate-500 dark:text-slate-400">Rows per page:</span>
            <select
              value={activePageSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs outline-none cursor-pointer"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">|</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              Showing{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {Math.min((activePage - 1) * activePageSize + 1, totalRecords)}
              </strong>
              –
              <strong className="text-slate-800 dark:text-slate-200">
                {Math.min(activePage * activePageSize, totalRecords)}
              </strong>{' '}
              of <strong className="text-slate-800 dark:text-slate-200">{totalRecords}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              onClick={() => handlePageSelect(1)}
              disabled={activePage === 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="First Page"
              aria-label="First Page"
            >
              <FiChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => handlePageSelect(activePage - 1)}
              disabled={activePage === 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                if (p === 1 || p === totalPages || (p >= activePage - 1 && p <= activePage + 1)) {
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageSelect(p)}
                      className={`min-w-8 h-8 px-2 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
                        activePage === p
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === activePage - 2 || p === activePage + 2) {
                  return (
                    <span key={p} className="px-1 text-slate-400 font-mono text-xs">
                      …
                    </span>
                  );
                }
                return null;
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageSelect(activePage + 1)}
              disabled={activePage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Next Page"
              aria-label="Next Page"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageSelect(totalPages)}
              disabled={activePage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Last Page"
              aria-label="Last Page"
            >
              <FiChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
