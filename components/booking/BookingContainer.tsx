"use client";

import { useProperty } from "@/utils/store";
import ConfirmBooking from "./ConfirmBooking";
import BookingForm from "./BookingForm";

export default function BookingContainer() {
  const state = useProperty();
  const { propertyId, price, bookings, range } = state;
  console.log("BookingContainer", range, propertyId, price, bookings);

  return (
    <div className="w-full">
      <BookingForm />
      <ConfirmBooking />
    </div>
  );
}
