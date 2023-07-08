import type { NextPage } from "next";

import { InvoicesTable } from "@/components/InvoicesTable";
import AdminLayout from "@/components/LayoutAdmin";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const InvoicesPage: NextPage = () => {
  return (
    <>
      <AdminLayout>
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          </div>

          <div>
            <Link href="/invoices/add-new">
              <Button>Add New</Button>
            </Link>
          </div>
          <InvoicesTable />
        </section>
      </AdminLayout>
    </>
  );
};

export default InvoicesPage;
