/* eslint-disable @typescript-eslint/no-unused-vars */
import { useStore } from "@/store/appStore";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateRange, type SelectRangeEventHandler } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function CalendarDateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  // Refactored below to use Zustand state so dates can be selected and used in api calls to database
  //   const [date, setDate] = React.useState<DateRange | undefined>({
  //     from: new Date(2023, 0, 20),
  //     to: addDays(new Date(2023, 0, 20), 20),
  //   });

  const selectedDate = useStore((state) => state.selectedDate);
  const setSelectedDate = useStore((state) => state.setSelectedDate);

  const handleDateSelect = ((date: DateRange) => {
    setSelectedDate(date);
  }) as SelectRangeEventHandler;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, "LLL dd, y")} -{" "}
                  {format(selectedDate.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedDate.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
