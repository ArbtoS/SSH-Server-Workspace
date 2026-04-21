function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toLocalIsoString(date = new Date()): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absOffset / 60);
  const offsetRemainder = absOffset % 60;

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
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
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);

  const timePart = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: false
  }).format(date);

  const zonePart = new Intl.DateTimeFormat("de-DE", {
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
