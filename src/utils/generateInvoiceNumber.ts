import { prisma } from "@/server/db";

export async function generateInvoiceNumber() {
  // Find the latest invoice number from the database
  const latestInvoice = await prisma.invoice.findFirst({
    orderBy: { invoiceNumber: "desc" },
  });

  let invoiceNumber: number;

  if (latestInvoice) {
    // Increment the latest invoice number by 1
    invoiceNumber = parseInt(latestInvoice.invoiceNumber!, 10) + 1;
  } else {
    // Use the starting number if no invoice exists
    invoiceNumber = 2000;
  }

  // Format the invoice number with leading zeros
  const formattedInvoiceNumber = invoiceNumber.toString().padStart(6, "0");
  return formattedInvoiceNumber;
}
