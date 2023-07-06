import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NextPage } from "next";

import { GuestsTable } from "@/components/GuestsTable";
import AdminLayout from "@/components/LayoutAdmin";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ItemsPage: NextPage = () => {
  return (
    <>
      <AdminLayout>
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          </div>
          <Tabs defaultValue={"all"} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="staff">Checked-In</TabsTrigger>
            </TabsList>

            <div>
              <Link href="/accounts/add-new">
                <Button>Add New</Button>
              </Link>
            </div>

            <TabsContent value="all" className="space-y-4">
              <section>
                <GuestsTable />
              </section>
            </TabsContent>
            <TabsContent value="staff" className="space-y-4">
              <section>
                <GuestsTable />
              </section>
            </TabsContent>
          </Tabs>
        </section>
      </AdminLayout>
    </>
  );
};

export default ItemsPage;
