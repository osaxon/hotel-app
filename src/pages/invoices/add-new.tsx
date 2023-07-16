import AdminLayout from "@/components/LayoutAdmin";
import NewInvoiceForm from "@/components/NewInvoiceForm";
import { Info } from "lucide-react";
import type { NextPage } from "next";

const NewInvoicePage: NextPage = () => {
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Create New Invoice
          </h2>
        </div>
        <div className="flex w-full gap-2 rounded-md border border-muted bg-muted p-4 text-muted-foreground md:w-2/3">
          <Info className="mt-[1px] h-6 w-6 shrink-0 text-blue-500" />
          <p>
            Use this form to set up a new Invoice for a guest. Reservations for
            hotel guests can be added now and Orders can be added later.
          </p>
        </div>
        <section>
          <NewInvoiceForm />
        </section>
      </section>
    </AdminLayout>
  );
};

export default NewInvoicePage;
