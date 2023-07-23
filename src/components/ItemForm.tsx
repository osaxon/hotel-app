import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertToNormalCase } from "@/lib/utils";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemCategory, Prisma } from "@prisma/client";
import { AlertTriangle, PlusCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "./ui/checkbox";
import { toast } from "./ui/use-toast";

type ItemIngredient = {
  id: string;
  name: string;
  quantity: number;
  quantityUnit: string;
};

const FormSchema = z.object({
  name: z.string(),
  descForInvoice: z.string(),
  active: z.boolean(),
  stockManaged: z.boolean(),
  displayOnPOS: z.boolean(),
  mixedItem: z.boolean().default(false),
  quantityInStock: z
    .union([z.string().nullable(), z.number().nullable()])
    .refine((value) => value !== null && !isNaN(parseFloat(value as string)), {
      message: "Must be a valid number.",
      path: ["quantityInStock"],
    })
    .transform((value) => parseFloat(value as string)),
  priceUSD: z
    .union([z.string().nullable(), z.number().nullable()])
    .refine((value) => value !== null && !isNaN(parseFloat(value as string)), {
      message: "Must be a valid number.",
      path: ["priceUSD"],
    })
    .transform((value) => parseFloat(value as string)),
  happyHourPriceUSD: z
    .union([z.string().nullable(), z.number().nullable()])
    .refine((value) => value !== null && !isNaN(parseFloat(value as string)), {
      message: "Must be a valid number.",
      path: ["happyHourPriceUSD"],
    })
    .transform((value) => parseFloat(value as string)),
  staffPriceUSD: z
    .union([z.string().nullable(), z.number().nullable()])
    .refine((value) => value !== null && !isNaN(parseFloat(value as string)), {
      message: "Must be a valid number.",
      path: ["staffPriceUSD"],
    })
    .transform((value) => parseFloat(value as string)),
  category: z.nativeEnum(ItemCategory),
});

export default function ItemForm({
  item,
}: {
  item: Prisma.ItemGetPayload<{
    include: { ingredients: { include: { ingredient: true } } };
  }>;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: item.name,
      descForInvoice: item.descForInvoice ?? "",
      priceUSD: Number(item.priceUSD),
      happyHourPriceUSD: Number(item.happyHourPriceUSD),
      staffPriceUSD: Number(item.staffPriceUSD),
      quantityInStock: Number(item.quantityInStock),
      category: item.category,
      active: item.active,
      stockManaged: item.stockManaged,
      displayOnPOS: item.displayOnPOS,
    },
  });

  const { mutate: updateItem, isLoading } = api.pos.updateItem.useMutation({
    onSuccess: (data) => {
      toast({
        description: "Item updated",
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    updateItem({ id: item.id, ...data });
  }

  useEffect(() => {
    if (item.quantityInStock !== null) {
      form.setValue("quantityInStock", Number(item.quantityInStock));
    }
    if (item.priceUSD !== null) {
      form.setValue("priceUSD", Number(item.priceUSD));
    }
    if (item.happyHourPriceUSD !== null) {
      form.setValue("happyHourPriceUSD", Number(item.happyHourPriceUSD));
    }
    if (item.staffPriceUSD !== null) {
      form.setValue("staffPriceUSD", Number(item.staffPriceUSD));
    }
  }, [form, item]);

  const qtyInStock = form.watch("quantityInStock");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descForInvoice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                This is how the item will appear on on the invoice.
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="priceUSD"
            render={({ field }) => (
              <FormItem className="md:w-1/3">
                <FormLabel>Price USD</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="happyHourPriceUSD"
            render={({ field }) => (
              <FormItem className="md:w-1/3">
                <FormLabel>Happy Hour Price USD</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="staffPriceUSD"
            render={({ field }) => (
              <FormItem className="md:w-1/3">
                <FormLabel>Staff Price Price USD</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-1/3">
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ItemCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {convertToNormalCase(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-end gap-3">
          <FormField
            control={form.control}
            name="quantityInStock"
            render={({ field }) => (
              <FormItem className="md:w-1/3">
                <FormLabel>In Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex gap-1"
              onClick={() => form.setValue("quantityInStock", qtyInStock + 1)}
            >
              <PlusCircle className="h-4 w-4" />
              Add 1
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex gap-1"
              onClick={() => form.setValue("quantityInStock", qtyInStock + 10)}
            >
              <PlusCircle className="h-4 w-4" />
              Add 10
            </Button>
          </div>
        </div>

        <div>
          <div>
            <h3 className="my-4 text-lg font-bold">Item Options</h3>
          </div>
          <div className="rounded-md border">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive items won&apos;t appear on the POS menu.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockManaged"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={item.ingredients.length > 0}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Track Inventory</FormLabel>
                    <FormDescription>
                      Controls whether an items stock levels are tracked.{" "}
                      {item.ingredients.length > 0 && (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Disabled for mixed items.
                        </span>
                      )}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayOnPOS"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Display on POS</FormLabel>
                    <FormDescription>
                      Controls whether an item can be purchased at the bar.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {item.ingredients.length > 0 && (
          <div>
            <h3 className="my-4 text-lg font-bold">Ingredients</h3>
            <div className="flex flex-col gap-4">
              {item.ingredients.map((item) => (
                <div className="flex flex-col rounded border p-4" key={item.id}>
                  <p>{item.name}</p>
                  <p>
                    {item.quantity?.toString()} {item.quantityUnit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
