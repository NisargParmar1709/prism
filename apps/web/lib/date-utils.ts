/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 * This prevents the UTC shift that happens with new Date().toISOString()
 */
export function getLocalToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object without time shifts.
 * This prevents new Date("2023-10-10") from returning Oct 9 in some timezones
 * because ISO parsing defaults to UTC.
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
