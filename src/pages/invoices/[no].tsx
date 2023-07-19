import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { InvoiceDetailsCard } from "@/components/InvoiceDetailsCard";
import InvoiceSummary from "@/components/InvoiceSummary";
import AdminLayout from "@/components/LayoutAdmin";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { type ItemWithQuantity } from "@/server/api/routers/pos";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { api } from "@/utils/api";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { Item, PaymentStatus, Prisma } from "@prisma/client";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { PlusSquare, Printer, Receipt } from "lucide-react";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";

const ManualOrderFormSchema = z.object({
  note: z.string(),
  subTotalUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Total must be a valid number.",
      path: ["subTotalUSD"],
    })
    .transform((value) => parseFloat(value)),
});

dayjs.extend(advancedFormat);

const InvoicePage: NextPage = () => {
  const router = useRouter();
  const [updatedStatus, setUpdatedStatus] = useState<PaymentStatus>();

  const { no } = router.query;
  const invoiceNumber = no as string;
  const utils = api.useContext();

  const { data: invoice, isLoading } = api.pos.getInvoiceByNumber.useQuery(
    {
      invoiceNumber: invoiceNumber,
    },
    {
      enabled: invoiceNumber !== null,
    }
  );

  const { mutate: updateStatus, isLoading: isUpdatingStatus } =
    api.pos.updateInvoiceStatus.useMutation({
      async onMutate({ id, status }) {
        // Cancel outgoing fetches
        await utils.pos.getInvoiceByNumber.cancel({ invoiceNumber });

        // Snapshot current state
        const prevData = utils.pos.getInvoiceByNumber.getData({
          invoiceNumber,
        });

        // Optimistically update
        utils.pos.getInvoiceByNumber.setData({ invoiceNumber }, (prev) => {
          if (!prev) return prevData;
          return {
            ...prev,
            status: status,
          };
        });

        // return snapshot
        return { prevData };
      },
      async onSettled() {
        await utils.pos.getInvoiceByNumber.invalidate({ invoiceNumber });
      },
    });

  if (isLoading) return <LoadingPage />;
  if (!invoice) return <>No data found</>;

  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between gap-2 print:hidden sm:justify-start">
          {invoice.status !== "CANCELLED" && (
            <>
              <Button
                className="flex items-center gap-x-1 text-sm print:hidden"
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="h-4" />
                Print
              </Button>
              {invoice.status !== "PAID" && (
                <>
                  <AddItemsDialog invoice={invoice} />

                  <Button
                    className="flex items-center gap-x-1 text-sm print:hidden"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateStatus({ id: invoice.id, status: "PAID" })
                    }
                  >
                    <Receipt className="h-4" />
                    {isUpdatingStatus ? <LoadingSpinner size={36} /> : "Settle"}
                  </Button>
                </>
              )}
              <CancelInvoiceDialog
                invoiceId={invoice.id}
                invoiceNumber={invoiceNumber}
              />
            </>
          )}
          {invoice.status === "CANCELLED" && (
            <p className="w-full bg-destructive text-center text-lg font-bold uppercase text-destructive-foreground">
              invoice cancelled
            </p>
          )}
        </div>

        <CompanyDetailsCard />
        <InvoiceDetailsCard invoice={invoice} />

        <div className="my-4">
          <h3 className="font-bold">Items:</h3>
        </div>
        <div>{invoice && <InvoiceSummary invoice={invoice} />}</div>
      </section>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  const {
    query: { no },
  } = ctx;
  const ssg = generateSSGHelper(userId ?? "");

  if (no) {
    await ssg.pos.getInvoiceByNumber.prefetch({ invoiceNumber: no as string });
  }

  return {
    props: {
      ...buildClerkProps(ctx.req),
      trcpState: ssg.dehydrate(),
    },
  };
};

export default InvoicePage;

const types = ["Drinks", "Services", "Food", "Manual"];

