import { DateTime } from "luxon";

// Add these to your date utilities if needed
export const formatDateTime = (date: Date | string) => {
  const dateString = date.toString();

  // Try parsing as ISO first
  let dateTime = DateTime.fromISO(dateString);

  // If invalid, try parsing the format "YYYY-MM-DD HH:mm:ss"
  if (!dateTime.isValid) {
    dateTime = DateTime.fromFormat(dateString, "yyyy-MM-dd HH:mm:ss");
  }

  // If still invalid, try parsing as SQL format
  if (!dateTime.isValid) {
    dateTime = DateTime.fromSQL(dateString);
  }

  // If still invalid, fallback to JavaScript Date parsing
  if (!dateTime.isValid) {
    dateTime = DateTime.fromJSDate(new Date(dateString));
  }

  return dateTime.isValid
    ? dateTime.toLocaleString(DateTime.DATETIME_MED)
    : "Invalid Date";
};

export const formatRelativeTime = (date: Date | string) => {
  const dateString = date.toString();

  // Try parsing as ISO first
  let dateTime = DateTime.fromISO(dateString);

  // If invalid, try parsing the format "YYYY-MM-DD HH:mm:ss"
  if (!dateTime.isValid) {
    dateTime = DateTime.fromFormat(dateString, "yyyy-MM-dd HH:mm:ss");
  }

  // If still invalid, try parsing as SQL format
  if (!dateTime.isValid) {
    dateTime = DateTime.fromSQL(dateString);
  }

  // If still invalid, fallback to JavaScript Date parsing
  if (!dateTime.isValid) {
    dateTime = DateTime.fromJSDate(new Date(dateString));
  }

  return dateTime.isValid ? dateTime.toRelative() : "Invalid Date";
};
