import type { NextPage } from "next";

import { ItemsTable } from "@/components/ItemsTable";
import AdminLayout from "@/components/LayoutAdmin";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ItemsPage: NextPage = () => {
  return (
    <>
      <AdminLayout>
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Items</h2>
          </div>
          <div>
            <Link href="/items/add-new">
              <Button>Add New</Button>
            </Link>
          </div>
          <section>
            <ItemsTable />
          </section>
        </section>
      </AdminLayout>
    </>
  );
};

export default ItemsPage;
