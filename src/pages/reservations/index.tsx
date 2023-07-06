import type { NextPage } from "next";

import AdminLayout from "@/components/LayoutAdmin";
import { ReservationsTable } from "@/components/ReservationsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BookingsPage: NextPage = () => {
  return (
    <>
      <AdminLayout>
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
          </div>
          <div className="flex gap-4">
            <Link href="/reservations/new-booking">
              <Button>Add New</Button>
            </Link>
            <Link href="/reservations/res-items/">
              <Button variant="ghost">Manage Options</Button>
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
