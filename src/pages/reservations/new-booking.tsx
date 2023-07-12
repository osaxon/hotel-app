import AdminLayout from "@/components/LayoutAdmin";
import MultiBookingForm from "@/components/MultiBookingForm";
import NewBookingForm from "@/components/NewBookingForm";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { ListPlus, PlusSquare } from "lucide-react";
import { useState } from "react";

type BookingTypes = "single" | "multi";

export default function NewBookingPage() {
  const [bookingType, setBookingType] = useState<BookingTypes>("single");
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">New Booking</h2>
        </div>
        <div>
          <p>Complete this to create a new reservation.</p>
        </div>
        <RadioGroup
          defaultValue="single"
          className="grid w-full grid-cols-2 gap-4 md:w-2/3"
        >
          <Label
            htmlFor="single"
            onClick={() => setBookingType("single")}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="single" id="single" className="sr-only" />
            <PlusSquare />
            Single
          </Label>
          <Label
            htmlFor="multi"
            onClick={() => setBookingType("multi")}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="multi" id="multi" className="sr-only" />
            <ListPlus />
            Multi
          </Label>
        </RadioGroup>
        <section className="flex w-full flex-col">
          {bookingType === "single" ? (
            <NewBookingForm />
          ) : bookingType === "multi" ? (
            <MultiBookingForm />
          ) : null}
        </section>
      </section>
    </AdminLayout>
  );
}
