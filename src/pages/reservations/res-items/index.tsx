import type { NextPage } from "next";

import AdminLayout from "@/components/LayoutAdmin";
import { ResItemsTable } from "@/components/ResItemsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ResItemsPage: NextPage = () => {
  return (
    <>
      <AdminLayout>
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Reservation Options
            </h2>
          </div>

          <div className="flex gap-4">
            <Link href="/reservations/res-items/add-new">
              <Button>Add New</Button>
            </Link>
            <Link href="/reservations/">
              <Button variant="ghost">Manage Reservations</Button>
            </Link>
          </div>
          <ResItemsTable />
        </section>
      </AdminLayout>
    </>
  );
};

export default ResItemsPage;
