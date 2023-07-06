import { formatCurrency, getDurationOfStay, getRateTotal } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import dayjs from "dayjs";

type InvoiceWithRelatedData = Prisma.InvoiceGetPayload<{
  include: {
    reservation: { include: { reservationItem: true } };
    guest: true;
    orders: { include: { items: { include: { item: true } } } };
  };
}>;

export const InvoiceEmailTemplate = ({
  invoiceData,
}: {
  invoiceData: InvoiceWithRelatedData;
}) => {
  const { reservation } = invoiceData;
  let duration;
  let rateTotals;
  let formattedReservationTotal;
  let formattedRateTotal;
  if (reservation && reservation.reservationItem) {
    duration = getDurationOfStay(reservation.checkIn, reservation.checkOut);
    formattedReservationTotal = formatCurrency({
      amount: Number(reservation.subTotalUSD),
    });
    rateTotals = getRateTotal(duration, reservation.reservationItem);
    formattedRateTotal = formatCurrency({ amount: rateTotals.value });
  }

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Guest Invoice</Preview>
        <Body>
          <Container>
            <Section>
              <Text>Invoice for {invoiceData.customerName}</Text>
            </Section>
            <Section>
              <Row>
                <Column className="w-32">
                  <Text>Desc</Text>
                </Column>
                <Column className="w-32">
                  <Text>Date</Text>
                </Column>
                <Column className="w-32">
                  <Text>Qty</Text>
                </Column>
                <Column className="w-32">
                  <Text>Unit Price</Text>
                </Column>
                <Column className="w-32">
                  <Text>Sub-Total USD</Text>
                </Column>
                <Column className="w-32">
                  <Text>Sub-Total KHR</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text>
                    {invoiceData.reservation?.reservationItem?.descForInvoice}
                  </Text>
                </Column>
                <Column>
                  <Text>
                    {invoiceData.reservation &&
                      dayjs(invoiceData.reservation.createdAt).format(
                        "DD MMM YY"
                      )}
                  </Text>
                </Column>
                <Column>
                  <Text>{duration}</Text>
                </Column>
                <Column>
                  <Text>{formattedRateTotal}</Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};
