import dayjs from "dayjs";

export function buildDailyIdentifier(prefix: string, count: number, date = new Date()) {
  return `${prefix}-${dayjs(date).format("YYYYMMDD")}-${String(count + 1).padStart(4, "0")}`;
}
