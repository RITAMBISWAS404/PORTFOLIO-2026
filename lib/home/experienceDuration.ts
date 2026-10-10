// Design experience duration, calculated from a single start date, so it never has to be updated by hand.
// Calendar months (not milliseconds / 365), so leap years and month lengths cannot skew it.

export const DESIGN_EXPERIENCE_START = new Date(2024, 0, 1); // 1 January 2024 (local time)

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

/** Whole calendar months elapsed between `start` and `now` (0 if `now` is earlier). */
export function monthsBetween(start: Date, now: Date): number {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1; // the current month is not complete yet
  return Math.max(0, months);
}

/** "2 years 6 months", "1 year 1 month", "3 years" (no "0 months"), "5 months" (under a year). */
export function formatDuration(start: Date, now: Date = new Date()): string {
  const total = monthsBetween(start, now);
  const years = Math.floor(total / 12), months = total % 12;
  if (years === 0) return plural(months, "month");
  return months === 0 ? plural(years, "year") : `${plural(years, "year")} ${plural(months, "month")}`;
}
