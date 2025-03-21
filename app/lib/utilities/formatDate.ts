import { DateTime } from "luxon";

// Add these to your date utilities if needed
export const formatDateTime = (date: Date | string) =>
  DateTime.fromISO(date.toString()).toLocaleString(DateTime.DATETIME_MED);

export const formatRelativeTime = (date: Date | string) =>
  DateTime.fromISO(date.toString()).toRelative();
