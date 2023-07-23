import AdminLayout from "@/components/LayoutAdmin";
import { OpenInvoicesTable } from "@/components/OpenInvoicesTable";
import { LoadingPage } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  cn,
  convertToNormalCase,
  formatCurrency,
  isHappyHour,
} from "@/lib/utils";
import { type ItemWithQuantity } from "@/server/api/routers/pos";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { api } from "@/utils/api";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemCategory, type Item } from "@prisma/client";
import { PartyPopper, Trash } from "lucide-react";
import { type GetServerSideProps } from "next";
import { useState } from "react";
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

type SelectedCat = ItemCategory | "NONE";

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
  const [useHappyHourPrices, setUseHappyHourPrices] = useState<boolean>(false);

  const [category, setCategory] = useState<SelectedCat>("NONE");
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

  function handleSelectedCat(cat: SelectedCat) {
    if (cat === category) {
      setCategory("NONE");
    } else {
      setCategory(cat);
    }
  }

  function handleRemoveItem(item: Item) {
    setSelectedItems(
      selectedItems.filter((selectedItem) => item.id !== selectedItem.id)
    );
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const orderPayload = {
      ...data,
      items: selectedItems,
    };

    createOrder({
      ...orderPayload,
      useHappyHourPrice: isHappyHour() || useHappyHourPrices,
    });
  }

  if (isLoadingItems || isLoadingGuests || isLoadingInvoices)
    return <LoadingPage />;

  return (
    <AdminLayout>
      {isAddingOrder ? (
        <LoadingPage />
      ) : (
        <main className="w-full flex-1 space-y-4 p-8 pt-6 md:w-2/3">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          </div>

          <Tabs defaultValue="new" className="space-y-4">
            <TabsList>
              <TabsTrigger value="new">Items</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="space-y-4">
              {/* ITEM SELECTION GRID */}

              <section className="space-y-4">
                <div className="flex items-center justify-between space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Select Items
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.values(ItemCategory)
                    .filter((cat) => cat !== "INGREDIENT")
                    .map((cat) => (
                      <Button
                        onClick={() => handleSelectedCat(cat)}
                        size="sm"
                        variant="secondary"
                        key={cat}
                        className={cn(
                          cat === category && "ring-2 ring-primary "
                        )}
                      >
                        {convertToNormalCase(cat)}
                      </Button>
                    ))}
                </div>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    defaultChecked={isHappyHour()}
                    disabled={isHappyHour()}
                    onCheckedChange={() =>
                      setUseHappyHourPrices(!useHappyHourPrices)
                    }
                    id="happyHour"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="happyHour"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Use Happy Hour Prices
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Overrides the automatic Happy Hour price check. Disabled
                      during Happy Hour 17:00 - 19:00.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                  {items &&
                    items
                      ?.filter((item) =>
                        category === "NONE"
                          ? item.category !== null && item.displayOnPOS === true
                          : item.category === category
                      )
                      .map((item) => {
                        const selectedItem = selectedItems.find(
                          (selectedItem) => item.id === selectedItem.id
                        );
                        return (
                          <Card key={item.id}>
                            <CardHeader className="p-3">
                              <Button
                                onClick={() => handleAdd(item)}
                                variant="secondary"
                                size="lg"
                                key={item.id}
                              >
                                {item.name}
                              </Button>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 space-y-4 p-3">
                              <div className="flex items-center justify-between">
                                {!isHappyHour() && !useHappyHourPrices && (
                                  <p className="text-muted-foreground">
                                    {formatCurrency({
                                      amount: Number(item.priceUSD),
                                      currency: "USD",
                                    })}
                                  </p>
                                )}
                                {(isHappyHour() || useHappyHourPrices) && (
                                  <>
                                    <p className="text-muted-foreground">
                                      {formatCurrency({
                                        amount: Number(item.happyHourPriceUSD),
                                        currency: "USD",
                                      })}
                                    </p>
                                    <PartyPopper className="text-green-600" />
                                  </>
                                )}
                              </div>

                              <div className="relative flex w-full items-center justify-between">
                                <p className="text-muted-foreground">
                                  x{selectedItem?.quantity ?? 0}
                                </p>
                                <Trash
                                  onClick={() => handleRemoveItem(item)}
                                  className="z-99 cursor-pointer text-muted-foreground"
                                  size={22}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                </div>
              </section>

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
                          form.setValue(
                            "name",
                            invoice.guest?.fullName ??
                              invoice.customerName ??
                              ""
                          );
                          form.setValue("guestId", invoice.guest?.id ?? "");
                        }}
                        key={invoice.id}
                        className="flex cursor-pointer flex-col rounded-md border p-4"
                      >
                        <p className="font-semibold">{invoice.customerName}</p>
                        <div>IN{invoice.invoiceNumber}</div>
                        {invoice.reservations &&
                          invoice.reservations
                            .filter((res) => res.status === "CHECKED_IN")
                            .map((res) => (
                              <span key={res.id}>
                                Room {res.room?.roomNumber}
                              </span>
                            ))}
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
                            Customer name
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
                    <div className="">
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
                            {formatCurrency({
                              amount:
                                isHappyHour() || useHappyHourPrices
                                  ? Number(item.happyHourPriceUSD)
                                  : Number(item.priceUSD),
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency({
                              amount:
                                isHappyHour() || useHappyHourPrices
                                  ? Number(item.happyHourPriceUSD) *
                                    item.quantity
                                  : Number(item.priceUSD) * item.quantity,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              </section>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
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
