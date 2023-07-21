import { appConfig } from "app.config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function CompanyDetailsCard() {
  return (
    <Card>
      <CardHeader className="items-center justify-center">
        <CardTitle>{appConfig.title}</CardTitle>
        <CardDescription>{appConfig.companyName}</CardDescription>
      </CardHeader>
      <CardContent className="grid w-full grid-cols-1 md:w-2/3 md:grid-cols-2">
        <p>{appConfig.vatLabel}</p>
        <p>{appConfig.vatNumber}</p>
        <p>{appConfig.addressLabel}</p>
        <p>{appConfig.address}</p>
      </CardContent>
    </Card>
  );
}
