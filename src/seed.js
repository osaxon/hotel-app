// @ts-nocheck

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

      prisma.reservationItem.createMany({
        data: [
          {
            description: "Deluxe Poolview",
            descForInvoice: "ទិដ្ឋភាពអាងហែលទឹកពិសេស Deluxe Poolview Room",
            roomType: "DELUXE",
            boardType: "NONE",
            roomVariant: "POOL_VIEW",
          },
          {
            description: "Deluxe Poolview with Breakfast",
            descForInvoice:
              "ទិដ្ឋភាពអាងហែលទឹកពិសេស ជាមួយអាហារពេលព្រឹក Deluxe Poolview with breakfast",
            roomType: "DELUXE",
            boardType: "BREAKFAST",
            roomVariant: "POOL_VIEW",
          },
          {
            description: "Deluxe Room",
            descForInvoice: "បន្ទប់ពិសេស Deluxe Room",
            roomType: "DELUXE",
            boardType: "NONE",
            roomVariant: "NONE",
          },
          {
            description: "Deluxe Room with Breakfast",
            descForInvoice:
              "បន្ទប់ពិសេសជាមួយអាហារពេលព្រឹក Deluxe Room with Breakfast",
            roomType: "DELUXE",
            boardType: "BREAKFAST",
            roomVariant: "NONE",
          },
          {
            description: "Superior Poolview",
            descForInvoice: "ទិដ្ឋភាពអាងហែលទឹកដ៏អស្ចារ្យ Superior Poolview",
            roomType: "SUPERIOR",
            boardType: "NONE",
            roomVariant: "POOL_VIEW",
          },
          {
            description: "Superior Poolview with Breakfast",
            descForInvoice:
              "ទិដ្ឋភាពអាងហែលទឹកដ៏អស្ចារ្យ ជាមួយនឹងអាហារពេលព្រឹក Superior Poolview with Breakfast",
            roomType: "SUPERIOR",
            boardType: "BREAKFAST",
            roomVariant: "POOL_VIEW",
          },
          {
            description: "Superior Poolside",
            descForInvoice: "ចំហៀងអាងហែលទឹកដ៏អស្ចារ្យ Superior Poolside",
            roomType: "SUPERIOR",
            boardType: "NONE",
            roomVariant: "POOL_SIDE",
          },
          {
            description: "Superior Poolside with Breakfast",
            descForInvoice:
              "ចំហៀងអាងហែលទឹកដ៏អស្ចារ្យ ជាមួយអាហារពេលព្រឹក Superior Poolside with Breakfast",
            roomType: "SUPERIOR",
            boardType: "BREAKFAST",
            roomVariant: "POOL_SIDE",
          },
          {
            description: "Monthly Room",
            descForInvoice: "បន្ទប់ប្រចាំខែ Monthly Room",
            roomType: "SUPERIOR",
            boardType: "NONE",
            roomVariant: "NONE",
          },
          {
            description: "Weekly Room",
            descForInvoice: "បន្ទប់ប្រចាំសប្តាហ៍ Weekly Room",
            roomType: "SUPERIOR",
            boardType: "NONE",
            roomVariant: "NONE",
          },
        ],
      }),
    ]);

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
