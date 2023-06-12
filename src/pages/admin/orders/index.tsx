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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dayjs from "dayjs";

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
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { GetStaticProps } from "next";

type SelectedItem = {
  itemId: string;
  quantity: number;
};

type SelectedCustomer = {
  customer: string | null;
  reservationId: string | null;
};

const FormSchema = z.object({
  room: z.string().optional(),
  customer: z.string(),
});

export default function OrdersPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer>();

  const {
    data: items,
    isError: isItemsError,
    isLoading: isLoadingItems,
  } = api.pos.getItems.useQuery();

  const {
    data: reservations,
    isError: isReservationsError,
    isLoading: isLoadingReservations,
  } = api.reservations.getActiveReservations.useQuery(undefined, {
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

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
                className="space-y-6 md:w-2/3"
              >
                {isLoadingItems ? (
                  <LoadingSpinner />
                ) : (
                  items && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {items.map((item) => {
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
                              <span className="flex select-none items-center gap-2 text-sm font-medium text-muted-foreground">
                                Qty: {selectedItem ? selectedItem.quantity : 0}
                              </span>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )
                )}
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {reservations &&
                    reservations.map(
                      ({ room, roomId, user, checkIn, checkOut, id }) => (
                        <Card
                          onClick={() =>
                            setSelectedCustomer({
                              reservationId: id,
                              customer:
                                user.firstName ??
                                user.primaryEmailAddressId ??
                                "",
                            })
                          }
                          className="cursor-pointer"
                          key={roomId}
                        >
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="flex flex-col">
                              <span className="text-2xl">
                                Room {room.roomNumber}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-y-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.imageUrl} alt="" />
                              <AvatarFallback>SC</AvatarFallback>
                            </Avatar>
                            <span className="flex select-none items-center gap-2 text-sm font-medium text-muted-foreground">
                              Checked in: {dayjs(checkIn).format("DD/MM/YYYY")}
                            </span>
                          </CardContent>
                        </Card>
                      )
                    )}
                </section>

                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          value={selectedCustomer?.customer || field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedItems([]);
                      setSelectedCustomer({ customer: "", reservationId: "" });
                    }}
                    type="reset"
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

export const getStaticProps: GetStaticProps = async () => {
  const ssg = generateSSGHelper();

  await ssg.pos.getItems.prefetch();

  return {
    props: {
      trcpState: ssg.dehydrate(),
    },
  };
};
