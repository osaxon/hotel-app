import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <Tabs defaultValue={"inventory"} className="space-y-4">
            <TabsList>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="pos">On POS</TabsTrigger>
            </TabsList>

            <div>
              <Link href="/items/add-new">
                <Button>Add New</Button>
              </Link>
            </div>

            <TabsContent value="inventory" className="space-y-4">
              <section>
                <ItemsTable variant="inventory" />
              </section>
            </TabsContent>
            <TabsContent value="pos" className="space-y-4">
              <section>
                <ItemsTable variant="pos" />
              </section>
            </TabsContent>
          </Tabs>
        </section>
      </AdminLayout>
    </>
  );
};

export default ItemsPage;
