import AdminLayout from "@/components/LayoutAdmin";
import NewItemForm from "@/components/NewItemForm";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Beer, ChefHat } from "lucide-react";
import type { NextPage } from "next";

const NewItemPage: NextPage = () => {
  return (
    <AdminLayout>
      <section className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Add Item</h2>
        </div>
        <div>
          <p>Complete this form to create a new item in the database.</p>
        </div>
        <RadioGroup
          defaultValue="normal"
          className="grid w-full grid-cols-2 gap-4 md:w-2/3"
        >
          <Label
            htmlFor="item"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem value="item" id="item" className="sr-only" />
            <Beer />
            <p>Item</p>
          </Label>
          <Label
            htmlFor="ingredient"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
          >
            <RadioGroupItem
              value="ingredient"
              id="ingredient"
              className="sr-only"
            />
            <ChefHat />
            Ingredient
          </Label>
        </RadioGroup>
        <section>
          <NewItemForm />
        </section>
      </section>
    </AdminLayout>
  );
};

export default NewItemPage;
