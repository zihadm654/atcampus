"use client";

import { useState } from "react";
import Link from "next/link";
import { Table } from "@tanstack/react-table";
import { CrossIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CalendarDatePicker } from "./calender-date-picker";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  link?: string;
}

export function DataTableToolbar<TData>({
  table,
  link,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
    // Filter table data based on selected date range
    table.getColumn("date")?.setFilterValue([from, to]);
  };

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filter title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("title")?.setFilterValue(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <CrossIcon className="ml-2 size-4" />
          </Button>
        )}
        <CalendarDatePicker
          date={dateRange}
          onDateSelect={handleDateSelect}
          className="h-8 w-[250px]"
          variant="outline"
        />
      </div>
      <Button className="mr-4 h-8 lg:flex">
        <Link href={`/admin/${link}/create`}>Add {link}</Link>
      </Button>
      <DataTableViewOptions table={table} />
    </div>
  );
}
