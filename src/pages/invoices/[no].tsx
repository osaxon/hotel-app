import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { InvoiceDetailsCard } from "@/components/InvoiceDetailsCard";
import InvoiceSummary from "@/components/InvoiceSummary";
import AdminLayout from "@/components/LayoutAdmin";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
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
import { type ItemWithQuantity } from "@/server/api/routers/pos";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { api } from "@/utils/api";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { Item, PaymentStatus, Prisma } from "@prisma/client";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { CheckCheck, PlusSquare, Printer, Receipt } from "lucide-react";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

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
                  <Button
                    className="flex items-center gap-x-1 text-sm print:hidden"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateStatus({ id: invoice.id, status: "PAID" })
                    }
                  >
                    <Receipt className="h-4" />
                    {isUpdatingStatus ? <LoadingSpinner size={36} /> : "Paid"}
                  </Button>
                  <Button
                    className="flex items-center gap-x-1 text-sm print:hidden"
                    variant="ghost"
                    size="sm"
                  >
                    <CheckCheck className="h-4" />
                    Check out
                  </Button>
                  <AddItemsDialog invoice={invoice} />
                </>
              )}
              <Button
                className="flex items-center gap-x-1 text-sm print:hidden"
                variant="destructive"
                size="sm"
                onClick={() =>
                  updateStatus({ id: invoice.id, status: "CANCELLED" })
                }
              >
                {isUpdatingStatus ? <LoadingSpinner size={36} /> : "Cancel"}
              </Button>
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

const types = ["Drinks", "Services", "Food"];

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

  const { mutate: createOrder, isLoading: isAddingOrder } =
    api.pos.createOrder.useMutation({
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-sm" variant="ghost">
          <PlusSquare className="h-4" /> Add Items{" "}
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
          {!category
            ? types &&
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
            : items &&
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
                      item.category === "TICKETS" ||
                      item.category === "SERVICES"
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
                })}
        </div>
        <DialogFooter className="flex flex-col gap-4">
          <Button
            variant="destructive"
            onClick={() => setCategory("")}
            type="reset"
          >
            Clear
          </Button>
          <Button
            disabled={selectedItems.length < 1}
            onClick={() => addToInvoice()}
            type="submit"
          >
            Add to Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
