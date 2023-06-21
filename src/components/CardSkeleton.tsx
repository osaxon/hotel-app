import { Skeleton } from "@/components/ui/skeleton";
import { BedDouble } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Checked In Guests</CardTitle>
        <BedDouble className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-12 w-12 rounded-full" />
      </CardContent>
    </Card>
  );
}
