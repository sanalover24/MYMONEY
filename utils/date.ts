/**
 * Converts a Date object to a 'YYYY-MM-DD' string, correctly handling timezone offsets.
 * Standard `toISOString().slice(0, 10)` can be off by a day depending on the user's timezone.
 * @param date The date to convert.
 * @returns The formatted date string.
 */
export const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Splits an ISO 8601 date string into date ('YYYY-MM-DD') and time ('HH:mm') parts, in the user's local timezone.
 * @param isoString The full ISO date string.
 * @returns An object with date and time strings.
 */
export const getISODateParts = (isoString: string): { date: string; time: string } => {
  const dateObj = new Date(isoString);
  const date = toYYYYMMDD(dateObj); // Use existing safe function for the date part
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  return { date, time };
};

/**
 * Checks if two Date objects represent the same calendar day.
 * @param d1 The first date.
 * @param d2 The second date.
 * @returns True if they are the same day, false otherwise.
 */
export const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};
