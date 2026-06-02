"use client";

import * as React from "react";
import { format, isBefore } from "date-fns";
import { Calendar } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarGrid } from "./calendar-grid";

type DateRange = {
  from: Date | null;
  to: Date | null;
};

interface Props {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;

  disabled?: boolean;
  className?: string;
  placeholder?: string;

  variant?: "default" | "outline" | "ghost";
}

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  placeholder = "Select date range",
  variant = "outline",
}: Props) {
  const [internal, setInternal] = React.useState<DateRange>(
    defaultValue ?? { from: null, to: null },
  );

  const range = value ?? internal;

  const setRange = (next: DateRange) => {
    if (!value) setInternal(next);
    onChange?.(next);
  };

  const handleSelect = (date: Date) => {
    const { from, to } = range;

    // start fresh
    if (!from || (from && to)) {
      setRange({ from: date, to: null });
      return;
    }

    // selecting second date
    if (from && !to) {
      if (isBefore(date, from)) {
        setRange({ from: date, to: from });
      } else {
        setRange({ from, to: date });
      }
    }
  };

  const displayValue = React.useMemo(() => {
    if (range.from && range.to) {
      return `${format(range.from, "d MMM")} - ${format(range.to, "d MMM")}`;
    }
    if (range.from) {
      return format(range.from, "d MMM yyyy");
    }
    return placeholder;
  }, [range, placeholder]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          disabled={disabled}
          className={cn(
            "justify-between w-full h-12 rounded-xl font-medium",
            !range.from && "text-muted-foreground",
            className,
          )}
        >
          <span>{displayValue}</span>
          <Calendar className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-3 bg-popover border border-border rounded-2xl shadow-lg"
      >
        <CalendarGrid value={range} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
