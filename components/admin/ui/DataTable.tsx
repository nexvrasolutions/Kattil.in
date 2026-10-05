"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { AdminButton } from "./AdminButton";

// ── Types ────────────────────────────────────────────────────────────────────

interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

interface BulkAction<T> {
  label: string;
  onClick: (selected: T[]) => void;
  variant?: "default" | "destructive";
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  pagination?: PaginationProps;
  bulkActions?: BulkAction<T>[];
  emptyMessage?: string;
  rowKey: keyof T;
}

type SortDirection = "asc" | "desc" | null;

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  searchable = false,
  searchPlaceholder = "Search…",
  onSearch,
  searchValue,
  pagination,
  bulkActions,
  emptyMessage = "No results found.",
  rowKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<unknown>>(new Set());
  const [internalSearch, setInternalSearch] = useState("");

  const searchQuery = searchValue !== undefined ? searchValue : internalSearch;

  const handleSearch = (q: string) => {
    setInternalSearch(q);
    onSearch?.(q);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const allSelected = data.length > 0 && selectedKeys.size === data.length;
  const someSelected = selectedKeys.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(data.map((row) => row[rowKey as string])));
    }
  };

  const toggleRow = (key: unknown) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectedRows = data.filter((row) => selectedKeys.has(row[rowKey as string]));
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  const getCellValue = (row: T, key: keyof T | string): React.ReactNode => {
    const val = row[key as keyof T];
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  const SortIcon = ({ col }: { col: ColumnDef<T> }) => {
    if (!col.sortable) return null;
    const active = sortKey === col.key;
    if (!active || !sortDir)
      return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      {(searchable || (bulkActions && selectedKeys.size > 0)) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {searchable && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--adm-muted-foreground))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex h-9 w-full rounded-[8px] border border-[hsl(var(--adm-input))] bg-[hsl(var(--adm-background))] pl-8 pr-3 text-sm text-[hsl(var(--adm-foreground))] placeholder:text-[hsl(var(--adm-muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--adm-ring))] transition-colors"
              />
            </div>
          )}

          {bulkActions && selectedKeys.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--adm-muted-foreground))]">
                {selectedKeys.size} selected
              </span>
              {bulkActions.map((action) => (
                <AdminButton
                  key={action.label}
                  size="sm"
                  variant={action.variant ?? "default"}
                  onClick={() => action.onClick(selectedRows)}
                >
                  {action.label}
                </AdminButton>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-auto rounded-[8px] border border-[hsl(var(--adm-border))]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--adm-border))] bg-[hsl(var(--adm-muted)/0.5)]">
              {bulkActions && (
                <th className="h-11 w-10 px-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded-[8px] border-[hsl(var(--adm-border))] accent-[hsl(var(--adm-primary))]"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={[
                    "h-11 px-4 text-left font-semibold text-[hsl(var(--adm-muted-foreground))] text-xs uppercase select-none",
                    col.sortable ? "cursor-pointer hover:text-[hsl(var(--adm-foreground))]" : "",
                    col.className ?? "",
                  ].join(" ")}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  {col.label}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[hsl(var(--adm-border)/0.5)]">
                  {bulkActions && (
                    <td className="px-4 py-3">
                      <div className="adm-skeleton h-4 w-4 rounded-[8px]" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div
                        className="adm-skeleton h-4 rounded-[8px]"
                        style={{ width: `${60 + Math.random() * 30}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-[hsl(var(--adm-muted-foreground))]">
                    <Inbox className="h-8 w-8 opacity-40" />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const key = row[rowKey as string] as React.Key;
                const selected = selectedKeys.has(key);
                return (
                  <tr
                    key={key}
                    className={[
                      "border-b border-[hsl(var(--adm-border)/0.5)] transition-colors hover:bg-[hsl(var(--adm-accent)/0.3)]",
                      selected ? "bg-[hsl(var(--adm-primary)/0.05)]" : "",
                    ].join(" ")}
                  >
                    {bulkActions && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(key)}
                          className="h-4 w-4 rounded-[8px] border-[hsl(var(--adm-border))] accent-[hsl(var(--adm-primary))]"
                          aria-label={`Select row ${String(key)}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={["px-4 py-3 align-middle", col.className ?? ""].join(" ")}
                      >
                        {col.render ? col.render(row) : getCellValue(row, col.key)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-[hsl(var(--adm-muted-foreground))]">
            Page {pagination.page} of {totalPages} &mdash; {pagination.total} total
          </p>
          <div className="flex items-center gap-1">
            <AdminButton
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </AdminButton>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <AdminButton
                  key={page}
                  size="sm"
                  variant={page === pagination.page ? "default" : "ghost"}
                  onClick={() => pagination.onPageChange(page)}
                >
                  {page}
                </AdminButton>
              );
            })}
            <AdminButton
              size="sm"
              variant="outline"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
