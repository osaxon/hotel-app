import { ReservationItem } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import dayjs, { type Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { twMerge } from "tailwind-merge";

dayjs.extend(isBetween);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToNormalCase(text: string): string {
  const words = text.split("_");
  const normalizedWords = words.map((word) => {
    const lowerCaseWord = word.toLowerCase();
    const firstLetter = lowerCaseWord.charAt(0).toUpperCase();
    return firstLetter + lowerCaseWord.slice(1);
  });
  return normalizedWords.join(" ");
}

function isTimeBetween(startTime: Dayjs, endTime: Dayjs): boolean {
  const currentTime = dayjs();
  return currentTime.isBetween(startTime, endTime);
}

export function isHappyHour(): boolean {
  const startTime = dayjs().set("hour", 12).set("minute", 30).set("second", 0);
  const endTime = dayjs().set("hour", 20).set("minute", 30).set("second", 0);
  return isTimeBetween(startTime, endTime);
}

export function getDurationOfStay(checkIn: Date, checkOut: Date) {
  const startDate = dayjs(checkIn);
  const endDate = dayjs(checkOut);
  return endDate.diff(startDate, "day");
}

export function getRateTotal(duration: number, resItem: ReservationItem) {
  // No long term discounts added for breakfast included
  if (resItem.boardType === "BREAKFAST") {
    return {
      desc: `${duration} nts w/BREAKFAST @ $${resItem.dailyRateUSD.toString()}.`,
      value: Number(resItem.dailyRateUSD) * duration,
    };
    // Monthly rate
  } else if (duration >= 28) {
    return {
      desc: `${duration} nts @ MONTHLY rate.`,
      value: Number(resItem.monthlyRate),
    };
    // Weekly rate
  } else if (duration >= 7) {
    return {
      desc: `${duration} nts @ WEEKLY rate.`,
      value: Number(resItem.weeklyRate),
    };
  } else {
    return {
      desc: `${duration} nts @ $${resItem.dailyRateUSD.toString()}.`,
      value: Number(resItem.dailyRateUSD) * duration,
    };
  }
}
