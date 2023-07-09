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
      <CardContent className="flex flex-col items-center justify-center md:flex-row">
        <p>{appConfig.vatLabel}</p>
        <p>{appConfig.vatNumber}</p>
      </CardContent>
    </Card>
  );
}
