import AdminLayout from "@/components/LayoutAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

import { api } from "@/utils/api";
import LoadingSpinner from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Item } from "@prisma/client";

type SelectedItem = {
  itemId: string;
  quantity: number;
};

const FormSchema = z.object({
  customer: z.string(),
});

export default function OrdersPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const {
    data: items,
    isError: isItemsError,
    isLoading: isLoadingItems,
  } = api.pos.getItems.useQuery();

  const {
    data: reservations,
    isError: isReservationsError,
    isLoading: isLoadingReservations,
  } = api.reservations.getActiveReservations.useQuery();

  const { mutate: createOrder } = api.pos.createOrder.useMutation();

  function handleAdd(item: Item) {
    const selectedItem = selectedItems.find(
      (selectedItem) => selectedItem.itemId === item.id
    );

    if (selectedItem) {
      const updatedItems = selectedItems.map((selectedItem) => {
        if (selectedItem.itemId === item.id) {
          return { ...selectedItem, quantity: selectedItem.quantity + 1 };
        }
        return selectedItem;
      });

      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([...selectedItems, { itemId: item.id, quantity: 1 }]);
    }
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("onSubmit");
    const orderPayload = {
      ...data,
      items: selectedItems,
    };
    toast({
      title: "Order data",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(orderPayload, null, 2)}
          </code>
        </pre>
      ),
    });
    createOrder(orderPayload);
  }

  return (
    <AdminLayout>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        </div>

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="open-orders">Open Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=" space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {items &&
                    items.map((item) => {
                      const selectedItem = selectedItems.find(
                        (selectedItem) => selectedItem.itemId === item.id
                      );
                      return (
                        <Card
                          className="cursor-pointer"
                          onClick={() => handleAdd(item)}
                          key={item.id}
                        >
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="flex flex-col">
                              <span className="text-2xl">{item.name}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-y-4">
                            <span className="text-sm font-medium text-muted-foreground">
                              {item.name}
                            </span>
                            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              Qty: {selectedItem ? selectedItem.quantity : 0}
                            </span>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button
                    variant="destructive"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear Order
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </main>
    </AdminLayout>
  );
}
