"use client";
import { Calendar } from "@/components/ui/calendar";
import { use, useEffect, useState } from "react";
// import { useToast } from "@/components/ui/sonner";
import { DateRange } from "react-day-picker";
import { useProperty } from "@/utils/store";

import {
  generateDisabledDates,
  generateDateRange,
  defaultSelected,
  generateBlockedPeriods
} from "@/utils/calendar";

export default function BookingCalendar() {
  const currentDate = new Date();
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);

  useEffect(() => {
    useProperty.setState({ range: range });
  }, [range]);

  return (
    <Calendar
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
      className="mb-4"
    />
  );
}
