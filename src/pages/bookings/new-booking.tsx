import NewBookingForm from "@/components/NewBookingForm";
import AdminLayout from "@/components/LayoutAdmin";
import { GuestsTable } from "@/components/GuestsTable";

export default function NewBookingPage() {
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">New Booking</h2>
        </div>
        <div>
          <p>Complete this to create a new reservation.</p>
        </div>
        <section className="flex w-full flex-col">
          <NewBookingForm />
        </section>
      </section>
    </AdminLayout>
  );
}
