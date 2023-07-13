import AdminLayout from "@/components/LayoutAdmin";
import NewInvoiceForm from "@/components/NewInvoiceForm";
import type { NextPage } from "next";

const NewInvoicePage: NextPage = () => {
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">New Invoice</h2>
        </div>
        <div>
          <p>Create a new Invoice and add Orders or Reservations.</p>
        </div>
        <section>
          <NewInvoiceForm />
        </section>
      </section>
    </AdminLayout>
  );
};

export default NewInvoicePage;
