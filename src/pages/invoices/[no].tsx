import { CompanyDetailsCard } from "@/components/CompanyDetailsCard";
import { InvoiceDetailsCard } from "@/components/InvoiceDetailsCard";
import InvoiceSummary from "@/components/InvoiceSummary";
import AdminLayout from "@/components/LayoutAdmin";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
import { Button } from "@/components/ui/button";
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

  const { mutate: markAsPaid, isLoading: isUpdatingStatus } =
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
            status: "PAID",
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
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center gap-x-1 print:hidden"
            variant="ghost"
            onClick={() => window.print()}
          >
            <Printer className="h-4" />
            Print
          </Button>
          <AddItemsDialog invoice={invoice} />
          {invoice.status !== "PAID" && (
            <Button
              className="flex items-center gap-x-1 print:hidden"
              variant="ghost"
              onClick={() => markAsPaid({ id: invoice.id, status: "PAID" })}
            >
              <Receipt className="h-4" />
              {isUpdatingStatus ? <LoadingSpinner size={36} /> : "Mark as Paid"}
            </Button>
          )}
          {invoice.status !== "UNPAID" &&
            invoice.reservation &&
            invoice.reservation.status === "CHECKED_IN" && (
              <Button
                className="flex items-center gap-x-1 print:hidden"
                variant="ghost"
              >
                <CheckCheck className="h-4" />
                Check out Guest
              </Button>
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

const types = ["Drinks", "Services"];

function AddItemsDialog({
  invoice,
}: {
  invoice: Prisma.InvoiceGetPayload<{ include: { guest: true } }>;
}) {
  const [category, setCategory] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<ItemWithQuantity[]>([]);
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
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <PlusSquare className="h-4" /> Add Items{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Invoice</DialogTitle>
          <DialogDescription>Add Items to the invoice.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[70vh] gap-4 overflow-y-scroll py-4">
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
                      item.category !== "INGREDIENT"
                    );
                  } else if (category === "Services") {
                    return (
                      item.category === "TICKETS" ||
                      item.category === "SERVICES"
                    );
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
        <DialogFooter>
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
