const displayTimeZone = "Europe/Berlin";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function getZonedDateParts(date: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: displayTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
}

function getBerlinOffsetMinutes(date: Date): number {
  const parts = getZonedDateParts(date);
  const zonedUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return Math.round((zonedUtc - date.getTime()) / 60000);
}

export function toLocalIsoString(date = new Date()): string {
  const parts = getZonedDateParts(date);
  const offsetMinutes = getBerlinOffsetMinutes(date);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absOffset / 60);
  const offsetRemainder = absOffset % 60;

  return [
    parts.year,
    "-",
    parts.month,
    "-",
    parts.day,
    "T",
    parts.hour,
    ":",
    parts.minute,
    ":",
    parts.second,
    sign,
    pad(offsetHours),
    ":",
    pad(offsetRemainder)
  ].join("");
}

export function formatDisplayDate(value: string | undefined, includeSeconds = false): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const datePart = new Intl.DateTimeFormat("de-DE", {
    timeZone: displayTimeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);

  const timePart = new Intl.DateTimeFormat("de-DE", {
    timeZone: displayTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: false
  }).format(date);

  const zonePart = new Intl.DateTimeFormat("de-DE", {
    timeZone: displayTimeZone,
    timeZoneName: "short"
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value
    .replace("MESZ", "CEST")
    .replace("MEZ", "CET");

  return zonePart ? `${datePart} ${timePart} ${zonePart}` : `${datePart} ${timePart}`;
}

export function compareIsoDesc(left: string | undefined, right: string | undefined): number {
  const leftTime = left ? Date.parse(left) : 0;
  const rightTime = right ? Date.parse(right) : 0;
  return rightTime - leftTime;
}

export function sameSecond(left: string | undefined, right: string | undefined): boolean {
  if (!left || !right) {
    return false;
  }

  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return left === right;
  }

  return Math.floor(leftTime / 1000) === Math.floor(rightTime / 1000);
}
