"use client";

import * as React from "react";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns";

import { cn } from "@/lib/utils";

type DateRange = {
  from: Date | null;
  to: Date | null;
};

export function CalendarGrid({
  value,
  onSelect,
}: {
  value: DateRange;
  onSelect: (date: Date) => void;
}) {
  const [month, setMonth] = React.useState(new Date());

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

  const days = [];
  let current = start;

  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setMonth(addMonths(month, -1))}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ←
        </button>

        <p className="text-sm font-semibold">
          {month.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>

        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          →
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div
            key={d}
            className="text-[10px] text-muted-foreground text-center font-bold"
          >
            {d}
          </div>
        ))}

        {days.map((day, i) => {
          const isSelected =
            (value.from && isSameDay(day, value.from)) ||
            (value.to && isSameDay(day, value.to));

          const inRange =
            value.from &&
            value.to &&
            isWithinInterval(day, { start: value.from, end: value.to });

          return (
            <button
              key={i}
              onClick={() => onSelect(day)}
              className={cn(
                "h-9 w-9 rounded-lg text-sm flex items-center justify-center transition-colors",
                !isSameMonth(day, month) && "opacity-30",

                isSelected && "bg-primary text-primary-foreground font-bold",

                !isSelected &&
                  inRange &&
                  "bg-secondary text-secondary-foreground",

                !isSelected &&
                  !inRange &&
                  "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
