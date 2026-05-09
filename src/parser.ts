import type { DateMode, DateFormat, DateOrder, ColorFormat, DateResult, ColorResult, ScheduleDay } from "./types";

function parseDateStr(value: string, order: DateOrder): string {
  const parts = value.split("-");
  if (order === "ymd") return `${parts[0]}-${parts[1]}-${parts[2]}`;
  if (order === "dmy") return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return `${parts[2]}-${parts[0]}-${parts[1]}`; // mdy
}

export function parseDate(
  value: string,
  opts: { mode?: DateMode; format?: DateFormat; order?: DateOrder } = {},
): DateResult {
  const { mode = "date", format = "default", order = "ymd" } = opts;
  const result: DateResult = {};

  if (format === "unix-s" || format === "unix-ms") {
    const parts = value.split("_");
    const mul = format === "unix-s" ? 1000 : 1;
    const ts = parseInt(parts[0]!, 10);
    result.timestamp = ts;
    const dt = new Date(ts * mul);
    result.date = dt.toISOString().slice(0, 10);
    result.time = dt.toISOString().slice(11, 16);
    if (parts.length > 1) {
      const tsEnd = parseInt(parts[1]!, 10);
      result.timestampEnd = tsEnd;
      const dtEnd = new Date(tsEnd * mul);
      result.dateEnd = dtEnd.toISOString().slice(0, 10);
      result.timeEnd = dtEnd.toISOString().slice(11, 16);
    }
    return result;
  }

  switch (mode) {
    case "date":
      result.date = parseDateStr(value, order);
      break;
    case "time": {
      const [h, m] = value.split("-");
      result.time = `${h}:${m}`;
      break;
    }
    case "datetime": {
      const [datePart, timePart] = value.split("_");
      result.date = parseDateStr(datePart!, order);
      const [h, m] = timePart!.split("-");
      result.time = `${h}:${m}`;
      break;
    }
    case "date-range": {
      const parts = value.split("_");
      result.date = parseDateStr(parts[0]!, order);
      result.dateEnd = parseDateStr(parts[1]!, order);
      break;
    }
    case "time-range": {
      const parts = value.split("_");
      const [h1, m1] = parts[0]!.split("-");
      const [h2, m2] = parts[1]!.split("-");
      result.time = `${h1}:${m1}`;
      result.timeEnd = `${h2}:${m2}`;
      break;
    }
  }

  return result;
}

export function parseColor(value: string, opts: { format?: ColorFormat } = {}): ColorResult {
  const { format = "hex" } = opts;
  const result: ColorResult = { raw: value };
  if (format === "hex") {
    result.hex = `#${value}`;
  } else if (format === "rgb") {
    const parts = value.split("_").map(Number);
    result.rgb = [parts[0]!, parts[1]!, parts[2]!];
  } else if (format === "hsl") {
    const parts = value.split("_").map(Number);
    result.hsl = [parts[0]!, parts[1]!, parts[2]!];
  }
  return result;
}

export function parseSchedule(value: string): ScheduleDay[] {
  if (value.length !== 56) {
    throw new Error(`Schedule bunch format must be 56 chars, got ${value.length}`);
  }
  const days: ScheduleDay[] = [];
  for (let i = 0; i < 7; i++) {
    const chunk = value.slice(i * 8, (i + 1) * 8);
    if (chunk === "00000000") {
      days.push({ enabled: false });
    } else {
      days.push({
        enabled: true,
        start: `${chunk.slice(0, 2)}:${chunk.slice(2, 4)}`,
        end: `${chunk.slice(4, 6)}:${chunk.slice(6, 8)}`,
      });
    }
  }
  return days;
}
