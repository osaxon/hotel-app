import { Info } from "lucide-react";

export default function InfoBanner({ text }: { text: string }) {
  return (
    <div className="flex w-full gap-2 rounded-md border border-muted bg-muted p-4 text-muted-foreground md:w-2/3">
      <Info className="mt-[1px] h-6 w-6 shrink-0 text-blue-500" />
      <p>{text}</p>
    </div>
  );
}
