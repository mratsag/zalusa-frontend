const TR_TZ = "Europe/Istanbul";

export function formatTrDate(
  input: string | number | Date | null | undefined,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (input == null || input === "") return "";
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR", {
    timeZone: TR_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...opts,
  });
}

export function formatTrDateTime(
  input: string | number | Date | null | undefined,
  opts?: Intl.DateTimeFormatOptions
): string {
  if (input == null || input === "") return "";
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("tr-TR", {
    timeZone: TR_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });
}
