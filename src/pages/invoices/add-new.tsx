import AdminLayout from "@/components/LayoutAdmin";
import NewInvoiceForm from "@/components/NewInvoiceForm";
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
        <ul className="w-2/3 space-y-1 rounded-md border p-6 text-lg">
          <li>Use this form to set up a new Invoice for a guest.</li>
          <li>Reservations for hotel guests can be added now.</li>
          <li>Orders for the bar can be added later.</li>
        </ul>
        <section>
          <NewInvoiceForm />
        </section>
      </section>
    </AdminLayout>
  );
};

export default NewInvoicePage;
