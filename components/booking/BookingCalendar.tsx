"use client";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

  // blocked periods
  // const state = useProperty();
  // const { bookings } = state;

  const bookings = useProperty((state) => state.bookings);

  const blockedPeriods = generateBlockedPeriods({
    bookings,
    today: currentDate
  });

  // disabled dates
  const unavailableDates = generateDisabledDates(blockedPeriods);
  console.log("unavailableDates", unavailableDates);

  useEffect(() => {
    const selectedRange = generateDateRange(range);
    const isDisabledDateIncluded = selectedRange.some((date) => {
      if (unavailableDates[date]) {
        setRange(defaultSelected);
        toast("Some dates are booked. Please select again.");
        return true;
      }
      return false;
    });

    useProperty.setState({ range });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <Calendar
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
      className="mb-4"
      // add disabled
      disabled={blockedPeriods}
    />
  );
}
