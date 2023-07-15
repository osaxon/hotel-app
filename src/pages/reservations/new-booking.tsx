import AdminLayout from "@/components/LayoutAdmin";
import NewBookingForm from "@/components/NewBookingForm";

import { useState } from "react";

type BookingTypes = "single" | "multi";

export default function NewBookingPage() {
  const [bookingType, setBookingType] = useState<BookingTypes>("single");
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Create Single Reservation
          </h2>
        </div>

        <ul className="w-2/3 space-y-1 rounded-md border p-6 text-lg">
          <li>Complete this to create a new reservation.</li>
          <li>Option to add to an existing Invoice.</li>
        </ul>
        <section className="flex w-full flex-col">
          <NewBookingForm />
        </section>
      </section>
    </AdminLayout>
  );
}
