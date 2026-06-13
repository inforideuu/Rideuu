import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";

export function TableToolbar({ placeholder = "Search...", children }: { placeholder?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/40 px-4 py-2.5">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={placeholder} className="h-8 pl-8 text-xs" />
      </div>
      {children}
      <div className="ml-auto flex gap-1.5">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Filter className="h-3 w-3" />Filter</Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Download className="h-3 w-3" />Export</Button>
      </div>
    </div>
  );
}

export function SimpleTable<T extends { id: string }>({
  columns, rows,
}: {
  columns: { key: keyof T | string; label: string; render?: (row: T) => ReactNode; className?: string }[];
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
            {columns.map((c) => (
              <th key={String(c.key)} className={`px-4 py-2.5 text-left font-semibold ${c.className ?? ""}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 transition-colors hover:bg-muted/30">
              {columns.map((c) => (
                <td key={String(c.key)} className={`px-4 py-3 align-middle ${c.className ?? ""}`}>
                  {c.render ? c.render(row) : String((row as any)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}