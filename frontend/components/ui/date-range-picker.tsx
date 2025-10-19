"use client";

import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({
  range,
  setRange,
  form,
}: {
  range: DateRange | undefined;
  setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  form: any;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1" htmlFor="dates">
        Select your deadline
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="w-56 justify-between font-normal"
            id="dates"
            variant="outline"
          >
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto overflow-hidden p-0">
          <Calendar
            captionLayout="dropdown"
            mode="range"
            onSelect={(range) => {
              setRange(range);
              form.setValue("startDate", range?.from || undefined);
              form.setValue("endDate", range?.to || undefined);
            }}
            selected={range}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
