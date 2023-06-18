import type { NextPage } from "next";

import Link from "next/link";
import AdminLayout from "@/components/LayoutAdmin";
import { ReservationsTable } from "@/components/ReservationsTable";
import { Button } from "@/components/ui/button";

const BookingsPage: NextPage = () => {
  return (
    <>
      <AdminLayout>
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
          </div>
          <div>
            <Link href="/bookings/new-booking">
              <Button>Add New</Button>
            </Link>
          </div>
          <section>
            <ReservationsTable />
          </section>
        </section>
      </AdminLayout>
    </>
  );
};

export default BookingsPage;
