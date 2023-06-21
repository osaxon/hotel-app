// @ts-nocheck

const { PrismaClient } = require("@prisma/client");
const faker = require("faker");
const prisma = new PrismaClient();

const getRandomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const getRandomFutureDate = () => {
  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + 30
  );
  const checkInDate = getRandomDate(currentDate, futureDate);
  const checkOutDate = new Date(
    checkInDate.getFullYear(),
    checkInDate.getMonth(),
    checkInDate.getDate() + Math.floor(Math.random() * 30) + 1
  );
  return {
    checkIn: checkInDate,
    checkOut: checkOutDate,
  };
};

const seed = async () => {
  try {
    await prisma.$transaction([
      prisma.item.createMany({
        data: [
          {
            name: "Draft Lager",
            priceUSD: "2",
            category: "BEER",
            quantityUnit: "Glass",
          },
          {
            name: "Can Lager",
            priceUSD: "2",
            category: "BEER",
            quantityUnit: "Can",
          },
          {
            name: "Coca Cola",
            priceUSD: "2",
            category: "SOFT_DRINKS",
            quantityUnit: "Can",
          },
          {
            name: "House Red Wine",
            priceUSD: "4",
            category: "WINE",
            quantityUnit: "Glass",
          },
        ],
        skipDuplicates: true,
      }),

      prisma.room.createMany({
        data: [
          {
            roomNumber: "2",
            roomType: "STANDARD",
            capacity: 2,
            roomName: "Whiskey",
            status: "VACANT",
          },
          {
            roomNumber: "3",
            roomType: "STANDARD",
            capacity: 2,
            roomName: "Billy",
            status: "VACANT",
          },
          {
            roomNumber: "4",
            roomType: "DELUXE",
            capacity: 4,
            roomName: "Lool",
            status: "VACANT",
          },
          {
            roomNumber: "5",
            roomType: "SUPERIOR",
            capacity: 5,
            roomName: "June",
            status: "VACANT",
          },
        ],
        skipDuplicates: true,
      }),
    ]);

    const reservations = Array.from({ length: 8 }, () => {
      const { checkIn, checkOut } = getRandomFutureDate();
      return {
        guestName: faker.name.findName(),
        checkIn,
        checkOut,
      };
    });

    await prisma.reservation.createMany({
      data: reservations,
    });

    const guests = Array.from({ length: 4 }, () => {
      const firstName = faker.name.firstName();
      const surname = faker.name.lastName();
      return {
        firstName,
        surname,
        fullName: firstName + " " + surname,
        email: faker.internet.email(),
      };
    });

    await prisma.guest.createMany({ data: guests });

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
