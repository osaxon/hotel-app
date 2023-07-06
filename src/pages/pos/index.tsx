import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { type GetServerSideProps } from "next";
import { useState } from "react";

import AdminLayout from "@/components/LayoutAdmin";
import { OpenInvoicesTable } from "@/components/OpenInvoicesTable";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, convertToNormalCase, isHappyHour } from "@/lib/utils";
import { type ItemWithQuantity } from "@/server/api/routers/pos";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Item } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  name: z.string().optional(),
  reservationId: z.string().optional(),
  guestId: z.string().optional(),
  invoiceId: z.string().optional(),
});

export default function OrdersPage() {
  const [selectedItems, setSelectedItems] = useState<ItemWithQuantity[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer>();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { data: items, isLoading: isLoadingItems } =
    api.pos.getItems.useQuery();

  const { data: guests, isLoading: isLoadingGuests } =
    api.guests.getAll.useQuery(undefined, {
      staleTime: 5000,
      refetchOnWindowFocus: true,
    });

  const { data: invoices, isLoading: isLoadingInvoices } =
    api.pos.getOpenInvoices.useQuery();

  const { mutate: createOrder, isLoading: isAddingOrder } =
    api.pos.createOrder.useMutation({
      onSuccess: () => resetAll(),
    });

  function resetAll() {
    form.reset();
    setSelectedCustomer({
      customer: "",
      reservationId: "",
    });
    setSelectedItems([]);
  }

  function handleAdd(item: Item) {
    const selectedItem = selectedItems.find(
      (selectedItem) => selectedItem.id === item.id
    );

    if (selectedItem) {
      const updatedItems = selectedItems.map((selectedItem) => {
        if (selectedItem.id === item.id) {
          return { ...selectedItem, quantity: selectedItem.quantity + 1 };
        }
        return selectedItem;
      });

      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          ...item,
          quantity: 1,
        },
      ]);
    }
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const orderPayload = {
      ...data,
      items: selectedItems,
    };

    createOrder(orderPayload);
  }

  if (isLoadingItems || isLoadingGuests || isLoadingInvoices)
    return <LoadingPage />;

  return (
    <AdminLayout>
      {isAddingOrder ? (
        <LoadingPage />
      ) : (
        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          </div>

          <Tabs defaultValue="items" className="space-y-4">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="open-tabs">Open Tabs</TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="space-y-4">
              <div className="flex items-center justify-between space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  Select Items
                </h3>
              </div>

              {/* ITEM SELECTION GRID */}
              {isLoadingItems ? (
                <LoadingSpinner size={64} />
              ) : (
                items && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => {
                      const selectedItem = selectedItems.find(
                        (selectedItem) => selectedItem.id === item.id
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
                              {convertToNormalCase(item.category)}
                            </span>
                            <span className="flex select-none items-center gap-2 text-sm font-medium text-muted-foreground">
                              Qty: {selectedItem ? selectedItem.quantity : 0}
                            </span>
                            <div className="flex gap-2">
                              <span
                                className={cn(
                                  "flex select-none items-center gap-2 text-sm font-medium text-muted-foreground",
                                  isHappyHour() === true &&
                                    item.happyHourPriceUSD &&
                                    "italic text-red-500 line-through"
                                )}
                              >
                                $ {item.priceUSD.toNumber()}
                              </span>
                              {isHappyHour() === true &&
                                item.happyHourPriceUSD && (
                                  <div className="flex items-center gap-2">
                                    <span className="flex select-none items-center gap-2 text-sm font-medium text-muted-foreground">
                                      $ {item.happyHourPriceUSD?.toNumber()}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      *Happy Hour*
                                    </span>
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )
              )}

              <section className="flex-1 space-y-4 pt-6">
                <div className="flex items-center justify-between space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Add to Invoice
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {invoices &&
                    invoices.map((invoice) => (
                      <div
                        onClick={() => {
                          form.setValue("invoiceId", invoice.id);
                          form.setValue("name", invoice.customerName ?? "");
                          form.setValue("guestId", invoice.guest?.id ?? "");
                        }}
                        key={invoice.id}
                        className="flex flex-col"
                      >
                        <div>{invoice.customerName}</div>
                        {invoice.reservation && (
                          <div>Room {invoice.reservation.room?.roomNumber}</div>
                        )}
                      </div>
                    ))}
                </div>
              </section>

              <div>
                <span className="text-xl font-bold">Or</span>
              </div>

              <section className="flex flex-col gap-8 md:flex-row">
                {/* CUSTOMER DETAILS FORM */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-2/3 space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xl font-bold">
                            Enter name
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              defaultValue={
                                selectedCustomer?.customer ?? field.value
                              }
                              disabled={
                                selectedCustomer?.customer === field.value &&
                                field.value !== undefined
                              }
                              placeholder="Enter customer name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* HIDDEN FROM UI BUT VALUES ARE NEEDED TO SEND TO API */}
                    <div className="hidden">
                      <FormField
                        control={form.control}
                        name="invoiceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl font-bold">
                              Invoice ID
                            </FormLabel>
                            <FormControl>
                              <Input type="text" {...field} readOnly disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guestId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl font-bold">
                              Guest ID
                            </FormLabel>
                            <FormControl>
                              <Input type="text" {...field} readOnly disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Submit</Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedItems([]);
                          setSelectedCustomer({
                            customer: "",
                            reservationId: "",
                          });
                          form.reset();
                        }}
                        type="reset"
                      >
                        Clear Order
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* ORDER SUMMARY */}
                <section>
                  <div className="flex items-center justify-between space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Items</h3>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price USD</TableHead>
                        <TableHead>Total USD</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>x {item.quantity}</TableCell>
                          <TableCell>
                            $
                            {isHappyHour() && item.happyHourPriceUSD
                              ? item.happyHourPriceUSD.toString()
                              : item.priceUSD.toString()}
                          </TableCell>
                          <TableCell className="text-right">
                            $
                            {isHappyHour()
                              ? Number(item.happyHourPriceUSD) * item.quantity
                              : Number(item.priceUSD) * item.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              </section>
            </TabsContent>

            <TabsContent value="open-tabs" className="space-y-4">
              <OpenInvoicesTable />
            </TabsContent>
          </Tabs>
        </main>
      )}
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  const ssg = generateSSGHelper(userId ?? "");

  await ssg.pos.getItems.prefetch();

  return {
    props: {
      ...buildClerkProps(ctx.req),
      trcpState: ssg.dehydrate(),
    },
  };
};
