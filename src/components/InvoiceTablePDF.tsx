import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

type ReservationWithNestedData = Prisma.ReservationGetPayload<{
  include: {
    room: true;
    orders: {
      include: {
        items: {
          include: {
            item: true;
          };
        };
      };
    };
  };
}>;

// Define the styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderCell: {
    width: "20%",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableCell: {
    width: "20%",
  },
  subTotalRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  subTotalLabel: {
    width: "80%",
    fontWeight: "bold",
    textAlign: "right",
  },
  subTotalValue: {
    width: "20%",
    fontWeight: "bold",
  },
});

const InvoiceTablePDF = ({
  reservation,
}: {
  reservation: ReservationWithNestedData;
}) => {
  return (
    <Document>
      <Page style={styles.page} orientation="landscape">
        <Text style={styles.heading}>Reservation Details</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Summary</Text>
          <Text style={styles.tableHeaderCell}>Sub-Total USD</Text>
        </View>

        <View style={styles.tableRow}>
          <Text>
            {reservation.room?.roomType} Room,{" "}
            {dayjs(reservation.checkIn).format("DD/MM/YYYY")} -{" "}
            {dayjs(reservation.checkOut).format("DD/MM/YYYY")}
          </Text>
          <Text>{reservation.subTotalUSD?.toString()}</Text>
        </View>

        {/* {reservation.orders.map((order) => (
          <View key={order.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{order.id}</Text>
            {order.items &&
              order.items.map((item) => (
                <Text key={item.id}>{item.item.name}</Text>
              ))}
          </View>
        ))} */}

        <View style={styles.subTotalRow}>
          <Text style={styles.subTotalLabel}>Subtotal (Reservation):</Text>
          <Text style={styles.subTotalValue}>
            {reservation.subTotalUSD?.toString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTablePDF;
