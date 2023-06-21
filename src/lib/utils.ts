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
