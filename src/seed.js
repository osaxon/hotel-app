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
            id: "clivydazb0000v0059kmb0a00",
            name: "Draft Lager",
            priceUSD: "2",
            category: "BEER",
          },
          {
            id: "clivydazb0001v005tcxt6umx",
            name: "Can Lager",
            priceUSD: "2",
            category: "BEER",
          },
          {
            id: "clivydazb0002v0057ys62hzz",
            name: "Coca Cola",
            priceUSD: "2",
            category: "SOFT_DRINKS",
          },
          {
            id: "clivydazb0003v005g3v6h9ef",
            name: "House Spirit + Mixer",
            priceUSD: "3",
            category: "SPIRITS",
          },
          {
            id: "clivydazb0004v005unnn98ym",
            name: "House Red Wine",
            priceUSD: "4",
            category: "WINE",
          },
        ],
        skipDuplicates: true,
      }),

      prisma.room.createMany({
        data: [
          {
            id: "clivxfkat0005v0shujgaz7qe",
            roomNumber: "2",
            roomType: "STANDARD",
            capacity: 2,
            roomName: "Whiskey",
          },
          {
            id: "clivxfkat0006v0shu7vdxicu",
            roomNumber: "3",
            roomType: "STANDARD",
            capacity: 2,
            roomName: "Billy",
          },
          {
            id: "clivxfkat0007v0shcu0mdx7s",
            roomNumber: "4",
            roomType: "DELUXE",
            capacity: 4,
            roomName: "Lool",
          },
          {
            id: "clivxfkat0008v0sh95azcs5m",
            roomNumber: "5",
            roomType: "SUPERIOR",
            capacity: 5,
            roomName: "June",
          },
        ],
        skipDuplicates: true,
      }),
    ]);

    const reservations = Array.from({ length: 5 }, () => {
      const { checkIn, checkOut } = getRandomFutureDate();
      return {
        customerName: faker.name.findName(),
        checkIn,
        checkOut,
      };
    });

    await prisma.reservation.createMany({
      data: reservations,
    });

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