function AddItemsDialog({
  invoice,
}: {
  invoice: Prisma.InvoiceGetPayload<{ include: { guest: true } }>;
}) {
  const [category, setCategory] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<ItemWithQuantity[]>([]);
  const [useHappyHourPrices, setUseHappyHourPrices] = useState<boolean>(false);
  const router = useRouter();
  const { data: items, isLoading, isError } = api.pos.getItems.useQuery();

  const form = useForm<z.infer<typeof ManualOrderFormSchema>>({
    resolver: zodResolver(ManualOrderFormSchema),
  });

  const { mutate: createOrder, isLoading: isAddingOrder } =
    api.pos.createOrder.useMutation({
      onSuccess: () => router.reload(),
    });

  const { mutate: createManualOrder } = api.pos.createManualOrder.useMutation({
    onSuccess: () => router.reload(),
  });

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

  function addToInvoice() {
    createOrder({
      invoiceId: invoice.id,
      guestId: invoice.guest?.id,
      items: selectedItems,
      useHappyHourPrice: useHappyHourPrices,
    });
  }

  function onSubmit(data: z.infer<typeof ManualOrderFormSchema>) {
    const orderPayload = {
      ...data,
      customerName: invoice.customerName ?? "",
      invoiceId: invoice.id ?? "",
      guestId: invoice.guestId ?? "",
    };
    createManualOrder(orderPayload);
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(orderPayload, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-sm" variant="ghost">
          <PlusSquare className="h-4" /> Add{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="top-5 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Invoice</DialogTitle>
          <DialogDescription>Add Items to the invoice.</DialogDescription>
        </DialogHeader>
        <div className="items-top flex space-x-2">
          <Checkbox
            onCheckedChange={() => setUseHappyHourPrices(!useHappyHourPrices)}
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
              Overrides the automatic Happy Hour price check.
            </p>
          </div>
        </div>
        <div className="grid max-h-[55vh] gap-4 overflow-y-scroll py-4">
          {!category ? (
            types &&
            types.map((type) => (
              <Button
                onClick={() => setCategory(type)}
                variant="outline"
                size="lg"
                key={type}
              >
                {type}
              </Button>
            ))
          ) : category !== "Manual" ? (
            items &&
            items
              .filter((item) => {
                if (category === "Drinks") {
                  return (
                    item.category !== "TICKETS" &&
                    item.category !== "SERVICES" &&
                    item.category !== "INGREDIENT" &&
                    item.category !== "FOOD"
                  );
                } else if (category === "Services") {
                  return (
                    item.category === "TICKETS" || item.category === "SERVICES"
                  );
                } else if (category === "Food") {
                  return item.category === "FOOD";
                }
              })
              .map((item) => {
                const selectedItem = selectedItems.find(
                  (selectedItem) => selectedItem.id === item.id
                );
                return (
                  <Button
                    className="flex items-center justify-between"
                    variant="outline"
                    onClick={() => handleAdd(item)}
                    key={item.name}
                  >
                    {item.name}
                    <p>+{selectedItem?.quantity ?? ""}</p>
                  </Button>
                );
              })
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full shrink-0 space-y-6 p-1"
              >
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subTotalUSD"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormLabel>Total USD</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-4">
          <Button
            variant="destructive"
            onClick={() => setCategory("")}
            type="reset"
          >
            Reset
          </Button>
          {category === "Manual" ? (
            <Button onClick={form.handleSubmit(onSubmit)} type="submit">
              Add to Invoice
            </Button>
          ) : (
            <Button
              disabled={selectedItems.length < 1}
              onClick={() => addToInvoice()}
              type="submit"
            >
              Add to Invoice
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelInvoiceDialog({
  invoiceNumber,
  invoiceId,
}: {
  invoiceNumber: string;
  invoiceId: string;
}) {
  const utils = api.useContext();
  const router = useRouter();
  const { mutate: updateStatus, isLoading: isUpdatingStatus } =
    api.invoice.updateStatus.useMutation({
      onMutate: async () =>
        await utils.pos.getInvoiceByNumber.invalidate({ invoiceNumber }),
      onSuccess: (data) => {
        const { invoiceNumber } = data;

        void router.replace(`/invoices/${invoiceNumber}`);
      },
      //   async onMutate({ id, status }) {
      // // Cancel outgoing fetche
      //TODO OPTIMISTIC UPDATE OPTION - COMMENTED OUT AS INVOICE CANCELLATION BREAKS THE PROCESS
      // // TODO move invoice queries to invoice router
      // await utils.pos.getInvoiceByNumber.cancel({ invoiceNumber });

      // // Snapshot current state
      // const prevData = utils.pos.getInvoiceByNumber.getData({
      //   invoiceNumber,
      // });

      // // Optimistically update

      // utils.pos.getInvoiceByNumber.setData({ invoiceNumber }, (prev) => {
      //   if (!prev) return prevData;
      //   return {
      //     ...prev,
      //     status: status,
      //   };
      // });

      // // return snapshot
      // return { prevData };
      //   },
      //   async onSettled() {
      //     await utils.pos.getInvoiceByNumber.invalidate({ invoiceNumber });
      //   },
    });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          {isUpdatingStatus ? <LoadingSpinner size={24} /> : "Cancel"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will cancel the curret invoice
            and all related Reservations and Orders.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              updateStatus({
                id: invoiceId,
                status: "CANCELLED",
              })
            }
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
