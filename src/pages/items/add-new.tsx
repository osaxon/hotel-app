import type { NextPage } from "next";
import AdminLayout from "@/components/LayoutAdmin";
import NewItemForm from "@/components/NewItemForm";

const NewItemPage: NextPage = () => {
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Add Item</h2>
        </div>
        <div>
          <p>Complete this form to create a new item in the database.</p>
        </div>
        <section>
          <NewItemForm />
        </section>
      </section>
    </AdminLayout>
  );
};

export default NewItemPage;
