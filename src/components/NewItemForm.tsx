import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/utils/api";
import { ItemCategory } from "@prisma/client";
import { convertToNormalCase } from "@/lib/utils";
import { LoadingPage } from "./loading";

const FormSchema = z.object({
  name: z.string(),
  priceUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Price must be a valid number",
      path: ["priceUSD"],
    })
    .transform((value) => parseFloat(value)),
  happyHourPriceUSD: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Happy hour price must be a valid number",
      path: ["happyHourPriceUSD"],
    })
    .transform((value) => parseFloat(value))
    .optional(),
  category: z.nativeEnum(ItemCategory),
});

export default function NewItemForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { mutate: addItem, status } = api.pos.addItem.useMutation({
    onSuccess: () => form.reset(),
    onError: (error) =>
      toast({
        title: "The error:",
        description: (
          <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(error, null, 2)}</code>
          </pre>
        ),
      }),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const parsedData = {
      ...data,
      priceUSD: Number(data.priceUSD),
      happyHourPriceUSD: Number(data.happyHourPriceUSD),
    };
    addItem(parsedData);
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(parsedData, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  if (status === "loading") return <LoadingPage />;

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

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="priceUSD"
            render={({ field }) => (
              <FormItem className="w-1/3">
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
              <FormItem className="w-1/3">
                <FormLabel>Happy Hour Price USD</FormLabel>
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
